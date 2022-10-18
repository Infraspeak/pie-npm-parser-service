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
    return new Promise((resolve) => {
        exec(`npm view ${repositoryName} -json`, (err, stdout) => {
            try {

                let packageInfo = JSON.parse(stdout)

                if (Array.isArray(packageInfo)) {
                    packageInfo = packageInfo[0]
                }

                resolve({
                    name: packageInfo.name,
                    url: packageInfo.repository.url,
                    version: packageInfo.version
                })

            } catch(err) {
                console.error(err)
            }
        })
    })
}

function extractURL(repoInfo) {
    try {
        const pattern = /(.+:\/\/)?([^\/]+)(\/.*)*/i;

        // this is used to join the 'git@github.com' and 'github.com' in the same format (github.com)
        if (repoInfo.url.includes('@')) {
            repoInfo.url = repoInfo.url.split('@')[1]
        }
        var hostname = `REPO_${pattern.exec(repoInfo.url)[2].toUpperCase()}`;
    
        publishResponse(hostname, repoInfo)
    } catch {
        console.log('Error on parsing repository data!')
    }
   
}

function publishResponse(queue, payload) {
    publisher.publish(queue, JSON.stringify({ headers, payload }))
    console.log('Response published!')
}

//wait for message to arrive
subscriber.on('message', (channel, message) => {
    let extractedPackage = extractPackageDependencies(JSON.parse(message).payload);
    headers = (JSON.parse(message).headers)
    extractedPackage.then(package => {
        Object.keys(package.dependencies).map((key) => {
            searchForRepositoryInformation(`${key}@${package.dependencies[key]}`).then(repoInfo => extractURL(repoInfo, headers))
        })
    });
});