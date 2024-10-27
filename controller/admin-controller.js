const { QueryTypes } = require("sequelize");
const sequelize = require("../db/dbconnection");
const Appointment = require("../model/Appointment");
const UserProfile = require("../model/UserProfile");
const { exportEncryptedData } = require("../auth/secure");
const adminHeaderCardsDetails = async( req,res,next)=>{
    try{

        const adminCardDetails = await sequelize.query(
            `select (select count(e.userId) 
            from UserProfile e
            where e.userType <> 'admin')
            as users, (select count(e.appointmentId) 
            from Appointment e)
            as assistance,
            (select count(e.userId) from UserProfile e
            WHERE DATEDIFF(CURDATE(), e.registerDate) >= 30
            and e.userType <> 'admin') as newUsers
            from UserProfile f
            where f.userType = 'admin' limit 1`,
            {type:QueryTypes.SELECT}
        )

        res.status(200).send({
            isSuccess: true,
            message: "Successfully retrieve Admin Dashboard Details",
            data: adminCardDetails
        })

    }catch(e){
        next(e)
    }
}

const manageRatings = async( req,res,next)=>{
    try{    
        res.status(200).send({
            isSuccess: true,
            message: "Successfully remove ratings",
            
        })

    }catch(e){
        next(e)
    }
}

const showRatings = async(req,res,next)=>{
    try{

    }catch(e){
        next(e)
    }
}

const manageUsers = async(req,res,next)=>{
    try{

    }catch(e){
        next(e)
    }
}

const showUsers = async(req,res,next)=>{
    try{

        const allSeniors = await sequelize.query(`
            select e.userId, (concat_ws(" ",e.firstname, 
            e.lastname)) as fullName, e.email, 
            e.userType,e.approveFlg from userprofile e
            where e.userType = 'senior';
            `,{
                type: QueryTypes.SELECT
            })


        const allAssistants = await sequelize.query(`
            select e.userId, (concat_ws(" ",e.firstname, 
            e.lastname)) as fullName, e.email, 
            e.userType,e.approveFlg from userprofile e
            where e.userType = 'assistant';
            `,{
                type: QueryTypes.SELECT
            })

        const newSeniors = allSeniors?.map(async(val)=>{

            val["userId"] = await exportEncryptedData(String(val.userId))
            return val;
        })

        const newAssistants = allAssistants?.map(async(val)=>{
            val["userId"] = await exportEncryptedData(String(val.userId))
            return val;
        })
        
        res.status(201).send({
            isSuccess: true,
            message: "Successfully retrieve all Users",
            data:{
                seniors: await Promise.all(newSeniors),
                assistants: await Promise.all(newAssistants)
            }
        })
    }catch(e){
        next(e)
    }
}

const showPendingListOfAssistantAccountApplication = async(req,res,next)=>{
    try{

        const assistantListPending = await sequelize.query(`
            select e.userId, (concat_ws(" ",e.firstname,
            e.lastname)) as fullName,
            e.profileImage,
            e.approveFlg from UserProfile e
            where e.userType = 'assistant'
            and e.approveFlg = false`,
        {
            type:QueryTypes.SELECT
        })

        const newAssistantList = assistantListPending.map(async(val)=>{
            val["userId"] = await exportEncryptedData(String(val.userId));
            return val;
        })

        const assistantListApproved = await sequelize.query(`
            select e.userId, (concat_ws(" ",e.firstname,
            e.lastname)) as fullName,
            e.profileImage,
            e.approveFlg from UserProfile e
            where e.userType = 'assistant'
            and e.approveFlg = true`,
        {
            type:QueryTypes.SELECT
        })

        const newAssistantListApproved = assistantListApproved.map(async(val)=>{
            val["userId"] = await exportEncryptedData(String(val.userId));
            return val;
        })

        res.status(201).send({
            isSuccess: true,
            message: "Successfully retrieve list of unverified Assistants",
            data:{assistantListPending: await Promise.all(newAssistantList),
                assistantListApproved: await Promise.all(newAssistantListApproved)
            }
        })

    }catch(e){
        next(e)
    }
}

const validateAssistantAccountRegisteration = async(req,res,next)=>{
    try{

    }catch(e){
        next(e)
    }
}


module.exports = {
    adminHeaderCardsDetails,
    manageRatings,
    showRatings,
    manageUsers,
    showUsers,
    showPendingListOfAssistantAccountApplication,
    validateAssistantAccountRegisteration
}