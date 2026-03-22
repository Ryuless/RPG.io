import { useEffect, useRef, useState } from 'react'

export default function VirtualJoystick({ onMove, onActionDown, onActionUp }) {
  const baseRef = useRef(null)
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 })
  const centerRef = useRef({ x: 0, y: 0 })
  const draggingRef = useRef(null)

  useEffect(() => {
    const measureCenter = () => {
      if (baseRef.current) {
        const rect = baseRef.current.getBoundingClientRect()
        centerRef.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        }
      }
    }
    measureCenter()
    window.addEventListener('resize', measureCenter)
    return () => window.removeEventListener('resize', measureCenter)
  }, [])

  const handleDragStart = (e) => {
    e.preventDefault()
    const touch = e.changedTouches ? e.changedTouches[0] : e
    if (!draggingRef.current) {
      draggingRef.current = touch.identifier ?? 'mouse'
      handleDragMove(e)
    }
  }

  const handleDragMove = (e) => {
    e.preventDefault()
    const touches = e.changedTouches ? Array.from(e.changedTouches) : [e]
    const touch = touches.find((t) => (t.identifier ?? 'mouse') === draggingRef.current)
    
    if (touch && baseRef.current) {
      const rect = baseRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      let startX = touch.clientX - centerX
      let startY = touch.clientY - centerY
      
      const maxRadius = rect.width / 2

      const dist = Math.hypot(startX, startY)
      if (dist > maxRadius) {
        startX = (startX / dist) * maxRadius
        startY = (startY / dist) * maxRadius
      }

      setStickPos({ x: startX, y: startY })

      if (dist > 0) {
        onMove({ x: startX / maxRadius, y: startY / maxRadius })
      } else {
        onMove({ x: 0, y: 0 })
      }
    }
  }

  const handleDragEnd = (e) => {
    e.preventDefault()
    const touches = e.changedTouches ? Array.from(e.changedTouches) : [e]
    const activeTouch = touches.find((t) => (t.identifier ?? 'mouse') === draggingRef.current)

    if (activeTouch || (!e.changedTouches)) {
      draggingRef.current = null
      setStickPos({ x: 0, y: 0 })
      onMove({ x: 0, y: 0 })
    }
  }

  useEffect(() => {
    const options = { passive: false }
    window.addEventListener('touchmove', handleDragMove, options)
    window.addEventListener('touchend', handleDragEnd, options)
    window.addEventListener('touchcancel', handleDragEnd, options)
    window.addEventListener('mousemove', handleDragMove, options)
    window.addEventListener('mouseup', handleDragEnd, options)

    return () => {
      window.removeEventListener('touchmove', handleDragMove)
      window.removeEventListener('touchend', handleDragEnd)
      window.removeEventListener('touchcancel', handleDragEnd)
      window.removeEventListener('mousemove', handleDragMove)
      window.removeEventListener('mouseup', handleDragEnd)
    }
  }, []) // We can ignore dependency warning since refs are handling state

  return (
    <div className="virtual-controls">
      <div 
        ref={baseRef} 
        className="joystick-base"
        onTouchStart={handleDragStart}
        onMouseDown={handleDragStart}
      >
        <div 
          className="joystick-stick"
          style={{ transform: `translate(${stickPos.x}px, ${stickPos.y}px)` }}
        />
      </div>
      <button 
        className="joystick-action" 
        onTouchStart={onActionDown} 
        onMouseDown={onActionDown}
        onTouchEnd={onActionUp}
        onMouseUp={onActionUp}
        onMouseLeave={onActionUp}
      >
        Skill
      </button>
    </div>
  )
}
