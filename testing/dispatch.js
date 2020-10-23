fs = require('fs');
const redis = require("redis");
const clientOptions = {
    'host': '127.0.0.1',
    'port': '6379',
};

//test sending file to redis
const publisher = redis.createClient(clientOptions);
fs.readFile('./package-mock.json', 'utf8', (err, data) => {
    if (err) {
        throw Error('Cannot read file')
    }
    publisher.publish("NPM_FILE", JSON.stringify({headers: { websocketId: '1231231'}, payload: JSON.parse(data)}));
    publisher.quit();
});


