import express from 'express'
import cors from 'cors'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const WORDS_PATH = path.join(__dirname, 'src', 'wordList.json')

async function readWords() {
  const raw = await fs.readFile(WORDS_PATH, 'utf-8')
  return JSON.parse(raw)
}

async function writeWords(words) {
  await fs.mkdir(path.dirname(WORDS_PATH), { recursive: true })
  await fs.writeFile(WORDS_PATH, JSON.stringify(words, null, 2), 'utf-8')
}

app.get('/api/words', async (req, res) => {
  try {
    const words = await readWords()
    res.json(words)
  } catch (err) {
    res.status(500).json({ error: 'Could not read words' })
  }
})

app.post('/api/words', async (req, res) => {
  try {
    const { word } = req.body
    if (typeof word !== 'string') return res.status(400).json({ error: 'Invalid payload' })

    const normalized = word.trim().toLowerCase()
    if (!/^[a-z]+$/.test(normalized)) return res.status(400).json({ error: 'Word must contain only letters' })

    const words = await readWords()
    if (words.includes(normalized)) return res.status(409).json({ error: 'Word already exists' })

    words.push(normalized)
    await writeWords(words)

    res.status(201).json({ word: normalized })
  } catch (err) {
    console.error('Could not save word', err)
    res.status(500).json({ error: 'Could not save word' })
  }
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`)
})
