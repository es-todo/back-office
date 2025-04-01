import { Route, Routes } from "react-router-dom";
import { Heading } from "./heading";

function Home({ connected }: { connected: boolean }) {
  return (
    <>
      <Heading size="lg" mb={4}>
        Welcome to Back Office Ops.
      </Heading>
      <p>We are {connected ? "connected." : "connecting ..."}</p>
      <p>This is the main content area.</p>
    </>
  );
}

function Settings() {
  return (
    <>
      <Heading size="lg" mb={4}>
        Settings
      </Heading>
      <p>This is the main settings area.</p>
    </>
  );
}

function Profile() {
  return (
    <>
      <Heading size="lg" mb={4}>
        Profile
      </Heading>
      <p>This is the main profile area.</p>
    </>
  );
}

function NotFoundPage() {
  return (
    <>
      <Heading size="lg" mb={4}>
        Not Found
      </Heading>
      <p>This page does not exist.</p>
    </>
  );
}

export function MainContent(props: { connected: boolean }) {
  const { connected } = props;
  return (
    <Routes>
      <Route path="/" element={<Home connected={connected} />} />
      <Route path="/dashboard" element={<Home connected={connected} />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
