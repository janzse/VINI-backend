CREATE TABLE users(
    id int IDENTITY(1,1) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    privateKey varchar(64) NOT NULL,
    authorityLevel tinyint NOT NULL,
    forename varchar(100),
    surname varchar(100),
    companyName varchar(100),
    creationDate datetime,
    blocked bit,
    PRIMARY KEY (id)
);

create table annulment_transactions(
    id int IDENTITY(1,1) NOT NULL,
    transactionHash varchar(255) UNIQUE,
    executed bit,
    creationDate datetime,
    PRIMARY KEY (id)
);

create table kfz(
    vin varchar(17) NOT NULL UNIQUE,
    publicKey varchar(255) NOT NULL UNIQUE,
    creationDate datetime,
    PRIMARY KEY (vin)
);

create table key_mapping(
    vin varchar(17) NOT NULL UNIQUE,
    public_key varchar(255) NOT NULL UNIQUE,
    PRIMARY KEY (vin),
    FOREIGN KEY (vin) REFERENCES kfz(vin),
    FOREIGN KEY (public_key) REFERENCES kfz(publicKey)
);

-- USER
insert into user (email, password, privateKey, authorityLevel, forename, surname, companyName, creationDate, blocked)
values ('Luca.Giovanni@outlook.com', 'test1234', 'c2cf55d5062b93ac2cf55d5062b93aa7625d6e4a84f1e6ea7625d6e4a84f1e6e', 1, 'Luca', 'Giovanni', 
'Tuning Schmiede LG', '2018-04-20', 0);

insert into user (email, password, privateKey, authorityLevel, forename, surname, companyName, creationDate, blocked)
values ('max.mustermann@web.de', 'absd123', 'a5bd14d54b3e6fc27c50a5bd14d54b3e6fc1901900dbd4afce0dbd4afce27c50', 1, 'Max', 'Mustermann', 
'Dekra', CURRENT_TIMESTAMP, 1);

insert into user (email, password, privateKey, authorityLevel, forename, surname, companyName, creationDate, blocked)
values ('Alex.Schneider@gmx.de', 'KfzSchneider2309', 'cb5a31db687a31db68777436777436701299fde5377e9501299fde5377e95cb5', 1, 'Alex', 'Schneider', 
'KFZ Werkstatt Schneider', CURRENT_TIMESTAMP, 1);

insert into user (email, password, privateKey, authorityLevel, forename, surname, companyName, creationDate, blocked)
values ('mg-atu@webmail.com', '_wkatu11', 'ef2ad49f6b6d0837dc11f30924eeaa5e444103b12c745ed4c7ea9050c82886fb', 1, 'Mark', 'Gora', 
'ATU', CURRENT_TIMESTAMP, 1);

insert into user (email, password, privateKey, authorityLevel, forename, surname, companyName, creationDate, blocked)
values ('frank.lehmann@t-online.de', 'pwd_serviceFL', 'a68ea99b5b11f1049ffcdd00e08ea99b5b11f1049f173c8ca6fcdd00e0173c8c', 2, 'Frank', 'Lehmann', 
'TUEV Nord', '2018-02-01', 1);

insert into user (email, password, privateKey, authorityLevel, forename, surname, companyName, creationDate, blocked)
values ('leo.biermann@t-online.de', 'TuevSuedPW1', 'beb70404a00d3992eae40fb9b2d04c6f93df331210c2d6cbd5f0d3c77e82d3d7', 2, 'Leo', 'Biermann', 
'TUEV Sued', CURRENT_TIMESTAMP, 1);

insert into user (email, password, privateKey, authorityLevel, forename, surname, companyName, creationDate, blocked)
values ('Sarah.Mueller@kreis-herford.de', 'Bgrts22ku', '80efebed0dfb675f80efb69a7cfd98b29598ebed0dfb675f1b68b295981a7cfd', 3, 'Sarah', 'Mueller', 
'Strassenverkehrsamt Herford', '2018-01-20', 1);

insert into user (email, password, privateKey, authorityLevel, forename, surname, companyName, creationDate, blocked)
values ('Marius.Moeller@kreis-lippe.de', 'Bgrts22ku', '80efebed0dfb675f80efb69a7cfd98b29598ebed0dfb675f1b68b295981a7cfd', 4, 'Marius', 'Moeller', 
'Strassenverkehrsamt Lippe', '2018-01-10', 1);
-- KFZ
insert into kfz (vin, publicKey, creationDate)
values ('W0L000051T2123456', '88C9CDD67AA8F125A75DC720ABB876898D02F23DBD729C08730DF252F1D40915', CURRENT_TIMESTAMP);

insert into kfz (vin, publicKey, creationDate)
values ('WDD1690071J236589', '8B4FD9FD459CE416D577B23617F3AC6604418BD73CEB42AF8F9DB2BBAFDE2466', CURRENT_TIMESTAMP);

insert into kfz (vin, publicKey, creationDate)
values ('WVWZZZ1JZ3W386752', 'D558B6C22A989CB4942D5122A7FF9E7F2DF5F1FE59413B9302AD890B2776CFA2', '2018-05-01');

insert into kfz (vin, publicKey, creationDate)
values ('WX0ZNN1JZ65386231', '0675F8123C41137BF490266C6882F6FFCEF7E86F41A96DD06B1F8BF16D588FB9', '2018-03-02');

insert into kfz (vin, publicKey, creationDate)
values ('WDEZNN1JK653M780E', 'D6E0627333A40A1820DBA00557D94EBDB203939428D6BC2967BBF72E8CD0D93C', '2018-03-12');

insert into kfz (vin, publicKey, creationDate)
values ('WD0LMN1J1113M7005', 'F740C96EC00E68A5A3B1B3BB6AB8AA703D26566932C6C18A83D1DF7A3BCC737E', '2018-04-15');
-- ANNULMENT_TRANSACTION
insert into annulment_transaction (transactionHash, executed, creationDate)
values ('365A559E74309D24989172144B89689F995B119AA93F221530CAB6FEFEF06798', 0, CURRENT_TIMESTAMP);

insert into annulment_transaction (transactionHash, executed, creationDate)
values ('F9D8F6A7FB712D4364B89A44D919299B6D9C29F9F239A75874D82581897E89DD', 0, CURRENT_TIMESTAMP);

insert into annulment_transaction (transactionHash, executed, creationDate)
values ('4098B16C94A28B7ECB1D6FAA1BB38974B1D19466549F61FF37ECFA5427ABB5D3', 0, CURRENT_TIMESTAMP);

insert into annulment_transaction (transactionHash, executed, creationDate)
values ('3D16EE64F696A5D4E85BB36A5002CAA78EA3F87B8CBCD5BF62F8F7B7B6C45F38', 0, CURRENT_TIMESTAMP);

insert into annulment_transaction (transactionHash, executed, creationDate)
values ('84EB8AE690F0E48BF4EE7D84A19D2CCB18B0B1D1DE02BC61CF14994877AC15CC', 0, CURRENT_TIMESTAMP);

insert into annulment_transaction (transactionHash, executed, creationDate)
values ('4A2D176F6DEBAC37EA31C148D10F20249CB83D083F761225F5F9A6D5ED8CD32F', 0, CURRENT_TIMESTAMP);
-- KEY_MAPPING