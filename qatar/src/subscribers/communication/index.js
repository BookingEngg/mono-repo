// Modules
const { consumers, redisConfig, isProduction } = require("../../config");
// Consumers Handler
const RedisBull = require("../../queues/RedisBull");
// Http
const BackendHttp = require("../../http/backend.http");

const backendHttp = new BackendHttp();
const redisBull = new RedisBull({
  queue: consumers.communication_queue.consumer_name,
  ...redisConfig,
});

/**
 * All the message listen to the communication queue will come this place
 */
const messageHandler = async (data) => {
  try {
    const { type } = data;

    switch (type) {
      case "new_message":
        if (!isProduction) console.log("NEW MESSAGE >>>>>>", data);
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

redisBull.addListeners({
  messageHandler,
  onConsumerError,
});

redisBull.onConsumerStart();
