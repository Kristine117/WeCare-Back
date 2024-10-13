const Appointment = require("../model/Appointment");
const Status = require("../model/Status");
const Payment = require("../model/Payment");

const createAppointment = async(req,res,next)=>{
    const {
        assistantId,
        appointmentDate,
        serviceDate,
        startDate,
        endDate,
        numberOfHours,
        totalAmount,
        serviceDescription
    } = req.body;
    
    try{

        const newStatus = await Status.create({
            statusDescription: "0"
        })

        const {userId} = req.user;

        await Appointment.create({
            seniorId: userId,
            assistantId:assistantId,
            appointmentDate:appointmentDate,
            serviceDate:serviceDate,
            startDate:startDate,
            endDate:endDate,
            statusId: newStatus.dataValues.statusId,
            numberOfHours:numberOfHours,
            totalAmount:totalAmount,
            serviceDescription:serviceDescription
        })

        
        res.status(201).send({
            isSuccess: true,
            message: "Successfully Created Appointment"
        })
    }catch(e){
        next(e);
    }
}

const updateAppointment = (req,res,next)=>{
    try{

        

    }catch(e){
        next(e)
    }
}

const getAppointment = ()=>{

}

module.exports = {
    createAppointment,
    updateAppointment
}