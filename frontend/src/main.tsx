import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "rsuite/dist/rsuite.min.css";
import { CustomProvider } from "rsuite";
import App from "@/App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "@/store/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // default: true
    },
  },
});

// Application Root File
(() => {
  return createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <CustomProvider theme="light">
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </QueryClientProvider>
        </Provider>
      </CustomProvider>
    </StrictMode>
  );
})();
