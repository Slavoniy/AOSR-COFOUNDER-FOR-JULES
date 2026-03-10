import React from 'react';
import { UserRole } from '../../modules/shared/domain/types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  userRole?: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  userRole,
  children,
  fallback = null,
}) => {
  if (!userRole) return <>{fallback}</>;

  if (allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
