import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import AuthCallback from './pages/AuthCallback.jsx'
import RoleSelect from './pages/RoleSelect.jsx'
import CasesList from './pages/CasesList.jsx'

// Прораб
import ForemanCaseDetail from './pages/CaseDetail.jsx'
import ConfirmSubmit from './pages/ConfirmSubmit.jsx'
import SubmitStatus from './pages/SubmitStatus.jsx'

// Координатор
import CoordinatorCaseDetail from './pages/coordinator/CaseDetail.jsx'
import ImportEstimate from './pages/coordinator/ImportEstimate.jsx'
import ImportDocuments from './pages/coordinator/ImportDocuments.jsx'
import DocumentsList from './pages/coordinator/DocumentsList.jsx'
import LinkDocument from './pages/coordinator/LinkDocument.jsx'

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

      {/* Выбор роли (сразу после логина) */}
      <Route
        path="/role-select"
        element={<RequireAuth><RoleSelect /></RequireAuth>}
      />

      {/* Список объектов — общий для всех ролей */}
      <Route
        path="/cases"
        element={<RequireAuth><CasesList /></RequireAuth>}
      />

      {/* Детали объекта — роль определяет компонент */}
      <Route
        path="/cases/:id"
        element={<RequireAuth><RoleCaseDetail /></RequireAuth>}
      />

      {/* Прораб: подтверждение и статус */}
      <Route
        path="/cases/:id/confirm"
        element={<RequireAuth><ConfirmSubmit /></RequireAuth>}
      />
      <Route
        path="/cases/:id/status"
        element={<RequireAuth><SubmitStatus /></RequireAuth>}
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

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
