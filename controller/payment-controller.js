const Payment = require("../model/Payment");

const processPayment = async(req,res,next)=>{
    
    const {paymentMethod} = req.body;
    try{
        await Payment.create({
            paymentMethod:paymentMethod
        })
    }catch(e){
        next(e);
    }
}

module.exports = {
    processPayment
}