import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRedirect from "./components/auth/RoleRedirect";
import CustomerPage from "./pages/CustomerPage";
import EmployeePage from "./pages/EmployeePage";
import LogOutPage from "./pages/LogOutPage";
import ManagerPage from "./pages/ManagerPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CustomerPage />} />
          <Route path="/san-pham" element={<CustomerPage />} />
          <Route path="/san-pham/:id" element={<CustomerPage />} />
          <Route path="/gio-hang" element={<CustomerPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/tai-khoan" element={<RoleRedirect />} />
            <Route path="/logout" element={<LogOutPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["khach_hang"]} />}>
            <Route path="/khach-hang" element={<CustomerPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["nhan_vien"]} />}>
            <Route path="/nhan-vien" element={<EmployeePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["quan_ly"]} />}>
            <Route path="/quan-ly" element={<ManagerPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
