'use client'

import { useEffect, useRef } from 'react'

export default function ConfettiAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    const particles: any[] = []
    
    // Golden and Copper colors
    const colors = ['#897449', '#DAA520', '#B8860B', '#FFD700', '#F0E68C']

    const resize = () => {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }

    class Particle {
      x: number
      y: number
      color: string
      size: number
      speedY: number
      speedX: number
      rotation: number
      rotationSpeed: number

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * -canvas!.height
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.size = Math.random() * 10 + 5
        this.speedY = Math.random() * 3 + 2
        this.speedX = Math.random() * 2 - 1
        this.rotation = Math.random() * 360
        this.rotationSpeed = Math.random() * 5 - 2.5
      }

      update() {
        this.y += this.speedY
        this.x += this.speedX
        this.rotation += this.rotationSpeed
        if (this.y > canvas!.height) {
          this.y = -10
          this.x = Math.random() * canvas!.width
        }
      }

      draw() {
        ctx!.save()
        ctx!.translate(this.x, this.y)
        ctx!.rotate((this.rotation * Math.PI) / 180)
        ctx!.fillStyle = this.color
        ctx!.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 2)
        ctx!.restore()
      }
    }

    for (let i = 0; i < 150; i++) {
        particles.push(new Particle())
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.update()
        p.draw()
      })
      animationFrameId = requestAnimationFrame(animate)
    }

    window.addEventListener('resize', resize)
    resize()
    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[60]"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
