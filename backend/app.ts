import { Routes } from "@interfaces/common.interface";
import express from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import cookieParser from "cookie-parser";
import { tokenSecretKey } from "@/config";
// const { OAuth2Client } = require("google-auth-library");
import { PORT, serviceName, serviceRoute, env } from "@config";

class App {
  private app: express.Application;
  private env: string;
  private routes: Routes[];
  private port: number;

  constructor(routes: Routes[]) {
    this.routes = routes;
    this.port = PORT || 8080;
    this.env = env;

    this.app = express();
    this.initilizeMiddlewares();
  }

  public initilizeMiddlewares() {
    this.app.use(
      cors({
        origin: true,
        credentials: true,
      })
    );
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(
      cookieSession({
        name: "session",
        keys: [tokenSecretKey],
      })
    );

    this.initilizeRoutes(this.routes);
  }

  private initilizeRoutes(routes: Routes[]) {
    routes.forEach((route) =>
      this.app.use(`/${serviceRoute || ""}`, route.router)
    );
  }

  public listenServer() {
    this.app.listen(this.port, () => {
      console.log(
        ` 🔥🔥 ENV = ${this.env} 🔥🔥\n`,
        `SERVICE ${serviceName} Started AT PORT NO ${this.port} ✔️`
      );
    });
  }
}

export default App;
