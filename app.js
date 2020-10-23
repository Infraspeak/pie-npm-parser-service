fs = require('fs');
var exec = require('child_process').exec;
const redis = require("redis");
const clientOptions = {
    'host': '127.0.0.1',
    'port': '6379',
};

const subscriber = redis.createClient(clientOptions);
const publisher = redis.createClient(clientOptions);

subscriber.on("message", function (channel, message) {

    let extractedDependencies = extractPackageDependencies(JSON.parse(message).payload);
    extractedDependencies.then(dependencies => {
        Object.keys(dependencies).map((key) => {
            searchForRepositoryInformation(`${key}@${dependencies[key]}`).then(repoInfo => sendToQueue(repoInfo))
        })
    });

});

subscriber.subscribe('NPM_FILE');


function extractPackageDependencies(packageJson) {
    //@todo Remove promisse
    return new Promise((resolve) => {
        resolve(packageJson.dependencies);
    });
}

async function searchForRepositoryInformation(repositoryName) {
    return new Promise((resolve) => {
        exec(`npm view ${repositoryName} -json`, function (err, stdout) {
            if (err) {
                throw Error('cannot read repository name')
            }
            resolve({
                name: JSON.parse(stdout).name,
                url: JSON.parse(stdout).repository.url,
            })
        })
    })
}

function sendToQueue(repoInfo) {
    let queue = 'REPO_';

    if (repoInfo.url.includes('github.com')) {
        queue = `${queue}GITHUB.COM`
    }

    if (repoInfo.url.includes('gitlab.com')) {
        queue = `${queue}GITLAB.COM`
    }

    if (repoInfo.url.includes('bitbucket.com')) {
        queue = `${queue}BITBUCKET.COM`
    }

    publisher.publish(queue, JSON.stringify({payload: repoInfo}));
}