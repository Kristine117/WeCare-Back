const Appointment = require("../model/Appointment");
const Payment = require("../model/Payment");
const Billings = require("../model/Billings");
const sequelize = require("../db/dbconnection");
const { exportDecryptedData } = require("../auth/secure");
const { QueryTypes } = require("sequelize");

const processPayment = async(req,res,next)=>{
    const {userId} = req.user
    const {paymentMethod,appointmentId,processedPaymentId} = req.body;

    try{
        const convertedAppId = await exportDecryptedData(appointmentId);

        const dateNow = new Date();

        const composedTime = `${dateNow.getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds()}`;
        
        const queryAppDetails = await sequelize.query(`
            select e.totalAmount,e.numberOfHours,
        DATEDIFF(e.enddate, e.startdate) as countDays from Appointment e
        where e.appointmentId = :appId`,
        {replacements:{appId:+convertedAppId},
        type: QueryTypes.SELECT})
        

        const {totalAmount,numberOfHours,countDays} = queryAppDetails[0]
        const hoursBilled = numberOfHours * countDays;
       const createPayment = await sequelize.transaction(async(t)=>{

           const paymentCreated = await Payment.create({
                paymentMethod:paymentMethod,
                appointmentId:+convertedAppId,
                processedPaymentId:processedPaymentId,
                payerId: userId
            },{transaction: t})

            await Billings.create({
                appointmentId:+convertedAppId,
                time:composedTime,
                serviceProvided: "Some Service",
                hoursBilled: hoursBilled,
                payMethod:paymentMethod,
                totalPay:totalAmount
            },{transaction:t})


            return paymentCreated

       })
    
        await Appointment.update({
            statusId: 3
        },{
            where:{
                appointmentId:+convertedAppId
            }
        })

       res.status(201).send({
        isSuccess: true,
        message: "Successfully paid the appointment"
    })
    }catch(e){

        next(e);
    }
}

module.exports = {
    processPayment
}