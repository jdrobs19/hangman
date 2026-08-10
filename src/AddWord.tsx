import { useState } from 'react'

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
    <form onSubmit={submit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input
        value={word}
        onChange={(e) => setWord(e.target.value)}
        placeholder="Add a new word"
        aria-label="New word"
        style={{ flex: 1, padding: '0.5rem' }}
      />
      <button type="submit" disabled={loading || word.trim() === ''}>
        {loading ? 'Adding…' : 'Add'}
      </button>
      {error && <div style={{ color: 'red', marginLeft: '0.5rem' }}>{error}</div>}
    </form>
  )
}

export default AddWord