// src/lib/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export default function AdminRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null; // or a spinner
  if (!user || !(user.is_admin || user.role === "admin")) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
