const express = require('express');
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { addNewUserHandler } = require('../controller/user-controller');
const router = express.Router();

router.post("/register-user",async(req,res,next)=>{
    const {lastname,firstname,
        email,user_type, street,
        barangay_id,
        contact_number,gender,birthdate,
        
        experience_id,password} = req.body;
    const data = [  
        lastname,firstname,email,user_type,
        street,barangay_id,contact_number,gender,
        birthdate,experience_id
    ]

    const encryptedPassword = await bcrypt.hash(password,saltRounds)

    const data1 =[
        email,
        encryptedPassword
    ]

    try {
        addNewUserHandler(data,data1);

        res.status(200).send({
            message:"It worked well"
        })
    }catch(e){
       next(e)
    }

    
 
});


module.exports = router;