import App from "./app";
// Routes
import ExternalRoutes from "@routes/external.routes";
import IndexRoutes from "@routes/index.routes";

const app = new App([new ExternalRoutes(), new IndexRoutes()]);

app.listenServer();
