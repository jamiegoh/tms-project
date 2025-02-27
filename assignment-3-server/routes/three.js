const express = require('express');
const router = express.Router();

const {createTask, getTaskByState} = require('../controllers/threeController');

router.post("/CreateTask", createTask);
router.post("/GetTaskByState", getTaskByState);


module.exports = router;