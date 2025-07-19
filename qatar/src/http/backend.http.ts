import { services } from "@/config";
import fetch from 'node-fetch'

class BackendHttp {
  private backendHttp = services.backend;

  public createMessage = async (payload: object) => {
    return await fetch(`${this.backendHttp}/communication/new-message`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  };
}

export default BackendHttp;
