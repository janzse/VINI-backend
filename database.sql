create table user 
(
    id integer not null auto_increment,
    email varchar(256) not null unique,
    password varchar(256) not null,
    privateKey varchar(64) not null,
    authorityLevel integer(1) not null,
    forename varchar(100),
    surname varchar(100),
    companyName varchar(100),
    creationDate date,
    blocked boolean,
    primary key(id)
);

create table annulment_transaction 
(
    id integer not null auto_increment,
    transactionHash varchar(256) unique,
    executed boolean,
    creationDate date,
    primary key(id)
);

create table kfz
(
    vin varchar(17) not null unique,
    publicKey varchar(255),
    creationDate date,
    primary key(vin)
);

create table key_mapping
(
    vin varchar(17) not null unique,
    public_key varchar(256) not null unique,
    primary key(vin),
    foreign key(vin) references user(id),
    foreign key(public_key) references kfz(publicKey)
);