const express = require('express');
const router = express.Router();

const { getApplications, createApplication } = require('../controllers/applicationController');


router.get('/get', getApplications);
router.post('/create', createApplication);



module.exports = router;