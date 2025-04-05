import express from "express";
import { env, PORT, serviceName } from "@/config";
import Consumers from "@/consumers";

class App {
  private app: express.Application | null = null;
  private port: number;
  private env: string;

  constructor() {
    this.app = express();
    this.port = PORT || 3015;
    this.env = env;

    new Consumers(); // Initialize Consumers
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
