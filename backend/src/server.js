const express = require('express')
const cors = require('cors')
require('dotenv').config()
require('./config/db')

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')
const applicationRoutes = require('./routes/applicationRoutes')

const app = express()

app.use(cors({
  origin: ['http://127.0.0.1:5500', 'https://student-collab-xi-vercel.app'],
  credentials: true
}))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/applications', applicationRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Student Collaboration API is running' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})