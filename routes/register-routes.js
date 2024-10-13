const express = require('express');

const { addNewUserHandler,grabSession,fetchAllEmails } = require('../controller/user-controller');
const router = express.Router();

router.post("/register-user",addNewUserHandler);

router.get("/register-user",grabSession);

router.get("/get-all-email", fetchAllEmails);

module.exports = router;