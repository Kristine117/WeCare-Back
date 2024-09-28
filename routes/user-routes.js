const express = require('express');
const auth = require("../auth/auth");
const { getUserDataUsingAuthenticationToken,updateUserHandlerForProfile } = require('../controller/user-controller');
const router = express.Router();

router.get("/user-profile",auth.verify,getUserDataUsingAuthenticationToken);

router.put("/user-profile/update",auth.verify,updateUserHandlerForProfile);

module.exports = router;