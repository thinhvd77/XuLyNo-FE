import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login/Login';
import Layout from './components/Layout/Layout';
import AdminLayout from './components/AdminLayout/AdminLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import './index.css'; // File CSS toàn cục
import UserLayout from './components/UserLayout/UserLayout'; // Import layout mới
import MyCases from './pages/MyCases/MyCases'; // Import trang mới
import ImportPage from './pages/Import/Import';
import UserManagement from './pages/UserManagement/UserManagement'; // Import trang quản lý người dùng

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Route mặc định sẽ chuyển hướng đến trang login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Route cho trang Login */}
        <Route path="/login" element={<Login />} />

        {/* Route cho Dashboard */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        {/* User Routes */}
        <Route
          path="/my-cases"
          element={
            <UserLayout>
              <MyCases />
            </UserLayout>
          }
        />
        <Route
          path="/import"
          element={
            <Layout>
              <ImportPage />
            </Layout>
          }
        />
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <UserManagement />
            </AdminLayout>
          }
        />
      </Routes>
    </>
  );
}

export default App;