# DB Setup action

[![Quality](https://github.com/gullerya/db-setup-action/actions/workflows/quality.yml/badge.svg)](https://github.com/gullerya/db-setup-action/actions/workflows/quality.yml)

`db-setup-action` automates install and run of the local DB (Docker based).

Currently supported (in alphabetical order):
- MySQL
- PostgreSQL
- SQLServer

The installation uses official Docker images, see the links in per-DB section below.

Main purpose of this action is to provide an easy and maximum possibly uniform setup of DB server/s for tests automation.

## Inputs

| Key        | Description |
|------------|-------------|
| `image`    | the exact Docker image per DB (see the lists below, under each supported DB section) |
| `port`     | port, that your application will be connecting to the DB with |
| `username` | sets up DB's admin username |
| `password` | sets up DB's admin password |
| `database` | database name, that will be created for your application's use |

> Attention: please review the per-DB sections below for any specifics or deviations of each.

## MySQL

### Usage example

```yml
name: Setup local MySQL
uses: gullerya/db-setup-action@v1
with:
  image: 'mysql:latest'
  port: 8080
  username: mysqluser
  password: mysqlpass
  database: testdb
```

Full Docker images list [find here](https://hub.docker.com/_/mysql?tab=tags&page=1&ordering=last_updated).

### Specific remarks

MySQL has an OOTB provided superuser, `root`.
I've deliberately decided to NOT allow use of that user, setting it's password to a random value.
Please, let me know if this is limiting a usage of the MySQL in some essential way and should be reconsidered.

## PostgreSQL

### Usage example

```yml
name: Setup local PostgreSQL
uses: gullerya/db-setup-action@v1
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
uses: gullerya/db-setup-action@v1
env:
  ACCEPT_EULA: 'Y'
with:
  image: 'mcr.microsoft.com/mssql/server:2019-latest'
  port: 1433
  username: sa
  password: Passw0rd
  database: testdb
```

Full Docker images list [find here](https://hub.docker.com/_/microsoft-mssql-server).

### Specific remarks

In case of SQLServer please pay attention to the following:
- you MUST set environment variable `ACCEPT_EULA=Y` to express your awareness of it
- the `username` MUST be `sa`
- the `password` MUST meet strength requirements as per [this documentation (scroll to the `SA_PASSWORD` section)](https://hub.docker.com/_/microsoft-mssql-server)

> Note: while the password strength may lead to use some special characters, it is better to avoid chars like `$`, `@` since they may cause misinterpretation issues during the docker execution. Let me know of any issue encounterd with this.