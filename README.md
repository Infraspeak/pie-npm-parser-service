# NPM PARSE SERVICE
## Description
This service handles the content from `package.json`, 
read all the dependencies and give back all information about them and split by
their repository.

## Project Setup
#### Build Docker
`docker build -t infraspeak-pie/npm_parser_service -f .docker/Dockerfile .`  

## Project Run
#### Run Docker
`docker run --rm --network infraspeak-pie infraspeak-pie/npm_parser_service`

## How it works

### Listened event
Event Name: `NPM_FILE`

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

### Sent event
Event Name: `REPO_* (GITLAB.COM, BITBUCKET.COM, GITHUB.COM ...)`

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