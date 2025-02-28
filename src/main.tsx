import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { Provider } from "./ui/provider.tsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <Provider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
