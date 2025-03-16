import { useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import PopupDialog from "./popup";
import { Heading } from "./heading";
import Button from "@mui/material/Button";

type Field = { type: "text" };

type CommandFormProps = {
  command_name: string;
  fields: Field[];
};

function CommandForm({
  command_name,
  fields: original_fields,
}: CommandFormProps) {
  const command_uuid = useMemo(() => uuidv4(), []);
  const [fields, set_fields] = useState(original_fields);
  return (
    <div style={{ justifyContent: "start" }}>
      {command_name}

      <p>{command_uuid}</p>
      <PopupDialog />
      <Button type="submit" onClick={() => console.log("HERE")}>
        Submit
      </Button>
    </div>
  );
}

function Home({ connected }: { connected: boolean }) {
  return (
    <>
      <Heading size="lg" mb={4}>
        Welcome to Back Office Ops.
      </Heading>
      <p>We are {connected ? "connected." : "connecting ..."}</p>
      <p>This is the main content area.</p>
      <CommandForm command_name="ping" fields={[]} />
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
