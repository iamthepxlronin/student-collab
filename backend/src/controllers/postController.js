const pool = require('../config/db')

const createPost = async (req, res) => {
  // Added project_type and deadline to destructuring.
  // Destructuring just means we're pulling these specific fields
  // out of req.body (what the frontend sent us) and giving them
  // variable names we can use below.
  const { title, description, required_skills, category, slots_needed, project_type, deadline } = req.body

  try {
    const result = await pool.query(
      // Added project_type and deadline to the INSERT.
      // The $7 and $8 are placeholders — PostgreSQL uses numbered
      // placeholders instead of ? like some other databases.
      // Each $number maps to the corresponding value in the array below.
      `INSERT INTO collaboration_posts 
       (user_id, title, description, required_skills, category, slots_needed, project_type, deadline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, title, description, required_skills, category, slots_needed, project_type || null, deadline || null]
      // project_type || null means: if project_type is an empty string
      // or undefined, store NULL instead. This keeps the database clean —
      // empty strings and NULL mean different things in SQL.
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

const getAllPosts = async (req, res) => {
  try {
    // No changes needed here — SELECT cp.* already returns ALL columns
    // including the new project_type and deadline we just added.
    // The * means "give me everything", so new columns are included automatically.
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
    // No changes needed here either — same reason, * covers new columns.
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
    // No changes needed — * covers new columns here too.
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