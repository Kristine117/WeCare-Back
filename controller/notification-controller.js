const { exportDecryptedData, exportEncryptedData } = require('../auth/secure');
const Appointment = require("../model/Appointment")
const sequelize = require("../db/dbconnection");

exports.retrieveNotifs = async (req,res,next) => {
    const {userId} = req.body;
    const decryptedUserId =Number(await exportDecryptedData(userId.trim()));
    try{

        const query = `
        SELECT 
            a.*,
            false AS isFromReminder,
            CONCAT(u.firstname, ' ', u.lastname) AS loggedInUserFullName,
            CASE 
                WHEN u.userType = 'senior' THEN CONCAT(ua.firstname, ' ', ua.lastname)
                ELSE CONCAT(us.firstname, ' ', us.lastname)
            END AS otherPersonFullName,
            CASE 
                WHEN u.userType = 'assistant' AND a.statusId = 1 THEN 
                    CONCAT('You have a pending appointment request from ', CONCAT(us.firstname, ' ', us.lastname), ' that needs approval')
                WHEN u.userType = 'assistant' AND a.statusId = 3 THEN 
                    CONCAT('Your appointment with ', CONCAT(us.firstname, ' ', us.lastname), ' has been fully paid')
                WHEN u.userType = 'senior' AND a.statusId = 2 THEN 
                    CONCAT('Your appointment request with ', CONCAT(ua.firstname, ' ', ua.lastname), ' has been approved')
                WHEN u.userType = 'senior' AND a.statusId = 3 THEN 
                    CONCAT('Your appointment with ', CONCAT(ua.firstname, ' ', ua.lastname), ' has been fully paid')
                WHEN u.userType = 'senior' AND a.statusId = 4 THEN 
                    CONCAT('Your appointment request with ', CONCAT(ua.firstname, ' ', ua.lastname), ' has been rejected')
            END AS message
        FROM appointment a
        JOIN userprofile u ON 
            (u.userType = 'senior' AND u.userId = a.seniorId AND a.statusId IN (2, 3, 4))
            OR 
            (u.userType = 'assistant' AND u.userId = a.assistantId AND a.statusId IN (1, 3))
        LEFT JOIN userprofile us ON us.userId = a.seniorId
        LEFT JOIN userprofile ua ON ua.userId = a.assistantId
        WHERE u.userId = :loggedInUserId

        UNION ALL
        SELECT 
            a.*,
                true AS isFromReminder,
                CONCAT(ua.firstname, ' ', ua.lastname) AS loggedInUserFullName,
                CONCAT(us.firstname, ' ', us.lastname)
                AS otherPersonFullName,
                CONCAT('You have set a reminder on your appointmnet  with ', CONCAT(us.firstname, ' ', us.lastname) ,' with a note : ',n.noteContent) AS message
            FROM reminder r
            JOIN note n ON  r.appointmentId = n.appointmentId
            JOIN appointment a  ON r.appointmentId = a.appointmentId
            LEFT JOIN userprofile us ON us.userId = a.seniorId
            LEFT JOIN userprofile ua ON ua.userId = a.assistantId
            WHERE ua.userId =  :loggedInUserId;
    `;
    
        // Use sequelize.query to execute the raw query
        const notifs = await sequelize.query(query, {
            replacements: { loggedInUserId: decryptedUserId }, 
            type: sequelize.QueryTypes.SELECT 
        });

        if(notifs){
            return res.status(200).json({message:"Notifs retrieval successfull",nottifications:notifs})

        } else {
            return res.status(404).json({ message: 'Failed to fetch notifs' });
        }

    }catch(error){
        next(error)
    }
}