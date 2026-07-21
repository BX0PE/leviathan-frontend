import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import AuthCallback from './pages/AuthCallback.jsx'
import RoleSelect from './pages/RoleSelect.jsx'
import Onboarding from './pages/Onboarding.jsx'
import CaseHistory from './pages/CaseHistory.jsx'
import Join from './pages/Join.jsx'
import Team from './pages/coordinator/Team.jsx'
import CasesList from './pages/CasesList.jsx'

// Прораб
import ForemanCaseDetail from './pages/CaseDetail.jsx'
import ConfirmSubmit from './pages/ConfirmSubmit.jsx'
import SubmitStatus from './pages/SubmitStatus.jsx'

// Координатор
import CoordinatorCaseDetail from './pages/coordinator/CaseDetail.jsx'
import CreateCase from './pages/coordinator/CreateCase.jsx'
import ImportEstimate from './pages/coordinator/ImportEstimate.jsx'
import ImportDocuments from './pages/coordinator/ImportDocuments.jsx'
import DocumentsList from './pages/coordinator/DocumentsList.jsx'
import LinkDocument from './pages/coordinator/LinkDocument.jsx'
import MaterialsLibrary from './pages/coordinator/MaterialsLibrary.jsx'
import MaterialDetail from './pages/coordinator/MaterialDetail.jsx'
import LinkPositionMaterial from './pages/coordinator/LinkPositionMaterial.jsx'

// Надзор
import SupervisorCaseDetail from './pages/supervisor/CaseDetail.jsx'

import { isLoggedIn, getRole } from './api/auth.js'

function RequireAuth({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />
}

// Показывает разный CaseDetail в зависимости от роли
function RoleCaseDetail() {
  const role = getRole()
  if (role === 'coordinator') return <CoordinatorCaseDetail />
  if (role === 'supervisor')  return <SupervisorCaseDetail />
  return <ForemanCaseDetail />   // foreman + fallback
}

export default function App() {
  return (
    <Routes>
      {/* Публичные */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/join/:token" element={<Join />} />

      {/* Выбор роли (сразу после логина) */}
      <Route
        path="/role-select"
        element={<RequireAuth><RoleSelect /></RequireAuth>}
      />

      {/* Онбординг координатора (первый вход) */}
      <Route
        path="/onboarding"
        element={<RequireAuth><Onboarding /></RequireAuth>}
      />

      {/* Список объектов — общий для всех ролей */}
      <Route
        path="/cases"
        element={<RequireAuth><CasesList /></RequireAuth>}
      />

      {/* Координатор: управление командой */}
      <Route
        path="/team"
        element={<RequireAuth><Team /></RequireAuth>}
      />

      {/* Координатор: создать объект (статика до :id!) */}
      <Route
        path="/cases/new"
        element={<RequireAuth><CreateCase /></RequireAuth>}
      />

      {/* Детали объекта — роль определяет компонент */}
      <Route
        path="/cases/:id"
        element={<RequireAuth><RoleCaseDetail /></RequireAuth>}
      />

      {/* Прораб-режим для любой роли (координатор может ввести данные) */}
      <Route
        path="/cases/:id/entries"
        element={<RequireAuth><ForemanCaseDetail /></RequireAuth>}
      />

      {/* Прораб: подтверждение, статус, история */}
      <Route
        path="/cases/:id/confirm"
        element={<RequireAuth><ConfirmSubmit /></RequireAuth>}
      />
      <Route
        path="/cases/:id/status"
        element={<RequireAuth><SubmitStatus /></RequireAuth>}
      />
      <Route
        path="/cases/:id/history"
        element={<RequireAuth><CaseHistory /></RequireAuth>}
      />

      {/* Координатор: импорт и документы */}
      <Route
        path="/cases/:id/import-estimate"
        element={<RequireAuth><ImportEstimate /></RequireAuth>}
      />
      <Route
        path="/cases/:id/import-documents"
        element={<RequireAuth><ImportDocuments /></RequireAuth>}
      />
      <Route
        path="/cases/:id/documents"
        element={<RequireAuth><DocumentsList /></RequireAuth>}
      />
      <Route
        path="/documents/:docId/link"
        element={<RequireAuth><LinkDocument /></RequireAuth>}
      />

      {/* Координатор: привязка позиций к материалам */}
      <Route
        path="/cases/:id/link-materials"
        element={<RequireAuth><LinkPositionMaterial /></RequireAuth>}
      />

      {/* Koordinatora materiālu bibliotēka */}
      <Route
        path="/materials"
        element={<RequireAuth><MaterialsLibrary /></RequireAuth>}
      />
      <Route
        path="/materials/:id"
        element={<RequireAuth><MaterialDetail /></RequireAuth>}
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
