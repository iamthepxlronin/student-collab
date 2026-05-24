const pool = require('../config/db')

const applyToPost = async (req, res) => {
  const { message } = req.body
  const post_id = req.params.id
  const applicant_id = req.user.id

  try {
    // Check if post exists
    const post = await pool.query(
      'SELECT * FROM collaboration_posts WHERE id = $1',
      [post_id]
    )

    if (post.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' })
    }

    // Prevent applying to own post
    if (post.rows[0].user_id === applicant_id) {
      return res.status(400).json({ message: 'You cannot apply to your own post' })
    }

    // Prevent duplicate applications
    const existingApplication = await pool.query(
      'SELECT * FROM applications WHERE post_id = $1 AND applicant_id = $2',
      [post_id, applicant_id]
    )

    if (existingApplication.rows.length > 0) {
      return res.status(400).json({ message: 'You have already applied to this post' })
    }

    const result = await pool.query(
      `INSERT INTO applications (post_id, applicant_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [post_id, applicant_id, message]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

const getApplicationsForPost = async (req, res) => {
  const post_id = req.params.id

  try {
    // Make sure only the post owner can see applications
    const post = await pool.query(
      'SELECT * FROM collaboration_posts WHERE id = $1',
      [post_id]
    )

    if (post.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' })
    }

    if (post.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view these applications' })
    }

    const result = await pool.query(
      `SELECT a.*, u.full_name, u.email, u.department, u.level, u.skills, u.bio
       FROM applications a
       JOIN users u ON a.applicant_id = u.id
       WHERE a.post_id = $1
       ORDER BY a.created_at DESC`,
      [post_id]
    )

    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

const acceptApplication = async (req, res) => {
  const application_id = req.params.id

  try {
    const application = await pool.query(
      `SELECT a.*, cp.user_id as post_owner_id
       FROM applications a
       JOIN collaboration_posts cp ON a.post_id = cp.id
       WHERE a.id = $1`,
      [application_id]
    )

    if (application.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' })
    }

    if (application.rows[0].post_owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const result = await pool.query(
      `UPDATE applications SET status = 'accepted', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [application_id]
    )

    // Reveal contact info of accepted applicant
    const applicant = await pool.query(
      'SELECT full_name, email, contact_info FROM users WHERE id = $1',
      [application.rows[0].applicant_id]
    )

    res.json({
      application: result.rows[0],
      contact_info: applicant.rows[0]
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

const rejectApplication = async (req, res) => {
  const application_id = req.params.id

  try {
    const application = await pool.query(
      `SELECT a.*, cp.user_id as post_owner_id
       FROM applications a
       JOIN collaboration_posts cp ON a.post_id = cp.id
       WHERE a.id = $1`,
      [application_id]
    )

    if (application.rows.length === 0) {
      return res.status(404).json({ message: 'Application not found' })
    }

    if (application.rows[0].post_owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    const result = await pool.query(
      `UPDATE applications SET status = 'rejected', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [application_id]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { applyToPost, getApplicationsForPost, acceptApplication, rejectApplication }