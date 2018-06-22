const frisby = require('frisby');
let baseUrl='https://vini-ethereum.westeurope.cloudapp.azure.com';
it('existing vin test',function(){
    let existingVin="A0L000051T4567893";
    return frisby.get(baseUrl+'/api/car?vin='+existingVin).expect('status',200);
})
it('no vin test',function(){
    let notExistingVin="thisshouldntexist";
    return frisby.get(baseUrl+'/api/car?vin='+notExistingVin).expect('status',400);
})
it('applyCancelTransaction no param test',function(){ //400 or 403 expected (200 received)
    return frisby.post(baseUrl+'/api/car/applyCancelTransaction').expect('status',400);
})
it('cancelTransaction  get no param test',function(){ //403 expected (200 received)
    return frisby.get(baseUrl+'/api/car/cancelTransaction').expect('status',403);
})
it('cancelTransaction post no param test',function(){ //403 expected (200 received)
    return frisby.post(baseUrl+'/api/car/cancelTransaction').expect('status',403);
})
it('cancelTransaction delete no param test',function(){ //400 or 403 expected (200 received)
    return frisby.del(baseUrl+'/api/car/cancelTransaction').expect('status',403);
})
it('mileage post no param test',function(){ //would expect 403 here (200 received)
    return frisby.post(baseUrl+'/api/car/mileage').expect('status',403);
})
it('car register no param test',function(){ //would expect 400 or 403 here (200 received)
    return frisby.post(baseUrl+'/api/car/register').expect('status',403);
})
it('car service no param test',function(){ //would expect 400 or 403 here (200 received)
    return frisby.post(baseUrl+'/api/car/service').expect('status',403);
})
it('car tuev no param test',function(){ //would expect 400 or 403 here (200 received)
    return frisby.post(baseUrl+'/api/car/tuev').expect('status',403);
})
it('get user token no param test',function(){ //would expect 400 here (500 received)
    return frisby.post(baseUrl+'/api/users/token').expect('status',400);
})
it('get user login status no param test',function(){ //would expect 400 here (200 received)
    return frisby.get(baseUrl+'/api/users/login').expect('status',400);
})
it('register user no param test',function(){ //would expect 400 or 403 here (200 received)
    return frisby.post(baseUrl+'/api/users/register').expect('status',400);
})
it('block user no param test',function(){ //would expect 400 or 403 here (404 received)
    return frisby.del(baseUrl+'/api/users/register').expect('status',400);
})
//http-statuscodes: https://de.wikipedia.org/wiki/HTTP-Statuscode
