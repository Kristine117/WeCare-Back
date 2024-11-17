const sequelize = require("../db/dbconnection");
const { exportDecryptedData } = require("../auth/secure");
const AppointmentRatings = require("../model/AppointmentRatings");

const createFeedback = async(req,res,next)=>{
    try{

        const feedback = await sequelize.transaction(async(t)=>{
            
            const resultFeedback = await AppointmentRatings.create({

            },{transaction:t})

        })

        res.status(200).send({
            isSuccess: true,
            message: "Feedback has been sent successfully!"
        })
        
    }catch(e){
        next(e);
    }
}

module.exports = {
    createFeedback
}