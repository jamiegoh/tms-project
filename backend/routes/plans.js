const express = require('express');
const router = express.Router();

const  {createPlan, getPlans} = require('../controllers/planController');
const { checkForPM } = require('../middleware/permissions');

const db = require('../db');

router.post("/:appid/create", checkForPM, createPlan);
router.get("/get/:appid", getPlans);

module.exports = router;