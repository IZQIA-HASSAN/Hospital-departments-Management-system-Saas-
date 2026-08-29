import { Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Home from "./pages/Home";
import Forgotpassword from "./pages/auth/ForgotPassword";

import InviteSent from "./pages/verifications/InviteSent";
import StaffSignup from "./pages/verifications/StaffSignup";
// import StaffLogin from "./pages/verifications/Stafflogin";

import AdminLayout from "./pages/Dashboards/Admin/AdminLayout";
import Admindash from "./pages/Dashboards/Admin/Admindash";
import Staff from "./pages/Dashboards/Admin/Staff";
import Settings from "./pages/Dashboards/Admin/Settings";

import StaffLayout from "./pages/Dashboards/Staff/StaffLayout";
import Staffdash from "./pages/Dashboards/Staff/Staffdash";

import DepartmentPage from "./pages/Dashboards/departments/DepartmentPage";
import RequireRole from "./components/RequireRole";
// RequireHospital is a COMPONENT (renders loading/empty/children), not the
// useHospital hook itself — a hook can't be used as a JSX wrapper like
// <useHospital>...</useHospital>. Import the component here instead.
import RequireHospital from "./components/RequireHospital"; // adjust path to wherever you saved it

import ResetPassword from "./pages/auth/ResetPassword"; // adjust path
import OPDcontent from "./pages/Dashboards/departments/OPDcontent";
import EmergencyPanel from "./components/EmergencyPanel";
import EmergencyContent from "./pages/Dashboards/departments/EmergencyContent";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Signup" element={<Signup />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Forgotpassword" element={<Forgotpassword />} />
      <Route path="/invite-sent" element={<InviteSent />} />
      <Route path="/staff-signup" element={<StaffSignup />} />
      <Route path="/forgotpassword" element={<Forgotpassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/OPD-content" element={<OPDcontent />} />
      <Route path="/Emergency-panel" element={<EmergencyPanel />} />
      <Route path="/EmergencyContent" element={<EmergencyContent />} />
      {/* <Route path="/staff-login" element={<StaffLogin />} /> */}

      {/* Admin dashboard — role-guarded, then hospital-guarded.
          Admins can legitimately have no hospital yet (before they create
          one), so this is the one place the guard belongs. */}
      <Route
        path="/admin"
        element={
          <RequireRole role="admin">
            <RequireHospital>
              <AdminLayout />
            </RequireHospital>
          </RequireRole>
        }
      >
        <Route index element={<Admindash />} />
        <Route path="staff" element={<Staff />} />
        <Route path="departments/:slug" element={<DepartmentPage />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Staff dashboard — role-guarded only.
          No RequireHospital here: a staff account only exists because
          someone accepted an invite into an already-created hospital, so
          "no hospital yet" can never legitimately apply to staff. */}
      <Route
        path="/staff"
        element={
          <RequireRole role="staff">
            <StaffLayout />
          </RequireRole>
        }
      >
        <Route index element={<Staffdash />} />
        <Route path="departments/:slug" element={<DepartmentPage />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;