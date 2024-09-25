const express = require('express');
const { addNewExperienceHandler } = require('../controller/experience-controller');
const router = express.Router();


router.post("/register-experience",(req,res)=>{
    const data = [
        req.body['num_of_years'],
        req.body['experience_description']
    ]

    const result = addNewExperienceHandler(data);
    return res.send(result);
});


module.exports = router;