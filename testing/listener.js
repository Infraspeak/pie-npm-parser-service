fs = require('fs');
const redis = require('redis');
const clientOptions = {
    'host': process.env.REDIS_HOST,
    'port': process.env.REDIS_PORT,
};

const subscriber = redis.createClient(clientOptions);

subscriber.on('message',  (channel, message) => {
    console.log(`Subscriber received message in channel ${channel}: ${message}`);
});

subscriber.subscribe('REPO_GITHUB.COM');