# FusionAuth Ruby client library examples

## Prerequisites

* ruby 
* bundler
* a FusionAuth instance with an API key set up

[Download FusionAuth for free](https://fusionauth.io/download)

## Installation

```
bundle install
```

## Usage

To set up an application for interactive login:

```
fusionauth_api_key=<your api key> ruby setup.rb
```

To set up an application for an API, where you will be getting the token via the Login API:

```
fusionauth_api_key=<your api key> ruby setup-api.rb
```
