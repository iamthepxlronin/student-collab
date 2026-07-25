const express = require('express')
const router = express.Router()
const { applyToPost, getApplicationsForPost, acceptApplication, rejectApplication, getMyApplications, getMyApplication } = require('../controllers/applicationController')
const { protect } = require('../middleware/authMiddleware')

router.get('/my-applications', protect, getMyApplications)
router.post('/:id/apply', protect, applyToPost)
router.get('/:id/applications', protect, getApplicationsForPost)
router.patch('/:id/accept', protect, acceptApplication)
router.patch('/:id/reject', protect, rejectApplication)
router.get('/:id/my-application', protect, getMyApplication)

module.exports = router