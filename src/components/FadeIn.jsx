import { useEffect, useRef, useState } from 'react'

/**
 * Оборачивает контент, который плавно проявляется когда попадает во viewport.
 * Использует IntersectionObserver.
 *
 * Использование:
 *   <FadeIn><section>...</section></FadeIn>
 *   <FadeIn delay={100}>...</FadeIn>
 */
export default function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => setVisible(true), delay)
            } else {
              setVisible(true)
            }
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
    >
      {children}
    </div>
  )
}
