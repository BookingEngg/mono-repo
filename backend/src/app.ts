import http from "http";
import express from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { Server } from "socket.io";
import SocketEvents from "@/events/socket.events";
import {
  PORT,
  serviceName,
  serviceRoute,
  env,
  SOCKET_EVENTS_NAMES,
  tokenDetails,
} from "@config";
import { Routes } from "@interfaces/common.interface";

class App {
  private app: express.Application;
  private env: string;
  private routes: Routes[];
  private port: number;
  private server: http.Server;
  private io: Server;
  private socketEventHandler = new SocketEvents();

  constructor(routes: Routes[]) {
    this.routes = routes;
    this.port = PORT || 8080;
    this.env = env;

    this.app = express();

    this.server = http.createServer(this.app); // http server for sockets IO
    this.io = new Server(this.server);

    this.initilizeMiddlewares();
  }

  public loggingMiddleware = () => {
    morgan.token(
      "time",
      function getResponseTime(
        req: Request & { _startTime: number },
        res: Response
      ) {
        return Date.now() - req._startTime + "ms";
      }
    );

    this.app.use((req, res, next) => {
      req._startTime = Date.now();
      next();
    });

    this.app.use(morgan(":method :status :url - :time"));
  };

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
    this.loggingMiddleware();
    this.app.use(
      cookieSession({
        name: "session",
        keys: [tokenDetails.secret_key],
      })
    );

    this.initilizeRoutes(this.routes);
    this.initilizeSocketEvents();
  }

  private initilizeRoutes(routes: Routes[]) {
    routes.forEach((route) =>
      this.app.use(`/${serviceRoute || ""}`, route.router)
    );
  }

  public initilizeSocketEvents = () => {
    this.io.on("connection", (socket) => {
      SOCKET_EVENTS_NAMES.forEach((eventName) => {
        socket.on(
          eventName,
          this.socketEventHandler.initializeSocketEvents({
            eventName,
            socket,
            io: this.io,
          })
        );
      });
    });
  };

  public listenServer() {
    this.server.listen(this.port, () => {
      console.log(
        ` 🔥🔥 ENV = ${this.env} 🔥🔥\n`,
        `Service ${serviceName} started AT PORT NO ${this.port} ✔️`
      );
    });
  }
}

export default App;
