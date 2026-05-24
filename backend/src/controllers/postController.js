const pool = require('../config/db')

const createPost = async (req, res) => {
  const { title, description, required_skills, category, slots_needed } = req.body

  try {
    const result = await pool.query(
      `INSERT INTO collaboration_posts (user_id, title, description, required_skills, category, slots_needed)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, title, description, required_skills, category, slots_needed]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

const getAllPosts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cp.*, u.full_name as creator_name, u.department as creator_department
       FROM collaboration_posts cp
       JOIN users u ON cp.user_id = u.id
       ORDER BY cp.created_at DESC`
    )
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

const getMyPosts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cp.*, 
       COUNT(a.id) as applicant_count
       FROM collaboration_posts cp
       LEFT JOIN applications a ON cp.id = a.post_id
       WHERE cp.user_id = $1
       GROUP BY cp.id
       ORDER BY cp.created_at DESC`,
      [req.user.id]
    )
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

const getSinglePost = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `SELECT cp.*, u.full_name as creator_name, u.department as creator_department
       FROM collaboration_posts cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { createPost, getAllPosts, getMyPosts, getSinglePost }