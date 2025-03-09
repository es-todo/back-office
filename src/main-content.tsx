import { Button, Heading, VStack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import PopupDialog from "./popup";

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
    <VStack align={"start"}>
      {command_name}

      <p>{command_uuid}</p>
      <PopupDialog />
      <Button type="submit" onClick={() => console.log("HER")}>
        Submit
      </Button>
    </VStack>
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
