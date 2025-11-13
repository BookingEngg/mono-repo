import express from "express";
import { env, PORT, serviceName } from "@/config";

// Import the queues (JS)
require("./subscribers/communication");

class App {
  private app: express.Application | null = null;
  private port: number;
  private env: string;

  constructor() {
    this.app = express();
    this.port = PORT || 3015;
    this.env = env;
  }

  public startServer = () => {
    if (this.app === null) {
      throw new Error("Server is not initialized");
    }
    this.app.listen(this.port, () => {
      console.log(
        ` 🔥🔥 ENV = ${this.env} 🔥🔥\n`,
        `Service ${serviceName} started AT PORT NO ${this.port} ✔️`
      );
    });
  };
}

export default App;
