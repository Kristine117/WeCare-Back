const Appointment = require("../model/Appointment");
const Status = require("../model/Status");
const Payment = require("../model/Payment");

const createAppointment = async(req,res,next)=>{
    const {
        userId,
        appointmentDate,
        serviceDate,
        startDate,
        endDate,
        statusId,
        paymentId,
        numberOfHours,
        totalAmount,
        serviceDescription
    } = req.body;
    
    try{
        await Appointment.create({
            userId:userId,
            appointmentDate:appointmentDate,
            serviceDate:serviceDate,
            startDate:startDate,
            endDate:endDate,
            statusId: statusId,
            paymentId:paymentId,
            numberOfHours:numberOfHours,
            totalAmount:totalAmount,
            serviceDescription:serviceDescription
        })

    }catch(e){
        next(e);
    }
}

module.export = {
    createAppointment
}