import { Route, Routes } from "react-router-dom";
import { Heading } from "./heading";
import { ProfilePageContent } from "./profile-page";
import { Context } from "./context";

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

function Profile({ C }: { C: Context }) {
  return (
    <>
      <Heading>Profile</Heading>
      <ProfilePageContent C={C} />
      <p>This is the main profile area.</p>
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
      <Route path="/profile" element={<Profile C={C} />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
