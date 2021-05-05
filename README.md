<p align="center">
  <h1 align="center">
  EsferaSoluciones
  </h1>
</p>

<p align="center">
  <b>
  Esfera template API
  </b><br>
</p>

[//]: # (BADGES)

## Description

Admin template API for EsferaSoluciones

## Requirements

* Make sure you have [NVM](https://github.com/nvm-sh/nvm) installed
* Make sure you have [Docker](https://www.docker.com) installed

## Installation

Make sure you have `nvm` installed.

```bash
# Make sure to use NodeJS LTS!
$ nvm use

# Install dependencies
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Docker to running app
docker-compose up --build

## Create user
docker ps - to get container id
docker exec -it <container id> sh
npx nestjs-command create:user <email> <password>
