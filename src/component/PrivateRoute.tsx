import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../util/auth';
import type { JSX } from 'react';

export function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}