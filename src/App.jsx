import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./components/Login/Login";
import Layout from "./components/Layout/Layout";
import AdminLayout from "./components/AdminLayout/AdminLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import DirectorDashboard from "./pages/DirectorDashboard/DirectorDashboard";
import ManagerDashboard from "./pages/ManagerDashboard/ManagerDashboard";
import "./index.css"; // File CSS toàn cục
import UserLayout from "./components/UserLayout/UserLayout"; // Import layout mới
import ManagerLayout from "./components/ManagerLayout/ManagerLayout"; // Import layout dành cho Manager
import MyCases from "./pages/MyCases/MyCases"; // Import trang mới
import ImportPage from "./pages/Import/Import";
import UserManagement from "./pages/UserManagement/UserManagement"; // Import trang quản lý người dùng
import CaseDetail from "./pages/CaseDetail/CaseDetail";
import AuthGuard from "./components/AuthGuard/AuthGuard";
import DirectorLayout from "./components/DirectorLayout/DirectorLayout"; // Import layout dành cho Ban Giám Đốc


function App() {
    return (
        <>
            <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
            <Routes>
                {/* Route mặc định sẽ chuyển hướng dựa trên trạng thái đăng nhập */}
                <Route path="/" element={
                    <AuthGuard requireAuth={false}>
                        <Navigate to="/login" replace />
                    </AuthGuard>
                } />

                {/* Route cho trang Login - bảo vệ khỏi người dùng đã đăng nhập */}
                <Route path="/login" element={
                    <AuthGuard requireAuth={false}>
                        <Login />
                    </AuthGuard>
                } />

                {/* Route cho Dashboard - yêu cầu xác thực */}
                <Route
                    path="/dashboard"
                    element={
                        <AuthGuard>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </AuthGuard>
                    }
                />

                {/* Route cho Director Dashboard - dành cho Ban Giám Đốc */}
                <Route
                    path="/director-dashboard"
                    element={
                        <AuthGuard>
                            <DirectorLayout>
                                <DirectorDashboard />
                            </DirectorLayout>
                        </AuthGuard>
                    }
                />

                {/* Route cho Manager Dashboard - dành cho Manager/Deputy Manager */}
                <Route
                    path="/manager-dashboard"
                    element={
                        <AuthGuard>
                            <ManagerLayout>
                                <ManagerDashboard />
                            </ManagerLayout>
                        </AuthGuard>
                    }
                />

                {/* User Routes - yêu cầu xác thực */}
                <Route
                    path="/my-cases"
                    element={
                        <AuthGuard>
                            <ManagerLayout>
                                <MyCases />
                            </ManagerLayout>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/import"
                    element={
                        <AuthGuard>
                            <Layout>
                                <ImportPage />
                            </Layout>
                        </AuthGuard>
                    }
                />
                {/* Admin Routes - yêu cầu xác thực */}
                <Route
                    path="/admin"
                    element={
                        <AuthGuard>
                            <AdminLayout>
                                <UserManagement />
                            </AdminLayout>
                        </AuthGuard>
                    }
                />
                <Route
                    path="/case/:caseId"
                    element={
                        <AuthGuard>
                            <UserLayout>
                                <CaseDetail />
                            </UserLayout>
                        </AuthGuard>
                    }
                />
            </Routes>
        </>
    );
}

export default App;
