const express = require('express');
const auth = require("../auth/auth");
const findAssistantsForSenior = require('../controller/senior-controller');
const router = express.Router();

router.get("/find-assistants",auth.verify,findAssistantsForSenior)

module.exports = router;