import { useCallback, useEffect, useState } from 'react'
import { HangmanDrawing } from './HangmanDrawing'
import { HangmanWord } from './HangmanWord'
import { Keyboard } from './Keyboard'
import AddWord from './AddWord'

function App() {

  const [words, setWords] = useState<string[]>([])
  const [wordToGuess, setWordToGuess] = useState('')
  const [guessedLetters, setGuessedLetters] = useState<string[]>([])
  const incorrectLetters = guessedLetters.filter(
    letter => !wordToGuess.includes(letter)
  )

  const isLoss = incorrectLetters.length >= 6
  const isWin = wordToGuess.split("").every(letter => guessedLetters.includes(letter))

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

  return (
    <div
      style={{
        maxWidth: "800px",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
        margin: "0 auto",
        alignItems: "center"
      }}>
      <div style={{ textAlign: "center", fontSize: "2rem" }}>
      {isWin && "You win! Refresh for a new word."}
      {isLoss && "Try again! Refresh for a new word."}
      </div>
      <div style={{ alignSelf: 'stretch' }}>
        <AddWord onAdd={handleAddWord} />
      </div>
      <HangmanDrawing numberOfGuesses={incorrectLetters.length} />
      <HangmanWord reveal={isLoss} guessedLetters={guessedLetters} wordToGuess={wordToGuess}/>
      <div style={{alignSelf: "stretch"}}>
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
  )
}

export default App
