const pool = require('../config/db')

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, department, level, skills, bio, contact_info FROM users WHERE id = $1',
      [req.user.id]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

const updateProfile = async (req, res) => {
  const { full_name, department, level, skills, bio, contact_info } = req.body

  try {
    const result = await pool.query(
      `UPDATE users 
       SET full_name = $1, department = $2, level = $3, skills = $4, bio = $5, contact_info = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING id, full_name, email, department, level, skills, bio, contact_info`,
      [full_name, department, level, skills, bio, contact_info, req.user.id]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { getProfile, updateProfile }