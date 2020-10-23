fs = require('fs');
var exec = require('child_process').exec;
const redis = require("redis");
const clientOptions = {
    'host': '127.0.0.1',
    'port': '6379',
};

const subscriber = redis.createClient(clientOptions);
const publisher = redis.createClient(clientOptions);

let headers
let extractedPackage

subscriber.on("message",  (message) => {
    extractedPackage = extractPackageDependencies(JSON.parse(message).payload);
    headers = (JSON.parse(message).headers)
    extractedPackage.then(package => {
        Object.keys(package.dependencies).map((key) => {
            searchForRepositoryInformation(`${key}@${package.dependencies[key]}`).then(repoInfo => extractURL(repoInfo, headers))
        })
    });
});

subscriber.subscribe('NPM_FILE');


function extractPackageDependencies(packageJson) {
    //@todo Remove promisse
    return new Promise((resolve) => {
        resolve(packageJson);
    });
}

async function searchForRepositoryInformation(repositoryName) {
    return new Promise((resolve) => {
        exec(`npm view ${repositoryName} -json`, (err, stdout) => {
            if (err) {
                throw Error('cannot read repository name')
            }
            const packageInfo = JSON.parse(stdout)
            resolve({
                name: packageInfo.name,
                url: packageInfo.repository.url,
                version: packageInfo.version
            })
        })
    })
}

function extractURL(repoInfo) {

    const pattern = /(.+:\/\/)?([^\/]+)(\/.*)*/i;
    
    // this is used to join the 'git@github.com' and 'github.com' in the same format (github.com)
    if (repoInfo.url.includes('@')) {
        repoInfo.url = repoInfo.url.split('@')[1]
    }
    var hostname = `REPO_${pattern.exec(repoInfo.url)[2].toUpperCase()}`;

    publishResponse(hostname, repoInfo)
}

function publishResponse(queue, payload) {
    publisher.publish(queue, JSON.stringify({ headers, payload }))
}

