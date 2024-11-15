const Appointment = require("../model/Appointment");
const Payment = require("../model/Payment");
const sequelize = require("../db/dbconnection");
const processPayment = async(req,res,next)=>{
    const {userId} = req.user
    const {paymentMethod,appointmentId,processedPaymentId} = req.body;
    try{
        console.log(await req)
    //    await sequelize.transaction(async(t)=>{

    //         await Payment.create({
    //             paymentMethod:paymentMethod,
    //             appointmentId:appointmentId,
    //             processedPaymentId:processedPaymentId,
    //             payerId: userId
    //         },{transaction: t})

    //         await Appointment.update({
    //             statusId: 4
    //         },{transaction: t})



    //    })
    }catch(e){
        next(e);
    }
}

module.exports = {
    processPayment
}