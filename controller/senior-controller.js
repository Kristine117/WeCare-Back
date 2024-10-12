const UserProfile = require("../model/UserProfile");
const Ratings = require("../model/Ratings");
const Senior = require("../model/Senior");
const Relationship = require("../model/Relationship");
const {QueryTypes} = require("sequelize");
const sequelize = require("../db/dbconnection");
const { exportEncryptedData } = require("../auth/secure");
const findAssistantsForSenior = async(req,res,next)=>{
    const {ratings,age,gender}=req.query;
    try{ 
        // const results = await User.belo
        
        const results = await sequelize.query(
            `select userid, email, from UserProfile 
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

const addSenior = async(req,res,next)=>{
    const t = await sequelize.transaction();

    try{
        const { userId, seniorNumber, 
            prescribeMeds, healthStatus, 
            remarks } = req.body;

            const result = await sequelize.transaction(async t=> {
                const newSenior = await Senior.create({
                    userId:userId,
                    seniorNumber:seniorNumber,
                    prescribeMeds:prescribeMeds,
                    healthStatus:healthStatus,
                    remarks:remarks
                }, {transaction: t });

                return newSenior;
            })

            res.status(200).send({
                isSuccess:true,
                message:"Successfully Registered New Senior"
            })
    } catch(e){
        next(e);
    }
}

// const addRelationship = async(req,res,next) => {
//     const t = await sequelize.transaction();

//     try{
//         const {seniorId, name, age, relationship, civilstatus,
//             occupation,contactNumber} = req.body;

//         const result = await sequelize.transaction(async t=>{
//             const newRelationShip = await Relationship.create({
//                 seniorId:seniorId,
//                 name:name,
//                 age:age,
//                 relationship:relationship,
//                 civilstatus,
//             },{

//             })
//         })
//     }catch{}
// }

module.exports = {
    findAssistantsForSenior,
    getAssistantList,
    addSenior
}