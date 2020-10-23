fs = require('fs');
const redis = require("redis");
const clientOptions = {
    'host': '127.0.0.1',
    'port': '6379',
};

const subscriber = redis.createClient(clientOptions);

subscriber.on("message",  (channel, message) => {
    console.log(`Subscriber received message in channel ${channel}: ${message}`);
});

subscriber.subscribe("REPO_GITHUB.COM");