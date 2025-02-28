import { useEffect, useMemo, useState } from "react";

import { Broker, initial_broker_state } from "./broker.ts";
import { Field, Input } from "@chakra-ui/react";

const url = location.protocol + "//" + location.hostname + ":" + location.port;

function App() {
  const [broker_state, set_broker_state] = useState(initial_broker_state);
  const broker = useMemo(
    () => new Broker(url, (state) => set_broker_state(state)),
    []
  );
  useEffect(() => {
    return () => broker.terminate();
  }, [broker]);
  const [count, setCount] = useState(0);

  return (
    <>
      <div>{broker_state.connected ? "connected" : "connecting ..."}</div>
      <Field.Root invalid>
        <Field.Label>Email</Field.Label>
        <Input placeholder="me@example.com" />
        <Field.ErrorText>This is an error text</Field.ErrorText>
      </Field.Root>

      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
