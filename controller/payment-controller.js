	// Adyen Node API Library v18.0.0
// Require the parts of the module you want to use
const { Client, CheckoutAPI } = require('@adyen/api-library');
// Initialize the client object
// For the live environment, additionally include your liveEndpointUrlPrefix.
const client = new Client({apiKey: "ADYEN_API_KEY", environment: "TEST"});

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