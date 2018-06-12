create table users
(
  id             int identity
    primary key,
  email          varchar(255) not null
    unique,
  password       varchar(255) not null,
  privateKey     varchar(64)  not null,
  authorityLevel tinyint      not null,
  forename       varchar(100),
  surname        varchar(100),
  companyName    varchar(100),
  creationDate   datetime,
  blocked        bit,
  publicKey      varchar(64)  not null
)
go

create table kfz
(
  vin          varchar(17)  not null
    primary key
    unique,
  publicKey    varchar(255) not null
    unique,
  creationDate datetime
)
go

create table annulment_transactions
(
  id              int identity
    primary key,
  transactionHash varchar(255)
    unique,
  executed        bit,
  creationDate    datetime
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


