//import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Provider } from "./ui/provider.tsx";

//createRoot(document.getElementById("root")!).render(
//  <StrictMode>
//    <App />
//  </StrictMode>
//);

createRoot(document.getElementById("root")!).render(
  <Provider>
    <App />
  </Provider>
);
