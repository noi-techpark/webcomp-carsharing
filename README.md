<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: CC0-1.0
-->

# Carsharing - Web component

[![REUSE status](https://api.reuse.software/badge/github.com/noi-techpark/webcomp-carsharing)](https://api.reuse.software/info/github.com/noi-techpark/webcomp-carsharing)
[![CI](https://github.com/noi-techpark/webcomp-carsharing/actions/workflows/main.yml/badge.svg)](https://github.com/noi-techpark/webcomp-carsharing/actions/workflows/main.yml)

A web component that shows the Carsharing cars status stored in the Open Data Hub.

Do you want to see it in action? Go to our [web component store](https://webcomponents.opendatahub.bz.it/webcomponent/74248fd5-f768-4c77-9acd-2d90d568c2e1)!

- [Carsharing - Web component](#carsharing---web-component)
  - [Usage](#usage)
    - [Attributes](#attributes)
      - [width](#width)
      - [height](#height)
      - [fontFamily](#fontfamily)
      - [language](#language)
      - [mapAttribution](#mapattribution)
      - [currentLocation](#currentlocation)
      - [zoom](#zoom)
      - [tiles-url](#tiles-url)
  - [Getting started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Source code](#source-code)
    - [.env](#env)
    - [Dependencies](#dependencies)
    - [Build](#build)
  - [Docker environment](#docker-environment)
    - [Installation](#installation)
    - [Dependenices](#dependenices)
    - [Start and stop the containers](#start-and-stop-the-containers)
    - [Running commands inside the container](#running-commands-inside-the-container)
  - [Information](#information)
    - [Support](#support)
    - [Contributing](#contributing)
    - [Documentation](#documentation)
    - [Boilerplate](#boilerplate)
    - [License](#license)


## Usage

Include the webcompscript file `dist/odh-carsharing.js` in your HTML and define the web component like this:

```html
<odh-carsharing
    width="100%"
    height="500px"
    fontFamily="Arial"
    language="it"
    mapAttribution='Map Tiles &copy; <a href="http://developer.here.com">HERE</a>'
    currentLocation='{ "lat": 46.31, "lng": 11.26 }'
    tiles-url="https://1.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?apiKey="
></odh-carsharing>
```

### Attributes

#### width

Give a fixed width to the component. Works only from desktop up. You can use `px` or `%` as unit size.

Examples: `width="100%"`

#### height

Give a fixed height to the component. Works only from desktop up. You can use `px` or `%` as unit size.

Example: `height="500px"`

#### fontFamily

Set the typeface.

Example: `"Arial"`

#### language

Set the default and starting language.

Example: `"en" or "de" or "it"`

#### mapAttribution

Set the acknowledgement for the map tiles provider.

Example: `'Map Tiles &copy; <a href="http://developer.here.com">HERE</a>'`

#### currentLocation

Set the starting point position on the map.

Example: `'{ "lat": 46.31, "lng": 11.26 }'`

#### zoom

Set the zoom level of the map.

Example: `10`

#### tiles-url

Set the URL of the API that provides the tiles.

Example: `"https://1.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?apiKey="`


## Getting started

These instructions will get you a copy of the project up and running
on your local machine for development and testing purposes.

### Prerequisites

To build the project, the following prerequisites must be met:

- Node 14.15.4 / NPM 8.12

For a ready to use Docker environment with all prerequisites already installed
and prepared, you can check out the [Docker environment](#docker-environment)
section.

### Source code

Get a copy of the repository:

```bash
git clone git@github.com:noi-techpark/webcomp-carsharing.git
```

Change directory:

```bash
cd webcomp-carsharing/
```

### .env

Create a `.env` file in the main directory.
Fill it with this content:

```
HEREMAP_API_KEY=YourKey
```

Replace `YourKey` with your API token to use the tiles and the search bar.

### Dependencies

Download all dependencies:

```bash
npm install
```

### Build

Build and start the project:

```bash
npm start
```

The application will be served and can be accessed at [http://localhost:8080](http://localhost:8080).

<!-- ## Tests and linting

The tests and the linting can be executed with the following commands:

```bash
npm run test
npm run lint
``` -->

## Deployment

To create the distributable files, execute the following command:

```bash
npm run build
```

## Docker environment

NOT IMPLEMENTED

For the project a Docker environment is already prepared and ready to use with all necessary prerequisites.

These Docker containers are the same as used by the continuous integration servers.

### Installation

Install [Docker](https://docs.docker.com/install/) (with Docker Compose) locally on your machine.

### Dependenices

First, install all dependencies:

```bash
docker-compose run --rm app /bin/bash -c "npm install"
```

### Start and stop the containers

Before start working you have to start the Docker containers:

```
docker-compose up --build --detach
```

After finished working you can stop the Docker containers:

```
docker-compose stop
```

### Running commands inside the container

When the containers are running, you can execute any command inside the environment. Just replace the dots `...` in the following example with the command you wish to execute:

```bash
docker-compose run --rm app /bin/bash -c "..."
```

Some examples are:

```bash
docker-compose run --rm app /bin/bash -c "npm start"
```

## Information

### Support

For support, please contact [help@opendatahub.bz.it](mailto:help@opendatahub.bz.it).

### Contributing

If you'd like to contribute, please follow the Contributor Guidelines that can be found at [https://github.com/noi-techpark/odh-docs/wiki/Contributor-Guidelines%3A-Getting-started](https://github.com/noi-techpark/odh-docs/wiki/Contributor-Guidelines%3A-Getting-started).

### Documentation

More documentation can be found at [https://opendatahub.readthedocs.io/en/latest/index.html](https://opendatahub.readthedocs.io/en/latest/index.html).

### Boilerplate

The project uses this boilerplate: [https://github.com/noi-techpark/webcomp-boilerplate](https://github.com/noi-techpark/webcomp-boilerplate).

### License

The code in this project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE Version 3 license. See the [LICENSE.md](LICENSE.md) file for more information.
