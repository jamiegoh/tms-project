const express = require('express');
const router = express.Router();

const { getTasks, createTask, updateTask, getDetailedTask } = require('../controllers/taskController');
const { checkAppPermit } = require('../middleware/permissions');

router.get("/get/:appid", getTasks);
router.get("/get/details/:id", getDetailedTask);
router.post("/:appid/create", createTask);
router.put("/update/:id", checkAppPermit, updateTask);

module.exports = router;