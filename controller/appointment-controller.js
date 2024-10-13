const Appointment = require("../model/Appointment");
const Status = require("../model/Status");
const Payment = require("../model/Payment");
const UserProfile = require("../model/UserProfile");
const Experience = require("../model/Experience");
const sequelize = require("../db/dbconnection");
const { exportDecryptedData } = require("../auth/secure");
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
                totalAmount: assistantRate * numberOfHours,
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
        const {userId} = req.body;

        const appointmentList = await sequelize.query(
            `select e.appointmentId,e.totalAmount,e.numberOfHours,
            g.statusDescription from Appointment e
            inner join UserProfile f
            on e.seniorId = :userId
            inner join Status g
            on e.statusId = g.statusId
            `,{
                replacements: { userId: userId },
                type: QueryTypes.SELECT
            }
        )

        
        res.status(201).send({
            isSuccess: true,
            message: "Successfully Retrieve Appointment List",
            data: appointmentList
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