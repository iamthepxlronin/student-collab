const express = require('express')
const router = express.Router()
const { createPost, getAllPosts, getMyPosts, getSinglePost, deletePost, updatePostStatus } = require('../controllers/postController')
const { protect } = require('../middleware/authMiddleware')

router.post('/', protect, createPost)
router.get('/', protect, getAllPosts)
router.get('/my-posts', protect, getMyPosts)
router.get('/:id', protect, getSinglePost)
router.delete('/:id', protect, deletePost)
router.patch('/:id', protect, updatePostStatus)

module.exports = router