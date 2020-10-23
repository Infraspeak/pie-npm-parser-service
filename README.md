# NPM PARSE SERVICE

# Docker Instruction

#### Build Docker
`docker build -t {nodeimage} .`  

#### Run Docker
`docker run -v $(pwd):/usr/src/app  --network=host -ti --rm {nodeimage}`