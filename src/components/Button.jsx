export default function Button({ children, variant = 'primary', ...props }) {
  const base = 'w-full min-h-tap rounded-card font-display font-semibold text-base tracking-widest uppercase transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100'
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark active:bg-brand-dark',
    dark:    'bg-asphalt text-white hover:bg-asphalt-soft active:bg-asphalt-soft',
    outline: 'bg-transparent text-asphalt border-2 border-asphalt hover:bg-concrete-dim',
    ghost:   'bg-concrete-dim text-asphalt hover:bg-concrete',
  }
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  )
}
