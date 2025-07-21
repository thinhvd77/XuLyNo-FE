import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import './index.css'; // File CSS toàn cục
import UserLayout from './components/UserLayout/UserLayout'; // Import layout mới
import MyCases from './pages/MyCases/MyCases'; // Import trang mới

function App() {
  return (
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
    </Routes>
  );
}

export default App;