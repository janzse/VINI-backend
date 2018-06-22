test('Init test case', () => {
    expect(1).toBe(1);
});

test('Restricted auth request test', () => {

    var string_received = false;
    const res_mock = 
    { 
        send: function (e) 
        { 
            string_received = (e != 'undefined'); 
        }
    };
    
    //is there a better way?
    const accessRestrictedArea = require('../../src/authorisation/routeMethods').isAuthorised();
    
    //accessRestrictedArea(null, res_mock);
    expect(string_received).toBe(false);
    
});

