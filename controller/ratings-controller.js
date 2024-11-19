const sequelize = require("../db/dbconnection");
const { exportDecryptedData } = require("../auth/secure");
const AppointmentRatings = require("../model/AppointmentRatings");
const Ratings = require("../model/Ratings");
const createFeedback = async(req,res,next)=>{
  
    try{
        const {appId} = req.params;
        const {rating,comments} = req.body;
        const convertedAppId = await exportDecryptedData(appId);
        
        if(+rating ===0){
            return res.status(200).send({
                isSuccess: false,
                message: "Rating must have a value"
            })
        }


        const ratingValues = await Ratings.findOne({
            where: {
                ratingsId: +rating
            }
        })

        const feedback = await sequelize.transaction(async(t)=>{
            
            const resultFeedback = await AppointmentRatings.create({
                appointmentId: +convertedAppId,
                ratingsId: ratingValues.dataValues.ratingsId,
                comments:comments
            },{transaction:t})

    
            return resultFeedback;
        })

        

        res.status(200).send({
            isSuccess: true,
            message: "Feedback has been sent successfully!"
        })
        
    }catch(e){
        console.log("Ang message")
        console.log(e.message)
        next(e);
    }
}

module.exports = {
    createFeedback
}