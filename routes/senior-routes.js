const express = require('express');
const auth = require("../auth/auth");
const { findAssistantsForSenior,getAssistantList, addSenior } = require('../controller/senior-controller');

const router = express.Router();

router.put("/find-assistants",auth.verify,
    auth.verifySenior,findAssistantsForSenior)

router.get("/assistant-list",auth.verify,getAssistantList);

router.post("/add-senior", addSenior);

module.exports = router;