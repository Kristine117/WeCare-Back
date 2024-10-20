const express = require('express');
const auth = require("../auth/auth");
const { adminHeaderCardsDetails, 
    showUsers, showRatings, 
    showPendingListOfAssistantAccountApplication,
     manageUsers, manageRatings, 
     validateAssistantAccountRegisteration } = require('../controller/admin-controller');

const router = express.Router();

router.get("/admin-cards/details",auth.verify,adminHeaderCardsDetails)

router.get("/user-list",auth.verify
    ,showUsers
);

router.get("/ratings-list",auth.verify,showRatings);


router.get("/assistant-applicants",auth.verify,showPendingListOfAssistantAccountApplication);

router.put("/user-manage/:userId",auth.verify,manageUsers);

router.put("/ratings-manage/:ratingId",auth.verify,manageRatings);

router.put("/assistant-applicant/:applicantId",auth.verify,validateAssistantAccountRegisteration);

module.exports = router;