const UserProfile = require("../model/UserProfile");
const Ratings = require("../model/Ratings");
const {QueryTypes} = require("sequelize");
const sequelize = require("../db/dbconnection");
const { exportEncryptedData } = require("../auth/secure");
const findAssistantsForSenior = async(req,res,next)=>{
    const {ratings,age,gender}=req.query;
    try{ 
        // const results = await User.belo
        
        const results = await sequelize.query(
            `select userId, email, from UserProfile 
            inner join Ratings 
            on userId = assistant_id
            where userId > 0
            and (gender  in (:genderList))
            and ()`,{
                type: QueryTypes.SELECT
            }   
        ) 

        res.status(201).send({
            isSuccess: true,
            message: "Successfully retrieve data",
            data:results
        })
    }catch(e){
        next(e);
    }
}

const getAssistantList = async(req,res,next)=>{
    try{
        const results = await sequelize.query(
            'select userId, email, profileImage, concat_ws(" ",firstName,lastName) as fullName from UserProfile where  userType = "assistant" ',{
                type: QueryTypes.SELECT
            }   
        ) 

        const newResults = await results.map(async(val)=>{

            val.userId = await exportEncryptedData(String(val.userId));

            return val;
        })

        res.status(201).send({
            isSuccess: true,
            message: "Successfully retrieve data",
            data:await Promise.all(newResults)
        })
    }catch(e){
        next(e)
    }
}

module.exports = {
    findAssistantsForSenior,
    getAssistantList
}