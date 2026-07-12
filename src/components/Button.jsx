export default function Button({ children, variant = 'primary', ...props }) {
  const base = 'w-full min-h-tap rounded-card font-display font-semibold text-lg tracking-wide uppercase transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100'
  const variants = {
    primary: 'bg-brand text-white active:bg-brand-dark',
    dark: 'bg-asphalt text-white active:bg-asphalt-soft',
    outline: 'bg-transparent text-asphalt border-2 border-asphalt',
    ghost: 'bg-concrete-dim text-asphalt'
  }
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  )
}
