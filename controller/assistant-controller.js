const { QueryTypes } = require("sequelize");
const sequelize = require("../db/dbconnection");
const UserProfile = require("../model/UserProfile");
const Appointment = require("../model/Appointment");

const showConnectedSeniorList = async(req,res,next)=>{
    try {
        const {userId} = req.user;
        const result = await sequelize.query(`
            select distinct e.userId, e.profileImage, 
            concat_ws(" ",e.firstname, e.lastname)
             from UserProfile e
            inner join Appointment f
            on e.userId = f.seniorId
            where f.assistantId = :userId
            and e.userType = 'senior'`,{
                replacements: {userId:userId},
                type: QueryTypes.SELECT
            })

        res.status(201).send({
            isSuccess: true,
            message: "Successfully retrieved Seniors who are connected to Assistant",
            data: result
        })
    }catch(e){
        next(e)
    }
}

module.exports = {
    showConnectedSeniorList
}