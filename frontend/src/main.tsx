import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "rsuite/dist/rsuite.min.css";
import { CustomProvider } from "rsuite";
import App from "@/App";
import { Provider } from "react-redux";
import { store } from "@/store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CustomProvider theme="light">
      <Provider store={store}>
        <App />
      </Provider>
    </CustomProvider>
  </StrictMode>
);
