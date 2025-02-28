import { useEffect, useMemo, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { Broker, initial_broker_state } from "./broker.ts";

const url = location.protocol + "//" + location.hostname + ":" + location.port;

function App() {
  const [broker_state, set_broker_state] = useState(initial_broker_state);
  const broker = useMemo(
    () =>
      new Broker(url, (state) => {
        console.log(state);
        set_broker_state(state);
      }),
    []
  );
  useEffect(() => {
    console.log("setting up cleaniup");
    return () => {
      console.log("terminating ...");
      broker.terminate();
    };
  }, [broker]);
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        {broker_state.connected ? "connected" : "connecting ..."}
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
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
