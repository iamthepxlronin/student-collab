const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const generateToken = require('../utils/generateToken')

const signup = async (req, res) => {
  const { full_name, email, password } = req.body

  try {
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    )

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    const result = await pool.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email',
      [full_name, email, password_hash]
    )

    const user = result.rows[0]
    const token = generateToken(user.id)

    res.status(201).json({ user, token })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const user = result.rows[0]
    const isMatch = await bcrypt.compare(password, user.password_hash)

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user.id)

    res.json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email
      },
      token
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

const me = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, full_name, email, department, level, skills, bio FROM users WHERE id = $1',
      [req.user.id]
    )
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { signup, login, me }