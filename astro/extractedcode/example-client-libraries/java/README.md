# FusionAuth Java client library examples

## Prerequisites

* Java 
* Maven
* a FusionAuth instance with an API key set up

[Download FusionAuth for free](https://fusionauth.io/download)

## Installation

```
mvn compile 

```

## Usage

```
mvn exec:java \
  -Dexec.mainClass="io.fusionauth.example.Setup" # or other class \
  -Dfusionauth.api.key=<your API key>
```
