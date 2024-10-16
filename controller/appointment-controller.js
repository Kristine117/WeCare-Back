const Appointment = require("../model/Appointment");
const Status = require("../model/Status");
const Payment = require("../model/Payment");
const UserProfile = require("../model/UserProfile");
const Experience = require("../model/Experience");
const sequelize = require("../db/dbconnection");
const { exportDecryptedData, exportEncryptedData } = require("../auth/secure");
    const { QueryTypes } = require("sequelize");


const createAppointment = async(req,res,next)=>{
    
    const t = await sequelize.transaction();

    const {
        assistantId,
        appointmentDate,
        serviceDate,
        startDate,
        endDate,
        numberOfHours,
        serviceDescription
    } = req.body;   
    
    try{

        const decAssistantId = Number(await exportDecryptedData(assistantId));

        const result = await sequelize.transaction(async (t)=>{
            const newStatus = await Status.create({
                statusDescription: "0"
            },{transaction: t})
    
            const assistantRate = await sequelize.query(
            `SELECT e.rate from Experience e 
            inner join UserProfile f
            on e.experienceId = f.experienceId
            where f.userId = :userId`,{
                    replacements: { userId: decAssistantId },
                    type: QueryTypes.SELECT
                }   
            ) 
    
            const {userId} = req.user;
    
            await Appointment.create({
                seniorId: userId,
                assistantId:decAssistantId,
                appointmentDate:appointmentDate,
                serviceDate:serviceDate,
                startDate:startDate,
                endDate:endDate,
                statusId: newStatus.dataValues.statusId,
                numberOfHours:numberOfHours,
                totalAmount: assistantRate[0]['rate'] * numberOfHours,
                serviceDescription:serviceDescription
            },{transaction: t})

            return newStatus;
        })


        res.status(201).send({
            isSuccess: true,
            message: "Successfully Created Appointment"
        })
    }catch(e){
        await t.rollback();
        next(e);
    }
}

const updateAppointment = (req,res,next)=>{
    try{

        

    }catch(e){
        next(e)
    }
}   

const getAppointmentList = async(req,res,next)=>{
    try{
        const {userId} = req.user;
        const appointmentList = await sequelize.query(
            `select distinct e.appointmentId,e.assistantId, 
            e.totalAmount,e.serviceDescription,
            e.numberOfHours, g.statusDescription,
            (select concat_ws(" ",ef.firstName, ef.lastName) 
            from UserProfile ef
            where ef.userId = e.assistantId) as assistantName,
            (select ef.profileImage 
            from UserProfile ef
            where ef.userId = e.assistantId) as assistantProfileImage
            from Appointment e
            inner join UserProfile f
            on e.seniorId = :kwanId
            inner join Status g
            on e.statusId = g.statusId
            `,{
                replacements: { kwanId: userId },
                type: QueryTypes.SELECT
            }
        )

        const newAppointmentList = appointmentList.map(async(val)=>{
            val["appointmentId"] = await exportEncryptedData(String(val.appointmentId));
            val["assistantId"] = await exportEncryptedData(String(val.assistantId));
            return val;
        })
        res.status(201).send({
            isSuccess: true,
            message: "Successfully Retrieve Appointment List",
            data: await Promise.all(newAppointmentList)
        })
    }catch(e){
        next(e)
    }
}

module.exports = {
    createAppointment,
    updateAppointment,
    getAppointmentList
}