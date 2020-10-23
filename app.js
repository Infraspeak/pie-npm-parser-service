
fs = require('fs');
var exec = require('child_process').exec;

let extractedDependencies = extractPackageDependencies();

function extractPackageDependencies() {
    return new Promise((resolve) => {
        fs.readFile('./package-mock.json', 'utf8', (err, data) => {
            if (err) {
                throw Error('cannot read file')
            }
            resolve(JSON.parse(data).dependencies)
        })
    });
}

extractedDependencies.then(dependencies => {
    Object.keys(dependencies).map((key) => {
        searchForRepositoryInformation(`${key}@${dependencies[key]}`).then(repoInfo => sendToQueue(repoInfo))
    })
})

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
    let queue = 'REPO_'

    if (repoInfo.url.includes('github.com')) {
        queue = `${queue}GITHUB.COM`
    }

    if (repoInfo.url.includes('gitlab.com')) {
        queue = `${queue}GITLAB.COM`
    }

    if (repoInfo.url.includes('bitbucket.com')) {
        queue = `${queue}BITBUCKET.COM`
    }

    return {
        payload: repoInfo
    }
}

