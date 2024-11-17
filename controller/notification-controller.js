const { exportDecryptedData, exportEncryptedData } = require('../auth/secure');
const sequelize = require("../db/dbconnection");
const Appointment = require('../model/Appointment')
const Notification = require('../model/Notification')
const cron = require('node-cron');
const { Reminder } = require('../model/Reminder'); 
const { Op } = require('sequelize');

exports.setupReminderNotifications = (io) => {
    // Schedule task to run every minute
    cron.schedule('* * * * *', async () => {

        console.log('Checking for upcoming reminders...');
        
        try {
        const query = `
            SELECT *
            FROM reminder r
            WHERE (
                r.reminderDate < CURRENT_DATE
                OR (r.reminderDate = CURRENT_DATE AND r.reminderTime <= CONVERT_TZ(NOW(), '+00:00', '+08:00'))
            )
            AND r.reminderId NOT IN (
                SELECT reminderId
                FROM Notification
                WHERE isFromReminder = true
            );
        `;

        const [unrecordedReminders] = await sequelize.query(query);

        if (unrecordedReminders.length > 0) {
            const createdNotifications = [];
            for (let reminder of unrecordedReminders) {
                try {
                    const appointment = await Appointment.findByPk(reminder.appointmentId);
                    if (appointment) {
                        const notification = await Notification.create({
                            appointmentId: reminder.appointmentId,
                            seniorId: appointment.seniorId,
                            assistantId: appointment.assistantId,
                            statusId: appointment.statusId,
                            seniorReadFlag:false,
                            assistantReadFlag:false,
                            isFromReminder: true,
                            reminderId: reminder.reminderId,
                        });
                        createdNotifications.push(notification);
                    } else {
                        console.warn(`Appointment not found for reminderId: ${reminder.reminderId}`);
                    }
                } catch (error) {
                    console.error(`Error processing reminderId ${reminder.reminderId}:`, error);
                }
            }

            if (createdNotifications.length > 0) {
                io.emit('newNotifsReceived', {
                    message: "New reminders received",
                    remindersCount: createdNotifications.length,
                });
            }
        } else {
            console.log("No past reminders found to record.");
        }
    } catch (error) {
        console.error('Error processing reminders:', error);
    }
    });
};


const recordPastReminders = async () => {
    try {
        const query = `
            SELECT *
            FROM reminder r
            WHERE (
                r.reminderDate < CURRENT_DATE
                OR (r.reminderDate = CURRENT_DATE AND r.reminderTime <= CONVERT_TZ(NOW(), '+00:00', '+08:00'))
            )
            AND r.reminderId NOT IN (
                SELECT reminderId
                FROM Notification
                WHERE isFromReminder = true
            );
        `;

        const [unrecordedReminders] = await sequelize.query(query);

        if (unrecordedReminders.length > 0) {
            const createdNotifications = [];
            for (let reminder of unrecordedReminders) {
                try {
                    const appointment = await Appointment.findByPk(reminder.appointmentId);
                    if (appointment) {
                        const notification = await Notification.create({
                            appointmentId: reminder.appointmentId,
                            seniorId: appointment.seniorId,
                            assistantId: appointment.assistantId,
                            statusId: appointment.statusId,
                            seniorReadFlag:false,
                            assistantReadFlag:false,
                            isFromReminder: true,
                            reminderId: reminder.reminderId,
                        });
                        createdNotifications.push(notification);
                    } else {
                        console.warn(`Appointment not found for reminderId: ${reminder.reminderId}`);
                    }
                } catch (error) {
                    console.error(`Error processing reminderId ${reminder.reminderId}:`, error);
                }
            }

            if (createdNotifications.length > 0) {
                io.emit('newNotifsReceived', {
                    message: "New reminders received",
                    remindersCount: createdNotifications.length,
                });
            }
        } else {
            console.log("No past reminders found to record.");
        }
    } catch (error) {
        console.error('Error processing reminders:', error);
    }
};



