const express = require('express');
const auth = require("../auth/auth");
const { findAssistantsForSenior,getAssistantList } = require('../controller/senior-controller');

const router = express.Router();

router.get("/find-assistants",auth.verify,findAssistantsForSenior)

router.get("/assistant-list",auth.verify,getAssistantList);

module.exports = router;