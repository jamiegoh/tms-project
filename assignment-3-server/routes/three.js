const express = require('express');
const router = express.Router();

const {createTask} = require('../controllers/threeController');

router.post("/CreateTask", createTask);


module.exports = router;