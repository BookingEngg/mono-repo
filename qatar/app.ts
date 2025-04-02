import express from "express";
import Consumers from './src/consumers';

class App {
  private app: express.Application | null = null;
  private consumers: Consumers | null = null;
  private PORT = 3015;

  constructor() {
    this.app = express();
    this.consumers = new Consumers();
  }

  public startServer = () => {
    if (this.app === null) {
      throw new Error("Server is not initialized");
    }
    this.app.listen(this.PORT, () => {
      console.log(`Server running on port ${this.PORT}`);
    });
  };
}

export default App;