exports.retrieveNotifs = async (req,res,next) => {
    recordPastReminders();
    const userId = req.headers.userid; // Try using lowercase here
    
    console.log(userId); // Check if this outputs the expected userId
    const decryptedUserId =Number(await exportDecryptedData(userId.trim()));
    try{

    const query = `
     SELECT 
    a.appointmentId,
    a.seniorId,
    a.assistantId,
    a.statusId,
    CASE 
		WHEN u.userType = 'assistant' THEN a.assistantReadFlag
		WHEN u.userType = 'senior' THEN a.seniorReadFlag
        END AS readFlag,
        isFromReminder,
    CONCAT(u.firstname, ' ', u.lastname) AS loggedInUserFullName,
    CASE 
        WHEN u.userType = 'senior' 
            THEN CONCAT(ua.firstname, ' ', ua.lastname)
        ELSE CONCAT(us.firstname, ' ', us.lastname)
    END AS otherPersonFullName,
    CASE 
        WHEN u.userType = 'assistant' AND a.statusId = 1 
            THEN CONCAT('You have a pending appointment request from ', CONCAT(us.firstname, ' ', us.lastname), ' that needs approval')
        WHEN u.userType = 'assistant' AND a.statusId = 3 
            THEN CONCAT('Your appointment with ', CONCAT(us.firstname, ' ', us.lastname), ' has been fully paid')
        WHEN u.userType = 'senior' AND a.statusId = 2 
            THEN CONCAT('Your appointment request with ', CONCAT(ua.firstname, ' ', ua.lastname), ' has been approved')
        WHEN u.userType = 'senior' AND a.statusId = 3 
            THEN CONCAT('Your appointment with ', CONCAT(ua.firstname, ' ', ua.lastname), ' has been fully paid')
        WHEN u.userType = 'senior' AND a.statusId = 4 
            THEN CONCAT('Your appointment request with ', CONCAT(ua.firstname, ' ', ua.lastname), ' has been rejected')
    END AS message,
    a.createdAt  
    FROM 
        Notification a
    JOIN 
        userprofile u ON 
            (u.userType = 'senior' AND u.userId = a.seniorId AND a.statusId IN (2, 3, 4))
        OR 
            (u.userType = 'assistant' AND u.userId = a.assistantId AND a.statusId IN (1, 3))
    LEFT JOIN 
        userprofile us ON us.userId = a.seniorId
    LEFT JOIN 
        userprofile ua ON ua.userId = a.assistantId
    WHERE 
        u.userId =  :loggedInUserId
        AND  a.isFromReminder = 0

    UNION ALL

    SELECT 
        a.appointmentId,
        a.seniorId,
        a.assistantId,
        a.statusId,
		r.assistantReadFlag as readFlag,
        isFromReminder,
        CONCAT(ua.firstname, ' ', ua.lastname) AS loggedInUserFullName,
        CONCAT(us.firstname, ' ', us.lastname) AS otherPersonFullName,
        CONCAT('You have set a reminder on your appointment with ', CONCAT(us.firstname, ' ', us.lastname), ' with a note: ', n.noteContent) AS message,
        r.createdAt  -- Include createdAt field for sorting
    FROM 
        Notification r
    JOIN 
        note n ON r.appointmentId = n.appointmentId 
    JOIN 
        appointment a ON r.appointmentId = a.appointmentId
    
    JOIN 
        userprofile us ON us.userId = a.seniorId
    JOIN 
        userprofile ua ON ua.userId = a.assistantId
    WHERE 
        ua.userId = :loggedInUserId
        AND r.isFromReminder = 1

    ORDER BY
        createdAt DESC;
        
    `;

        // Use sequelize.query to execute the raw query
        const notifs = await sequelize.query(query, {
            replacements: { loggedInUserId: decryptedUserId }, 
            type: sequelize.QueryTypes.SELECT 
        });
      console.log(notifs);
        const count = await getNotifCounts(decryptedUserId);
        console.log("countttt:" + count)

        if (notifs.length > 0 || count > 0) {
            return res.status(200).json({
                message: "Notifications retrieval successful",
                notifications: notifs,
                unreadCount: count,
            });
        } else {
            return res.status(404).json({ message: "No notifications found" });
        }

    }catch(error){
        console.log(error);
        next(error)
    }

   
}

