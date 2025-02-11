const express = require('express');
const router = express.Router();

const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

router.get("/get", getTasks);
router.post("/createTask", createTask);
router.put("/update/:id", updateTask);

module.exports = router;