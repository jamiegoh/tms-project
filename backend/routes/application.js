const express = require('express');
const router = express.Router();

const { getApplications, createApplication, updateApplication, getAppPermits } = require('../controllers/applicationController');


router.get('/get', getApplications);
router.post('/create', createApplication);
router.put('/update', updateApplication);
router.get('/get/permissions/:appid', getAppPermits);



module.exports = router;