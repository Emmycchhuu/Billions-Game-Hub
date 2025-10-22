export const playSound = (soundType) => {
  if (typeof window === "undefined") return

  const audioContext = typeof AudioContext !== "undefined" ? new AudioContext() : null

  if (!audioContext) return

  const sounds = {
    click: () => {
      // Short click sound
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    },
    win: () => {
      // Victory sound - ascending notes
      const oscillator1 = audioContext.createOscillator()
      const oscillator2 = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator1.connect(gainNode)
      oscillator2.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator1.frequency.value = 523.25 // C5
      oscillator2.frequency.value = 659.25 // E5
      oscillator1.type = "sine"
      oscillator2.type = "sine"

      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator1.start(audioContext.currentTime)
      oscillator2.start(audioContext.currentTime + 0.1)
      oscillator1.stop(audioContext.currentTime + 0.3)
      oscillator2.stop(audioContext.currentTime + 0.5)
    },
    lose: () => {
      // Descending sad sound
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3)
      oscillator.type = "sawtooth"

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    },
    hover: () => {
      // Subtle hover sound
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 600
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.05)
    },
  }

  const soundFn = sounds[soundType]
  if (soundFn) {
    try {
      soundFn()
    } catch (error) {
      console.error("Error playing sound:", error)
    }
  }
}
