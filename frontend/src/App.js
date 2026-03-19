import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';

// Theme configuration has been moved to contexts/ThemeContext.js

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'student': return <Navigate to="/student" replace />;
    case 'teacher': return <Navigate to="/teacher" replace />;
    case 'admin': return <Navigate to="/admin" replace />;
    default: return <Navigate to="/login" replace />;
  }
}

function AppLayout() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {/* #35 - Skip to main content link for accessibility */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        onFocus={(e) => {
          e.target.style.position = 'fixed';
          e.target.style.left = '16px';
          e.target.style.top = '16px';
          e.target.style.width = 'auto';
          e.target.style.height = 'auto';
          e.target.style.zIndex = 9999;
          e.target.style.padding = '12px 24px';
          e.target.style.background = '#1565c0';
          e.target.style.color = '#fff';
          e.target.style.borderRadius = '8px';
          e.target.style.textDecoration = 'none';
          e.target.style.fontWeight = '600';
        }}
        onBlur={(e) => {
          e.target.style.position = 'absolute';
          e.target.style.left = '-9999px';
          e.target.style.width = '1px';
          e.target.style.height = '1px';
        }}
      >
        Skip to main content
      </a>
      {!isAuthPage && <Navbar />}
      <main id="main-content" role="main">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/courses" element={
                <ProtectedRoute><CourseList /></ProtectedRoute>
              } />
              <Route path="/courses/:id" element={
                <ProtectedRoute><CourseDetail /></ProtectedRoute>
              } />
              <Route path="/student" element={
                <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>
              } />
              <Route path="/teacher" element={
                <ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
    </>
  );
}

function App() {
  return (
    <ThemeContextProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
    </ThemeContextProvider>
  );
}

export default App;
