const express = require('express');

const { addNewUserHandler,grabSession } = require('../controller/user-controller');
const router = express.Router();

router.post("/register-user",addNewUserHandler);

router.get("/register-user",grabSession);


module.exports = router;