import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import Register from "./Components/Login/Register";
import Login from "./Components/Login/Login";
import AdminDashboard from "./Components/Dashboard/AdminDashboard";
import StaffDashboard from "./Components/Dashboard/StaffDashboard";
import StudentDashboard from "./Components/Dashboard/StudentDashboard";
import PrivateRoute from "./Components/Routes/PrivateRoute";
import PendingIssues from "./Components/pages/PendingIssues";
import ManageUsers from "./Components/pages/ManageUsers";
import ManageComplaints from "./Components/pages/ManageComplaints";
import Navbar from "./Components/pages/Navbar";
import AdminSidebar from "./Components/home/AdminSidebar";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<PrivateRoute allowedRoles={["admin"]} />}>
          <Route
            element={
              <div className="flex min-h-screen">
                {/* Sidebar */}
                <AdminSidebar />

                {/* Main content */}
                <div className="flex-1">
                  <Navbar />
                  <div className="pt-20 px-4">
                    <Outlet />
                  </div>
                </div>
              </div>
            }
          >
            {/* Admin home */}
            <Route index element={<AdminDashboard />} />

            {/* Admin child pages */}
            <Route path="users" element={<ManageUsers />} />
            <Route path="complaints" element={<ManageComplaints />} />

            {/* Redirect unknown admin routes */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Route>

        {/* Staff Routes */}
        <Route path="/staff/*" element={<PrivateRoute allowedRoles={["staff"]} />}>
          <Route
            index
            element={
              <>
                <Navbar />
                <div className="pt-20 px-4">
                  <StaffDashboard />
                </div>
              </>
            }
          />
          <Route
            path="pending-issues"
            element={
              <>
                <Navbar />
                <div className="pt-20 px-4">
                  <PendingIssues />
                </div>
              </>
            }
          />
        </Route>

        {/* Student Routes */}
        <Route path="/student/*" element={<PrivateRoute allowedRoles={["student"]} />}>
          <Route
            index
            element={
              <>
                <Navbar />
                <div className="pt-20 px-4">
                  <StudentDashboard />
                </div>
              </>
            }
          />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;