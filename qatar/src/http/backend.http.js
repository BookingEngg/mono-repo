const { services } = require("../config");
const fetch = require("node-fetch");

class BackendHttp {
  backendHttp = services.backend;

  createMessage = async (payload) => {
    return await fetch(`${this.backendHttp}/communication/new-message`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
  };
}

module.exports = BackendHttp;
