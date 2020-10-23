fs = require('fs');
const redis = require("redis");
const clientOptions = {
    'host': '127.0.0.1',
    'port': '6379',
};

const publisher = redis.createClient(clientOptions);
fs.readFile('./package-mock.json', 'utf8', (err, data) => {
    if (err) {
        throw Error('cannot read file')
    }

    console.log('init');
    publisher.publish("NPM_FILE", JSON.stringify({headers: { websocketId: '1231231'}, payload: JSON.parse(data)}));
    publisher.quit();
});


