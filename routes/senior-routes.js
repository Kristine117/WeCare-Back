const express = require('express');
const auth = require("../auth/auth");
const { findAssistantsForSenior,getAssistantList, addSenior } = require('../controller/senior-controller');

const router = express.Router();

router.get("/find-assistants",auth.verify,findAssistantsForSenior)

router.get("/assistant-list",auth.verify,getAssistantList);

router.post("/add-senior", addSenior);

module.exports = router;