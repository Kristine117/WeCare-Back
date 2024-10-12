const express = require('express');
const { createAppointment, updateAppointment } = require('../controller/appointment-controller');

const auth = require("../auth/auth");
const router = express.Router();

router.post("/create-appointment/:appointmentId",auth.verify,createAppointment);

router.put("/update-appointment/:appointmentId",auth.verify,updateAppointment);

module.exports = router;