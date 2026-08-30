import App from "./app";
// Routes
import ExternalRoutes from "@routes/external.routes";
import InternalRoutes from "@/routes/internal.routes";
import IndexRoutes from "@routes/index.routes";
import CreatorHubRoutes from "@/routes/creatorHub.route";
import PaymentRoutes from "@/routes/payment.route";
import HomeRoutes from "@/routes/home.route";
import SettlementRoutes from "@/routes/settlement.route";

const app = new App([
  new ExternalRoutes(),
  new InternalRoutes(),
  new IndexRoutes(),
  new CreatorHubRoutes(),
  new PaymentRoutes(),
  new HomeRoutes(),
  new SettlementRoutes(),
]);

app.listenServer();
