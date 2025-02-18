const express = require('express');
const router = express.Router();

const  {createPlan, getPlans} = require('../controllers/planController');

const db = require('../db');

router.post("/:appid/create", createPlan);
router.get("/get/:appid", getPlans);

module.exports = router;