-- we don't know how to generate database vini-database (class Database) :(
create table users
(
  id             int identity
    primary key,
  email          varchar(255) not null
    unique,
  password       varchar(255) not null,
  privateKey     varchar(64)  not null,
  authorityLevel tinyint      not null,
  forename       varchar(100) not null,
  surname        varchar(100) not null,
  companyName    varchar(100) not null,
  creationDate   datetime     not null,
  blocked        bit          not null,
  publicKey      varchar(64)  not null
)
go

create table annulment_transactions
(
  id              int identity
    primary key,
  transactionHash varchar(255) not null
    unique,
  rejected        bit          not null,
  creationDate    datetime     not null,
  user_id         int          not null
    constraint annulment_transactions_users_id_fk
    references users
)
go

create table kfz
(
  vin          varchar(17)  not null
    primary key
    unique,
  publicKey    varchar(255) not null
    unique,
  creationDate datetime     not null,
  privateKey   varchar(255) not null,
  headTx       varchar(255) not null
)
go

create table bearer_tokens
(
  token      varchar(255) not null
    primary key
    unique,
  user_id    int          not null
    unique
    references users,
  expiration datetime     not null
)
go


