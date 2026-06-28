/**
 * Type declarations for remote micro-frontend modules.
 *
 * When we import from a remote like `import('auth/LoginPage')`,
 * TypeScript doesn't know what that module exports. These declarations
 * tell TypeScript the shape of each remote module.
 *
 * Without these, every `import('remoteName/Component')` would be `any`.
 */

declare module 'auth/LoginPage' {
  import { ComponentType } from 'react';
  const LoginPage: ComponentType;
  export default LoginPage;
}

declare module 'dashboard/DashboardPage' {
  import { ComponentType } from 'react';
  const DashboardPage: ComponentType;
  export default DashboardPage;
}

declare module 'log/LogPage' {
  import { ComponentType } from 'react';
  const LogPage: ComponentType;
  export default LogPage;
}

declare module 'courses/CoursesPage' {
  import { ComponentType } from 'react';
  const CoursesPage: ComponentType;
  export default CoursesPage;
}

declare module 'analytics/AnalyticsPage' {
  import { ComponentType } from 'react';
  const AnalyticsPage: ComponentType;
  export default AnalyticsPage;
}
