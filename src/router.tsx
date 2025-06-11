import { Route, Routes } from "react-router-dom";
import { Heading } from "./heading";
import { ProfilePage } from "./profile-page";
import { Context } from "./context";
import { InternalAdminPage } from "./internal-admin-page";
import { VerifyEmailPage } from "./verify-email-page";
import { InternalProfileManagementPage } from "./internal-profile-management-page";
import { ResetPasswordPage } from "./reset-password-page";

function Home({ connected }: { connected: boolean }) {
  return (
    <>
      <Heading>Welcome to Back Office Ops.</Heading>
      <p>We are {connected ? "connected." : "connecting ..."}</p>
      <p>This is the main content area.</p>
    </>
  );
}

function Settings() {
  return (
    <>
      <Heading>Settings</Heading>
      <p>This is the main settings area.</p>
    </>
  );
}

function NotFoundPage() {
  return (
    <>
      <Heading>Not Found</Heading>
      <p>This page does not exist.</p>
    </>
  );
}

export function Router(props: { connected: boolean; C: Context }) {
  const { connected, C } = props;
  return (
    <Routes>
      <Route path="/" element={<Home connected={connected} />} />
      <Route path="/dashboard" element={<Home connected={connected} />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<ProfilePage C={C} />} />
      <Route path="/verify-email/:code" element={<VerifyEmailPage C={C} />} />
      <Route
        path="/reset-password/:code"
        element={<ResetPasswordPage C={C} />}
      />
      <Route path="/internal/admin" element={<InternalAdminPage C={C} />} />
      <Route
        path="/internal/profile-management"
        element={<InternalProfileManagementPage C={C} />}
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
