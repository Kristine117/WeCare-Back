const Reminder = require("../model/Reminder");
const { exportDecryptedData, exportEncryptedData } = require('../auth/secure');

exports.createReminder = async (req,res,next) => {
    const {appointmentId,reminderDate,reminderTime} = req.body;
    const appointmentIdDecrypted =  Number(await exportDecryptedData(appointmentId.trim()));
    try{

        const reminder =  await Reminder.create({
            appointmentId:appointmentIdDecrypted,
            reminderDate:reminderDate,
            reminderTime:reminderTime
        })
        if (reminder) {
            return res.status(200).json({ message: 'Remindercreated successfully' });
        } else {
            return res.status(404).json({ message: 'Failed to create reminder' });
        }
    }catch(error){
        next(error);
        console.log(error)
    }
}