const express = require('express')
const router = express.Router()
const { applyToPost, getApplicationsForPost, acceptApplication, rejectApplication } = require('../controllers/applicationController')
const { protect } = require('../middleware/authMiddleware')

router.post('/:id/apply', protect, applyToPost)
router.get('/:id/applications', protect, getApplicationsForPost)
router.patch('/:id/accept', protect, acceptApplication)
router.patch ('/:id/reject', protect, rejectApplication)

module.exports = router