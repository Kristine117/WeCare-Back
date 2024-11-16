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
            // Define the raw SQL query to get reminders due within the next 5 minutes
            const query = `
                SELECT * 
                FROM reminder
                WHERE reminderTime = NOW() 
                AND reminderDate = CURRENT_DATE; 
            `;

            // Execute the raw query
            const [upcomingReminders, metadata] = await sequelize.query(query);

            // If there are upcoming reminders
            if (upcomingReminders.length > 0) {
                console.log(`Upcoming reminders found: ${upcomingReminders.length}`);
                 // Iterate through each reminder
                for (let reminder of upcomingReminders) {
                    // Find the related appointment based on the appointmentId
                    const appointment = await Appointment.findByPk(reminder.appointmentId);

                    if (appointment) {
                        // Create a notification for each reminder
                        await Notification.create({
                            appointmentId: reminder.appointmentId,
                            seniorId: appointment.seniorId,
                            assistantId: appointment.assistantId,
                            statusId: appointment.statusId,
                            readFlag: false,
                            isFromReminder: true,
                            reminderId:reminder.reminderId
                        });
                    } else {
                        console.log(`Appointment not found for reminderId: ${reminder.id}`);
                    }
                }


                // Emit an event for new notifications
                io.emit('newNotifsReceived', {
                    message: "New reminder received",
                    remindersCount: upcomingReminders.length, // You can pass other info as needed
                });
            } else {
                console.log("No upcoming reminders found.");
            }

        } catch (error) {
            console.error('Error processing reminders:', error);
            
        }
    });
};



exports.retrieveNotifs = async (req,res,next) => {
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
    a.readFlag,
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
    a.createdAt  -- Include createdAt field for sorting
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
        a.readFlag,
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
        appointment a ON n.appointmentId = r.appointmentId
    LEFT JOIN 
        userprofile us ON us.userId = a.seniorId
    LEFT JOIN 
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


 const getNotifCounts =async (decryptedUserId)=> {
     try{
        const query = `
        SELECT COUNT(*) AS unreadCount
FROM (
    SELECT 
        a.appointmentId,
        a.seniorId,
        a.assistantId,
        a.statusId,
        a.readFlag,
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
        u.userId = :loggedInUserId
        AND a.isFromReminder = 0
         AND a.readFlag = 0

    UNION ALL

    SELECT 
        a.appointmentId,
        a.seniorId,
        a.assistantId,
        a.statusId,
        a.readFlag,
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
        appointment a ON n.appointmentId = r.appointmentId
    LEFT JOIN 
        userprofile us ON us.userId = a.seniorId
    LEFT JOIN 
        userprofile ua ON ua.userId = a.assistantId
    WHERE 
        ua.userId = :loggedInUserId
        AND r.isFromReminder = 1
        AND r.readFlag = 0
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