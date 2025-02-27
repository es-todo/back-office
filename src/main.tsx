import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import * as eio from "engine.io-client";

const url = location.protocol + "//" + location.hostname + ":" + location.port;
console.log({ url });

const connection = new eio.Socket(url);

connection.on("error", (error) => {
  console.error(error);
});

connection.on("open", () => {
  console.log("open");
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
