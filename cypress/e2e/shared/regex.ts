export const LOGIN_REGEX: RegExp = /login form/i;

export const ADMIN_DASHBOARD_H1 = /Admin Dashboard/i;

/**
 * Common UI text matchers to keep assertions consistent and centralized.
 */
export const UI_MATCHERS_REGEX = {
  dashboardH1: /User Dashboard/i,
  loginDemoAdminButton: /login as demo admin/i,
  loginDemoUserButton: /login as demo user/i,
  loginHeading: /Log in to your account/i,
  signoutButton: /Sign Out/i,
  signupHeading: /Sign up for an account/i,
  welcomeHome: /Welcome to Acme/i,
} as const satisfies Readonly<Record<string, RegExp>>;
