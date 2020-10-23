
fs = require('fs');
var exec = require('child_process').exec;

// extractPackageDependencies();

// function extractPackageDependencies() {
//     return fs.readFile('./package-mock.json', 'utf8', (err, data) => {
//         if (err) {
//             throw Error ('cannot read file')
//         }
//         return JSON.parse(data).dependencies
//     });
// }



async function searchForRepositoryInformation(repositoryName) {
    return new Promise((resolve, reject) => {
        exec(`npm view ${repositoryName} -json`, function (err, stdout, stderr) {
            if (err) {
                // should have err.code here?  
            }
            resolve({
                name: JSON.parse(stdout).name,
                url: JSON.parse(stdout).repository.url,
            })
        })
    })
}

searchForRepositoryInformation('axios@0.19.2').then(r => console.log(r))


function sendToQueue(payload) {

}

