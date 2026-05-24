import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSecurity } from '../context/SecurityContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, otpPending } = useSecurity();
  const location = useLocation();

  if (otpPending && location.pathname !== '/otp') {
    // If OTP verification is pending, force redirect to OTP input page
    return <Navigate to="/otp" replace state={{ from: location }} />;
  }

  if (!user && !otpPending) {
    // If user is completely unauthenticated, redirect to login page
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && user && user.role !== 'Admin') {
    // If admin permissions are required but user is not admin, redirect to default dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
