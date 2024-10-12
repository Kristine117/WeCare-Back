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
        numberOfHours,
        totalAmount,
        serviceDescription
    } = req.body;
    
    try{

        // const newStatus = await Status.create({
        //     statusDescription: "0"
        // })

        const {userId} = req.user;
        const appointmentId = req.body.assistantId;
        console.log(userId);
        console.log(appointmentId);
        // await Appointment.create({
        //     userId:userId,
        //     appointmentDate:appointmentDate,
        //     serviceDate:serviceDate,
        //     startDate:startDate,
        //     endDate:endDate,
        //     statusId: newStatus.dataValues.statusId,
        //     numberOfHours:numberOfHours,
        //     totalAmount:totalAmount,
        //     serviceDescription:serviceDescription
        // })
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

module.exports = {
    createAppointment,
    updateAppointment
}