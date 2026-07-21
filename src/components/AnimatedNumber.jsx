import { useEffect, useRef, useState } from 'react'

/**
 * Плавно "прокручивает" число от предыдущего значения до нового.
 * Использует requestAnimationFrame + ease-out.
 *
 * Использование:
 *   <AnimatedNumber value={80} suffix="%" duration={1500} />
 *   <AnimatedNumber value={loss} format={(n) => n.toLocaleString('lv-LV', {...})} />
 */
export default function AnimatedNumber({
  value,
  duration = 1200,
  format,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const startRef = useRef(null)
  const frameRef = useRef(null)

  useEffect(() => {
    const from = fromRef.current
    const to   = value
    if (from === to) return

    startRef.current = null

    function tick(ts) {
      if (startRef.current === null) startRef.current = ts
      const elapsed = ts - startRef.current
      const t = Math.min(1, elapsed / duration)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      const current = from + (to - from) * eased
      setDisplay(current)
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value, duration])

  const rounded = Math.round(display)
  const shown = format ? format(rounded) : `${prefix}${rounded}${suffix}`

  return <span className={className}>{shown}</span>
}
