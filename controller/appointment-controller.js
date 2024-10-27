const Appointment = require("../model/Appointment");
const Status = require("../model/Status");
const Payment = require("../model/Payment");
const UserProfile = require("../model/UserProfile");
const Experience = require("../model/Experience");
const sequelize = require("../db/dbconnection");
const { exportDecryptedData, exportEncryptedData } = require("../auth/secure");
const { QueryTypes} = require("sequelize");


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
            const newStatus = await Status.findOne({
                where:{
                    statusDescription: "Pending"
                }
            })
    
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

const updateAppointment = async(req,res,next)=>{
    const t = await sequelize.transaction();

    try{
        const {appId} = req.params;
        const {servingName,status} =req.body;
        const convertedAppId = await exportDecryptedData(appId)

        const resultParsed = status === 'accept'? "Approved Without Pay": "Rejected";

        const getStatus = await Status.findOne(
            {where: {
                statusDescription: resultParsed
            }   
        }
        )

        await Appointment.update(
            {statusId: getStatus.dataValues?.statusId},
            {
                where: {
                    appointmentId: convertedAppId
                }
            }
        )

        res.status(200).send({
            isSuccess: true,
            message: `Successfully `
        })

    }catch(e){
        console.log("error message")
        console.log(e.message)
        next(e)
    }
}   

const getAppointmentList = async(req,res,next)=>{
    try{
        const {userId} = req.user;
        const loggedinUser = await UserProfile.findOne({
            where:{
                userId: userId
            }
        });

        const statusDescription = createStatusList(req.headers?.status,loggedinUser.dataValues?.userType);
        const userType =  loggedinUser?.dataValues.userType;

        const appointmentList = await sequelize.query(
            `select distinct e.appointmentId, 
            e.totalAmount,e.serviceDescription,
            e.numberOfHours, g.statusId, g.statusDescription,
            (select h.userType from UserProfile h
            where h.userId = :kwanId) as loggedInUserType,
            case 
                when 'senior' = :kwanType then
                (select concat_ws(" ",ef.firstName, ef.lastName) 
                from UserProfile ef
                where ef.userId = e.assistantId)
                else (select concat_ws(" ",ef.firstName, ef.lastName) 
                from UserProfile ef
                where ef.userId = e.seniorId) 
            end as servingName,
            case 
                when 'senior' = :kwanType then
                  (select ef.profileImage 
                    from UserProfile ef
                    where ef.userId = e.assistantId)
                else (select ef.profileImage 
                from UserProfile ef
                where ef.userId = e.seniorId) 
            end as servingProfileImage,
            case 
                when 'senior' = :kwanType then e.assistantId
                else e.seniorId
            end as servingProfileId
            from Appointment e
            inner join UserProfile f
              ON (('senior' = :kwanType AND e.seniorId = :kwanId)
            OR ('senior' != :kwanType AND e.assistantId = :kwanId))
            inner join Status g
            on e.statusId = g.statusId
            where g.statusDescription in (:statusDescription)
            `,{
                replacements: { kwanId: userId,
                    kwanType:userType,statusDescription: statusDescription},
                type: QueryTypes.SELECT
            }
        )

        const newAppointmentList = appointmentList.map(async(val)=>{
            val["appointmentId"] = await exportEncryptedData(String(val.appointmentId));
            val["servingProfileId"] = await exportEncryptedData(String(val.assistantId));
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

function createStatusList(value,userType){
    const statusList = [];
   if(userType === "senior"){
    statusList.push("Pending");
    statusList.push("Approved Without Pay");
    statusList.push("Approved With Pay");
    statusList.push("Rejected");
   }else {
    switch(value){
        case "ongoing":
            statusList.push("Pending");
        
            break;
        default:
            statusList.push("Approved Without Pay");
            statusList.push("Approved With Pay");
            break;
    }
   }

    return statusList;
}

module.exports = {
    createAppointment,
    updateAppointment,
    getAppointmentList
}