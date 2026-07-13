import { useParams } from 'react-router-dom'
import Header from '../../components/Header.jsx'

export default function SupervisorCaseDetail() {
  const { id } = useParams()

  return (
    <div className="min-h-screen bg-blueprint flex flex-col">
      <Header title="Uzraudzība" onBack />

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="border border-white/10 px-8 py-10 max-w-xs w-full">
          <p className="text-4xl mb-5">🔍</p>
          <h2 className="font-display font-bold text-xl text-white tracking-widest uppercase mb-3">
            Drīzumā
          </h2>
          <p className="font-mono text-[12px] text-white/40 tracking-wide leading-relaxed">
            Šeit būs būvdarbu vadītāja ierakstu plūsma un iespēja tos apstiprināt BIS.
          </p>
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="font-mono text-[11px] text-white/20 tracking-widest uppercase">
              Objekts #{id}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
