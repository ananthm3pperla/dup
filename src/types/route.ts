import { RouteObject } from 'react-router-dom';
import { UserRole } from '@/lib/rbac';

export interface AppRouteObject extends RouteObject {
  requireAuth?: boolean;
  roles?: UserRole[];
  children?: AppRouteObject[];
}