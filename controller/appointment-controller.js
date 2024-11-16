const Appointment = require("../model/Appointment");
const Status = require("../model/Status");
const Payment = require("../model/Payment");
const UserProfile = require("../model/UserProfile");
const Experience = require("../model/Experience");
const sequelize = require("../db/dbconnection");
const { exportDecryptedData, exportEncryptedData } = require("../auth/secure");
const { QueryTypes} = require("sequelize");
const {io} = require("../index")

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
        const {userId} = req.user;
        const currentDate = new Date();
        const currentDateConversion = `${currentDate.getFullYear()}-${currentDate.getMonth()+1}-${currentDate.getDate()}`;

        const dateSelected = new Date(serviceDate);
        const dateSelectedConversion = `${dateSelected.getFullYear()}-${dateSelected.getMonth()+1}-${dateSelected.getDate()}`;

        if(currentDateConversion !== dateSelectedConversion){
            return res.status(200).send({
                isSuccess: false,
                message: "Date Input does not match with Current Date"
            })
        }

        if(new Date(startDate) > new Date(endDate)){
            return res.status(200).send({
                isSuccess: false,
                message: "Start Date cannot be greater than End Date"
            })
        }

        if(new Date(startDate) < new Date(serviceDate) || new Date(endDate) < new Date(serviceDate)){
            return res.status(200).send({
                isSuccess: false,
                message: "Neither Start Date or End Date be less than Service Date"
            })
        }

        if(+numberOfHours > 8){
            return res.status(200).send({
                isSuccess: false,
                message: "Number of Hours cannot exceed more than eight hours"
            })
        }

        const countExisting = await sequelize.query(`
            select count(e.appointmentId) as counted from appointment e
            where e.seniorId = :userId
            and ((
            e.startDate >= :startDate and e.endDate <= :endDate)or(
            e.startDate = :startDate) or
            e.endDate = :endDate)`,{
                replacements:{
                    userId:userId,
                    startDate:startDate,
                    endDate:endDate
                },
                type:QueryTypes.SELECT
            })
            const newCount = countExisting[0]["counted"];
        
        const decAssistantId = Number(await exportDecryptedData(assistantId));
        
        if(newCount >0){
            return res.status(200).send({
                isSuccess: false,
                message: "You have conflicting schedule with this new appointment."
            })
        }


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
        console.log('Emitting testEvent'); // Add this line
        console.log('Emitting testEvent'); // Add this line
        console.log('Emitting testEvent'); // Add this line
        console.log('Emitting testEvent'); // Add this line
        console.log('Emitting testEvent'); // Add this line
        console.log('Emitting testEvent'); // Add this line
        console.log('Emitting testEvent'); // Add this line
        console.log('Emitting testEvent'); // Add this line
        console.log('Emitting testEvent'); // Add this line
        console.log('Emitting testEvent'); // Add this line

        // io.emit('testEvent', {
        //     message: "New message received"
        // });
      
    }catch(e){
        await t.rollback();
        next(e);
    }
}

const updateAppointment = async(req,res,next)=>{
    const t = await sequelize.transaction();

    try{
        const {appId} = req.params;
        const {servingName,result} =req.body;
        const convertedAppId = await exportDecryptedData(appId)

        const resultParsed = result === 'accept'? "Approved Without Pay": "Rejected";

        console.log(appId);
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

        io.emit('newNotifsReceived', {
            message: "New message received"
        });
       
    }catch(e){
        console.log("error message")
        console.log(e.message)
        next(e)
    }
}   

const getAppointmentList = async(req,res,next)=>{
    try{
        const {userId} = req.user;
        const {status} = req.body;
        const loggedinUser = await UserProfile.findOne({
            where:{
                userId: userId
            }
        });
        const statusDescription = createStatusList(status,loggedinUser.dataValues?.userType);
        const userType =  loggedinUser?.dataValues.userType;
 
        const appointmentList = await sequelize.query(
            `select e.appointmentId, 
            e.totalAmount,e.serviceDescription,
            e.numberOfHours, g.statusId, g.statusDescription, e.assistantId,
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
            end as servingProfileId,
            case 
                when curdate() > e.endDate then true
                else false
            end as isExpired
            from Appointment e
            inner join UserProfile f
             on (case
				when 'assistant' = :kwanType then e.assistantId
                else e.seniorId
                end ) = f.userId
            inner join Status g
            on e.statusId = g.statusId
            where g.statusDescription in (:statusDescription)
            and (case
				when 'assistant' = :kwanType then e.assistantId
                else e.seniorId
                end ) = :kwanId
            `,{
                replacements: { kwanId: userId,
                    kwanType:userType,statusDescription: statusDescription},
                type: QueryTypes.SELECT
            }
        )

        const newAppointmentList = appointmentList.map(async(val)=>{
            val["appointmentId"] = await exportEncryptedData(String(val.appointmentId));
            val["servingProfileId"] = await exportEncryptedData(String(val.assistantId));
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