import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export function Magnetic({ children, className, strength = 0.25, onClick }) {
  const ref = useRef(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  function onMouseMove(e) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    mouseX.set((e.clientX - centerX) * strength)
    mouseY.set((e.clientY - centerY) * strength)
  }

  function onMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
