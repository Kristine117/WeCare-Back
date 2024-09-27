const express = require('express');

const { addNewUserHandler } = require('../controller/user-controller');
const router = express.Router();

router.post("/register-user",addNewUserHandler);


module.exports = router;