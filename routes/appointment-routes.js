const express = require('express');
const { createAppointment, updateAppointment, getAppointmentList } = require('../controller/appointment-controller');

const auth = require("../auth/auth");
const router = express.Router();

router.post("/create-appointment",auth.verify,createAppointment);

router.put("/update-appointment/:appId",auth.verify,updateAppointment);

router.get("/appointment-list",auth.verify,getAppointmentList);


module.exports = router;