"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"

interface HeartData {
  id: number
  side: 'left' | 'right'
  position: number
  size: number
}

export function FloatingHearts() {
  const [hearts, setHearts] = useState<HeartData[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      // Generar corazón en el lado izquierdo o derecho aleatoriamente
      const side = Math.random() > 0.5 ? 'left' : 'right'
      // Posición en los lados (0-15% para mantenerlos en los bordes)
      const position = Math.random() * 15
      
      const newHeart: HeartData = {
        id: Date.now() + Math.random(),
        side,
        position,
        size: Math.random() * 15 + 20, // Tamaño entre 20-35px
      }

      setHearts((prev) => [...prev, newHeart])

      // Remover corazón después de 1.5 segundos
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== newHeart.id))
      }, 1500)
    }, 3000) // Crear un nuevo corazón cada 3 segundos

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute bottom-0 animate-float-fade"
          style={{
            [heart.side]: `${heart.position}%`,
          }}
        >
          <Heart
            className="text-rose-400 fill-rose-400"
            style={{
              width: `${heart.size}px`,
              height: `${heart.size}px`,
            }}
          />
        </div>
      ))}
    </div>
  )
}
