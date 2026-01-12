import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Serve static files from dist directory
const distPath = join(__dirname, 'dist')
if (!existsSync(distPath)) {
  console.error('ERROR: dist directory does not exist!')
  console.error('Please run: npm run build')
  process.exit(1)
}

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Serve static files from dist directory (CSS, JS, images, etc.)
app.use(express.static(distPath, {
  maxAge: '1y',
  etag: false
}))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    distExists: existsSync(distPath),
    indexExists: existsSync(join(distPath, 'index.html'))
  })
})

// Fallback to index.html for all routes (SPA routing)
// This MUST be the last route handler
app.get('*', (req, res) => {
  try {
    const indexPath = join(distPath, 'index.html')
    
    console.log(`Serving index.html for route: ${req.path}`)
    
    if (!existsSync(indexPath)) {
      console.error('ERROR: index.html not found in dist directory')
      return res.status(500).send('Build files not found. Please rebuild the application.')
    }
    
    const indexContent = readFileSync(indexPath, 'utf-8')
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache')
    res.send(indexContent)
  } catch (error) {
    console.error('Error serving index.html:', error)
    res.status(500).send('Internal Server Error: ' + error.message)
  }
})

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`)
  console.log(`📁 Serving files from: ${distPath}`)
  console.log(`🌐 Health check: http://localhost:${PORT}/health`)
  console.log(`🔀 SPA routing enabled - all routes will serve index.html`)
})
