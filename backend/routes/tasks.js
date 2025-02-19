const express = require('express');
const router = express.Router();

const { getTasks, createTask, updateTask, getDetailedTask, releaseTask, workOnTask, returnTaskToToDo, approveTask, reqForExtension, rejectTask, seekApproval, updateNotes, updatePlan, } = require('../controllers/taskController');
const { checkAppPermit } = require('../middleware/permissions');

router.get("/get/:appid", getTasks);
router.get("/get/details/:id", getDetailedTask);
router.post("/:appid/create", createTask);
router.put("/update/notes/:id", checkAppPermit, updateNotes);
router.put("/update/plan/:id", checkAppPermit, updatePlan);


router.post("/release/:id", checkAppPermit, releaseTask);
router.post("/workon/:id", checkAppPermit, workOnTask);
router.post("/returnTask/:id", checkAppPermit, returnTaskToToDo);
router.post("/approval/:id", checkAppPermit, seekApproval);
router.post("/extend/:id", checkAppPermit, reqForExtension);
router.post("/approve/:id", checkAppPermit, approveTask);
router.post("/reject/:id", checkAppPermit, rejectTask);


module.exports = router;