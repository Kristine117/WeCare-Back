const express = require('express');
const auth = require("../auth/auth");
const { showConnectedSeniorList } = require('../controller/assistant-controller');

const router = express.Router();

router.get("/connected/senior-list",auth.verify,auth.verifyAssistant,showConnectedSeniorList);

module.exports = router;