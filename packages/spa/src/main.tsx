import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material";
import { gen_password, verify_password } from "./crypto";
import { assert } from "./assert.ts";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={darkTheme}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>
);

function test() {
  const t0 = Date.now();
  const hashed = gen_password("mypass");
  const verified = verify_password("mypass", hashed);
  assert(verified === true);
  const t1 = Date.now();
  verify_password("mypass", hashed);
  const t2 = Date.now();
  console.log({
    hashed,
    verified,
    time1: `${t1 - t0}ms`,
    time2: `${t2 - t1}ms`,
  });
}
test();
