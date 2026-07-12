import { useParams } from 'react-router-dom'
import Header from '../../components/Header.jsx'

// Post-MVP: экран подтверждения записей для būvuzraugs.
// Бэкенд ещё не реализован — показываем заглушку.

export default function SupervisorCaseDetail() {
  const { id } = useParams()

  return (
    <div className="min-h-screen bg-concrete">
      <Header title="Надзор" onBack />
      <div className="px-4 pt-12 flex flex-col items-center text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="font-display font-bold text-xl text-asphalt mb-2">Скоро</h2>
        <p className="text-asphalt-soft text-sm max-w-xs leading-relaxed">
          Здесь будет лента записей прораба и возможность подтвердить их для BIS (nodot apstiprināšanai).
        </p>
        <p className="text-xs text-asphalt-soft mt-6 bg-card rounded-card px-4 py-2">
          Объект #{id}
        </p>
      </div>
    </div>
  )
}
