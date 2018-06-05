/*
@author=Lukas Stuckstette
*/

//User account class
function UserAccount(privateKey, email, password, authorityLevel, forename, surname, companyName) {

    this.privateKey = privateKey;
    this.email = email;
    this.password = password;
    this.authorityLevel = authorityLevel;
    this.forename = forename;
    this.surname = surname;
    this.companyName = companyname;
    this.creationDate = -1;
    this.blocked = false;

    this.setBlocked = function (isBlocked) {
        this.blocked = isBlocked;
    }

    this.setCreationDate = function (time) {
        this.creationDate = time;
    }

    this.validateUser = function (password) {
        return this.password === password;
    };
}