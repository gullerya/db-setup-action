# RDBMS Setup action

TBD

## Inputs

### `image`

**Required** the exact Docker image per DB (see the list below)

### `port`

**Required** port, that your application will be connecting to the DB with

### `username`

**Required** username of the admin

> SQL Server: please specify `sa` here; SQL Server does NOT allow to change admin user name, so `sa` will anyway be used, but it is better to be explicit and put it anyway.

### `password`

**Required** password of the admin user

> SQL Server: the password MUST be of a certain complexity, please read SQL Server Docker documentation.

### `database`

**Required** database name, that your application will be using

## Example usage

uses: actions/rdbms-setup-action
with:
  image: <>
  port: <>
  username: <>
  password: <>
  database: <>