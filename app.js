fs = require('fs');
const exec = require('child_process').exec;
const redis = require('redis');
const clientOptions = {
    'host': process.env.REDIS_HOST,
    'port': process.env.REDIS_PORT,
};

const subscriber = redis.createClient(clientOptions);
const publisher = redis.createClient(clientOptions);

let headers

subscriber.subscribe('NPM_FILE');

function extractPackageDependencies(packageJson) {
    //@todo Remove promisse
    console.log('Init');

    return new Promise((resolve) => {
        resolve(packageJson);
    });
}

async function searchForRepositoryInformation(repositoryName) {
    const repositoryNameUpdated = repositoryName.replace('^', '').replace('~', '')

    return new Promise((resolve) => {
        exec(`npm view ${repositoryNameUpdated} repository.url -json`, (err, stdout) => {
            if (err) {
                throw Error('Cannot read repository name')
            }

            let packageInfo = JSON.parse(stdout)

            if (Array.isArray(packageInfo)) {
                packageInfo = packageInfo[0]
            }

            resolve(getRepositoryInformation(repositoryNameUpdated, packageInfo))
        })
    })
}

function getRepositoryInformation(repositoryName,packageInfo) {
    return {
        name: repositoryName.split('@')[0],
        url: packageInfo,
        version: repositoryName.split('@')[1]
    }
}

function extractURL(repoInfo, headers) {

    const pattern = /(.+:\/\/)?([^\/]+)(\/.*)*/i;

    // this is used to join the 'git@github.com' and 'github.com' in the same format (github.com)
    if (repoInfo.url.includes('@')) {
        repoInfo.url = repoInfo.url.split('@')[1]
    }
    const hostname = `REPO_${pattern.exec(repoInfo.url)[2].toUpperCase()}`;

    publishResponse(hostname, repoInfo, headers)
}

function publishResponse(queue, payload, headers) {
    publisher.publish(queue, JSON.stringify({ headers, payload }))
}

//wait for message to arrive
subscriber.on('message',  (channel, message) => {
    let extractedPackage = extractPackageDependencies(JSON.parse(message).payload);
    headers = (JSON.parse(message).headers)
    extractedPackage.then(package => {
        Object.keys(package.dependencies).map((key) => {
            searchForRepositoryInformation(`${key}@${package.dependencies[key]}`).then(repoInfo => extractURL(repoInfo, headers))
        })
    });
});
