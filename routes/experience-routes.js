const express = require('express');
const { addNewExperienceHandler,getAllExperience } = require('../controller/experience-controller');
const router = express.Router();


router.post("/register-experience",addNewExperienceHandler);

router.get("/registered-experiences",getAllExperience);

module.exports = router;