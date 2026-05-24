const express = require('express')
const router = express.Router()
const { createPost, getAllPosts, getMyPosts, getSinglePost } = require('../controllers/postController')
const { protect } = require('../middleware/authMiddleware')

router.post('/', protect, createPost)
router.get('/', protect, getAllPosts)
router.get('/my-posts', protect, getMyPosts)
router.get('/:id', protect, getSinglePost)

module.exports = router