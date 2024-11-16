import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "rsuite/dist/rsuite.min.css";
import { CustomProvider } from "rsuite";
// import './index.css'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CustomProvider theme="light">
      <App />
    </CustomProvider>
  </StrictMode>
);
