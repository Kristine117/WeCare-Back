const { QueryTypes } = require("sequelize");
const sequelize = require("../db/dbconnection");
const Appointment = require("../model/Appointment");
const UserProfile = require("../model/UserProfile");
const adminHeaderCardsDetails = async( req,res,next)=>{
    try{

        const adminCardDetails = await sequelize(
            `select (select count(e.userId) UserProfile e
            where e.userType <> 'admin')
            as users ,(select count(e.appointmentId) from Appointment e)
            as assistance from UserProfile f
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

    }catch(e){
        next(e)
    }
}

const showPendingListOfAssistantAccountApplication = async(req,res,next)=>{
    try{

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
    showUsers,showPendingListOfAssistantAccountApplication,
    validateAssistantAccountRegisteration
}