exports.updateNotifReadFlag = async (req, res, next,io) => {
    const { notificationIdPk, userType } = req.body;

    try {
        // Determine the flag to update based on userType
        let updateField = {};
        if (userType === 'assistant') {
            updateField = { assistantReadFlag: true }; // Set the flag you want to update
        } else if (userType === 'senior') {
            updateField = { seniorReadFlag: true };
        } else {
            return res.status(400).json({ error: "Invalid userType" });
        }

        // Update the notification's read flag
        const updatedRows = await Notification.update(
            updateField,
            {
                where: { notificationIdPk } // Condition to find the notification
            }
        );

        // Check if any rows were updated
        if (updatedRows[0] === 0) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.status(200).json({ message: "Read flag updated successfully" });

        io.emit('newNotifsReceived', {
            message: "New unread notifcount received",       
        });

    } catch (error) {
        console.error(error);
        next(error);
    }
};


    const getNotifCounts =async (decryptedUserId)=> {
        try{
            const query = `
            SELECT COUNT(*) AS unreadCount
            FROM (
                SELECT 
                a.notificationId,
                a.appointmentId,
                a.seniorId,
                a.assistantId,
                a.statusId,
                CASE 
                    WHEN u.userType = 'assistant' THEN a.assistantReadFlag
                    WHEN u.userType = 'senior' THEN a.seniorReadFlag
                    END AS readFlag,
                    isFromReminder,
                CONCAT(u.firstname, ' ', u.lastname) AS loggedInUserFullName,
                CASE 
                    WHEN u.userType = 'senior' 
                        THEN CONCAT(ua.firstname, ' ', ua.lastname)
                    ELSE CONCAT(us.firstname, ' ', us.lastname)
                END AS otherPersonFullName,
                CASE 
                    WHEN u.userType = 'assistant' AND a.statusId = 1 
                        THEN CONCAT('You have a pending appointment request from ', CONCAT(us.firstname, ' ', us.lastname), ' that needs approval')
                    WHEN u.userType = 'assistant' AND a.statusId = 3 
                        THEN CONCAT('Your appointment with ', CONCAT(us.firstname, ' ', us.lastname), ' has been fully paid')
                    WHEN u.userType = 'senior' AND a.statusId = 2 
                        THEN CONCAT('Your appointment request with ', CONCAT(ua.firstname, ' ', ua.lastname), ' has been approved')
                    WHEN u.userType = 'senior' AND a.statusId = 3 
                        THEN CONCAT('Your appointment with ', CONCAT(ua.firstname, ' ', ua.lastname), ' has been fully paid')
                    WHEN u.userType = 'senior' AND a.statusId = 4 
                        THEN CONCAT('Your appointment request with ', CONCAT(ua.firstname, ' ', ua.lastname), ' has been rejected')
                END AS message,
                a.createdAt  
                FROM 
                    Notification a
                JOIN 
                    userprofile u ON 
                        (u.userType = 'senior' AND u.userId = a.seniorId AND a.statusId IN (2, 3, 4))
                    OR 
                        (u.userType = 'assistant' AND u.userId = a.assistantId AND a.statusId IN (1, 3))
                LEFT JOIN 
                    userprofile us ON us.userId = a.seniorId
                LEFT JOIN 
                    userprofile ua ON ua.userId = a.assistantId
                WHERE 
                    u.userId =  :loggedInUserId
                    AND  a.isFromReminder = 0

                UNION ALL

                SELECT 
                    r.notificationId,
                    a.appointmentId,
                    a.seniorId,
                    a.assistantId,
                    a.statusId,
                    r.assistantReadFlag as readFlag,
                    isFromReminder,
                    CONCAT(ua.firstname, ' ', ua.lastname) AS loggedInUserFullName,
                    CONCAT(us.firstname, ' ', us.lastname) AS otherPersonFullName,
                    CONCAT('You have set a reminder on your appointment with ', CONCAT(us.firstname, ' ', us.lastname), ' with a note: ', n.noteContent) AS message,
                    r.createdAt  -- Include createdAt field for sorting
                FROM 
                    Notification r
                JOIN 
                    note n ON r.appointmentId = n.appointmentId 
                JOIN 
                    appointment a ON r.appointmentId = a.appointmentId
                
                JOIN 
                    userprofile us ON us.userId = a.seniorId
                JOIN 
                    userprofile ua ON ua.userId = a.assistantId
                WHERE 
                    ua.userId = :loggedInUserId
                    AND r.isFromReminder = 1

                ORDER BY
                    createdAt DESC;
                    AND r.assistantReadFlag = 0
            ) AS CombinedResults


            `;
            const result = await sequelize.query(query, {
                replacements: { loggedInUserId: decryptedUserId },
                type: sequelize.QueryTypes.SELECT,
            });
            console.log(result[0]);
            return result[0]?.unreadCount || 0;
        
        }catch(error){
            console.log(error);
        
        }
    }