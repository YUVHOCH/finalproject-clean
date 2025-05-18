// components/ProtectedRoute.js
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useContext(UserContext);

  if (user === null) {
    return <p>Loading...</p>;
  }

  if (!user || user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
