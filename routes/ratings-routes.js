const express = require('express');
const auth= require("../auth/auth");
const { createAppointment } = require('../controller/appointment-controller');
const router = express.Router();

router.post("/create-feedback/:appId",auth.verify,auth.verifySenior,createAppointment);

module.exports = router;