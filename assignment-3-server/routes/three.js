const express = require('express');
const router = express.Router();

const {createTask, getTaskbyState, promoteTask2Done} = require('../controllers/threeController');

router.post("/CreateTask", createTask);
router.post("/GetTaskbyState", getTaskbyState);
router.patch("/PromoteTask2Done", promoteTask2Done);
router.all("/*", (req, res) => {
    res.status(400).send({code: "E1001"});
});


module.exports = router;