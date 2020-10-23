# NPM PARSE SERVICE
## DESCRIPTION
This service handles the content from `package.json`, 
read all the dependencies and give back all information about them and split by
their repository.

## Project

#### Build Docker
`docker build -t {nodeimage} .`  

#### Run Docker
`docker run -v $(pwd):/usr/src/app  --network=host -ti --rm {nodeimage}`

#### HOW IT WORKS

- Run Docker on section `RUN DOCKER PROJECT`
- Run `node testing/listener.js` to listener the queue with values sent from this service 
- Run `cd testing && node dispatch.js` to init process on this service 

#### Instructions

Listened queue

Queue Name: `NPM_FILE`

payload expected:
`
{
    "headers": {
        "id" : 'xxxxxxx'
    }
    "payload": {
        "name": "Sample",
        "version": "0.81.0",
        "private": true,
        "dependencies": {
            "@bugsnag/js": "7.2.0"
        }
 	}
 }
`

Sent queue

Queue Name: `REPO_* (GITLAB.COM, BITBUCKET.COM, GITHUB.COM ...)`

payload sent: `
{
    "headers": {
        "id" : 'xxxxxxx'
    },
    "payload": {
        "name": "@bugsnag/js",
        "version": "7.2.0",
        "url": "https://github.com/bugsnag/bugsnag-js"
    }
}
`

### Dependencies
 - Docker
 - Node
 - Redis