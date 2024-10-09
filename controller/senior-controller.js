const User = require("../model/UserProfile");
const Ratings = require("../model/Ratings");
const {QueryTypes} = require("sequelize");
const sequelize = require("../db/dbconnection");
const findAssistantsForSenior = async(req,res,next)=>{

    const {ratings,age,gender}=req.query;

    try{

        // const results = await User.belo
        
        const results = await sequelize.query(
            `select userid, email from User 
            inner join Ratings 
            on userId = assistant_id
            where rating_score > 0`,{
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

module.exports = findAssistantsForSenior