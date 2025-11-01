// Modules
const { consumers, gcpConfig } = require("../../config");
// Consumers Handler
const PubSubTopic = require("../../queues/PubSubTopic");
// Http
const BackendHttp = require("../../http/backend.http");

// Initialize Backend Http
const backendHttp = new BackendHttp();

const pubsubTopic = new PubSubTopic({
  ...gcpConfig,
  ...consumers.communication_queue,
});

const messageHandler = async (data) => {
  try {
    const parsedData = JSON.parse(data.data);
    const { type, ...rest } = parsedData;

    switch (type) {
      case "new_message":
        console.log("NEW MESSAGE >>>>>>", rest);
        // await this.backendHttp.createMessage(data);
        return;
    }
  } catch (err) {
    onConsumerError(err);
  }
}

const onConsumerError = (error) => {
  console.log("Error in Topic Communication Queue>>>>>>>>", error);
};

pubsubTopic.addListeners({
  messageHandler: messageHandler,
  onConsumerError: onConsumerError,
});

pubsubTopic.onConsumerStart();


