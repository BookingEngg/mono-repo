// Modules
const { consumers, redisConfig, gcpConfig } = require("../../config");
// Consumers Handler
const QueueService = require("../../queues/QueueService");
// Http
const BackendHttp = require("../../http/backend.http");

const backendHttp = new BackendHttp();

const queueConfig = {
  ...gcpConfig, // In case of pubsub
  ...redisConfig, // In case of bull queue
  ...consumers.communication_queue,
};
const queueService = new QueueService(queueConfig);

/**
 * All the message listen to the communication queue will come this place
 */
const messageHandler = async (data) => {
  try {
    const { type } = data;

    switch (type) {
      case "direct_message":
      case "group_message":
        console.log("NEW MESSAGE >>>>>>", data);
        await backendHttp.createMessage(data);
        return;
    }
  } catch (err) {
    onConsumerError(err);
  }
};

const onConsumerError = (error) => {
  console.log("Error IN Communication Queue>>>>>>>>", error);
};

queueService.addListeners({
  messageHandler,
  onConsumerError,
});

queueService.onConsumerStart();
