# RDBMS Setup action

[![Quality pipeline](https://github.com/gullerya/rdbms-setup-action/actions/workflows/quality.yml/badge.svg)](https://github.com/gullerya/rdbms-setup-action/actions/workflows/quality.yml)

`rdbms-setup-action` automates install and run of the local RDBMS (Docker based, exposed to host).
Currently supported:
- PostgreSQL
- SQLServer

The installation uses official Docker images, see the links in per-DB section below.

Main purpose of this action is to provide an easy and maximum possibly uniform setup of RDBMS server/s for tests automation.

## Inputs

| Key        | Description |
|------------|-------------|
| `image`    | the exact Docker image per DB (see the lists below, under each supported DB section) |
| `port`     | port, that your application will be connecting to the DB with |
| `username` | sets up DB's admin username |
| `password` | sets up DB's admin password |
| `database` | database name, that we'll create and your application will be using |

> SQLServer: please __always__ set `username: sa` due to SQLServer NOT allows to alter admin user; `sa` will be used anyway, but it is better to be explicit.

> SQLServer: the password MUST be of a certain complexity, see the remarks in SQLServer section below.

## PostgreSQL

### Usage example

```yml
name: Setup local PostgreSQL
uses: actions/rdbms-setup-action
with:
  image: 'postgres:alpine'
  port: 5432
  username: postgres
  password: postgres
  database: testdb
```

Full Docker images list [find here](https://hub.docker.com/_/postgres?tab=tags&page=1&ordering=last_updated).

## SQLServer

### Usage example

```yml
name: Setup SQLServer
uses: ./
env:
	ACCEPT_EULA: 'Y'
with:
	image: 'mcr.microsoft.com/mssql/server:2019-latest'
	port: 1433
	username: sa
	password: Pa$$w0rd
	database: testdb
```

Full Docker images list [find here](https://hub.docker.com/_/microsoft-mssql-server).

### Specific remarks

In case of SQLServer please pay attention to the following:
- you MUST set environment variable `ACCEPT_EULA=Y`
- the `username` MUST be `sa`
- the `password` MUST meet strength requirements as per [this documentation (scroll to the `SA_PASSWORD` section)](https://hub.docker.com/_/microsoft-mssql-server)