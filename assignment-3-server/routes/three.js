const express = require('express');
const router = express.Router();

const {createTask, getTaskByState, promoteTask2Done} = require('../controllers/threeController');

router.post("/CreateTask", createTask);
router.post("/GetTaskByState", getTaskByState);
router.patch("/PromoteTask2Done", promoteTask2Done);


module.exports = router;