const express = require('express');
const auth = require("../auth/auth");
const { getUserDataUsingAuthenticationToken,
    updateUserHandlerForProfile,retrieveListUserDetails } = require('../controller/user-controller');
const router = express.Router();

router.get("/user-profile",auth.verify,getUserDataUsingAuthenticationToken);

router.put("/user-profile/update",auth.verify,updateUserHandlerForProfile);


router.get("/user-list",auth.verify,retrieveListUserDetails);
module.exports = router;