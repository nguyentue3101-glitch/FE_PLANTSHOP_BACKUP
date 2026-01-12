import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')))

// Fallback to index.html for all routes (SPA routing)
app.get('*', (req, res) => {
  try {
    const indexPath = join(__dirname, 'dist', 'index.html')
    const indexContent = readFileSync(indexPath, 'utf-8')
    res.setHeader('Content-Type', 'text/html')
    res.send(indexContent)
  } catch (error) {
    console.error('Error serving index.html:', error)
    res.status(500).send('Internal Server Error')
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
