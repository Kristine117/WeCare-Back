const express = require("express");
const {retrieveNotifs} = require ("../controller/notification-controller")
const router = express.Router();

router.get("/getAllNotifs", retrieveNotifs);

module.exports = router;