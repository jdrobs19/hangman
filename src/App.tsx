import { useCallback, useEffect, useState } from 'react'
import { HangmanDrawing } from './HangmanDrawing'
import { HangmanWord } from './HangmanWord'
import { Keyboard } from './Keyboard'
import AddWord from './AddWord'
import './App.css'

function App() {

  const [words, setWords] = useState<string[]>([])
  const [wordToGuess, setWordToGuess] = useState('')
  const [guessedLetters, setGuessedLetters] = useState<string[]>([])
  const incorrectLetters = guessedLetters.filter(
    letter => !wordToGuess.includes(letter)
  )

  const isLoss = incorrectLetters.length >= 6
  const isWin = wordToGuess.split("").every(letter => guessedLetters.includes(letter))

  // Calculate progress
  const correctLetters = guessedLetters.filter(letter => wordToGuess.includes(letter))
  const progressPercent = wordToGuess ? (correctLetters.length / wordToGuess.length) * 100 : 0

  const addGuessedLetter = useCallback((letter: string) => {
    if(guessedLetters.includes(letter) || isLoss || isWin) return

    setGuessedLetters(currentLetters => [...currentLetters, letter])
  }, [guessedLetters, isLoss, isWin])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()

      if (isLoss || isWin) return
      if (!key.match(/^[a-z]$/)) return

      e.preventDefault()
      addGuessedLetter(key)
    }

    document.addEventListener("keypress", handler)

    return () => {
      document.removeEventListener("keypress", handler)
    }
  }, [addGuessedLetter, isLoss, isWin])

  useEffect(() => {
    let mounted = true
    fetch('/api/words')
      .then(res => res.json())
      .then((data: string[]) => {
        if (!mounted) return
        setWords(data)
        if (!wordToGuess && data.length) {
          setWordToGuess(data[Math.floor(Math.random() * data.length)])
        }
      }).catch(() => {})

    return () => { mounted = false }
  }, [])

  const handleAddWord = (word: string) => {
    setWords(prev => [...prev, word])
  }

  const getProgressBarClass = () => {
    if (isWin) return ''
    if (progressPercent < 33) return 'danger'
    if (progressPercent < 66) return 'warning'
    return ''
  }

  return (
    <div className="app-container">
      <div className={`status-message ${isWin ? 'win' : isLoss ? 'loss' : 'neutral'}`}>
        {isWin && "🎉 You win! Refresh for a new word."}
        {isLoss && "😔 Try again! Refresh for a new word."}
        {!isWin && !isLoss && "🎮 Hangman Game"}
      </div>

      {wordToGuess && (
        <div className="progress-section">
          <div className="progress-label">
            <span>Letters Guessed</span>
            <span>{correctLetters.length} / {wordToGuess.length}</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className={`progress-bar ${getProgressBarClass()}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="add-word-section">
        <AddWord onAdd={handleAddWord} />
      </div>
      
      <div className="game-content">
        <div className="hangman-container">
          <HangmanDrawing numberOfGuesses={incorrectLetters.length} />
        </div>
        <HangmanWord reveal={isLoss} guessedLetters={guessedLetters} wordToGuess={wordToGuess}/>
        <div className="keyboard-section">
          <Keyboard 
            disabled = {isWin || isLoss}
            activeLetters={guessedLetters.filter(letter => 
              wordToGuess.includes(letter)
            )}
            inactiveLetters={incorrectLetters}
            addGuessedLetter = {addGuessedLetter}
            />
        </div>
      </div>
    </div>
  )
}

export default App
