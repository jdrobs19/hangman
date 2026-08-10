import { useState } from 'react'
import './AddWord.css'

type Props = {
  onAdd: (word: string) => void
}

export function AddWord({ onAdd }: Props) {
  const [word, setWord] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalized = word.trim().toLowerCase()
    if (!/^[a-z]+$/.test(normalized)) {
      setError('Use letters only')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: normalized }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'Failed to add word')
      } else {
        onAdd(normalized)
        setWord('')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="add-word-form">
      <input
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Add a new word..."
        aria-label="New word"
        className="add-word-input"
        autoFocus
      />
      <button type="submit" disabled={loading || word.trim() === ''} className="add-word-button">
        {loading ? '⏳ Adding…' : '➕ Add'}
      </button>
      {error && <div className="add-word-error">{error}</div>}
    </form>
  )
}

export default AddWord