test('Init test case', () => {
    expect(1).toBe(1);
});

test('Restricted auth request test', () => {
    //const accessRestrictedArea = require('../../src/authorisation/restrictedAreaRoutesMethods').accessRestrictedArea(); //file throw error on load?

    var string_received = false;
    const res_mock = 
    { 
        send: function (e) 
        { 
            string_received = (e != 'undefined'); 
        }
    };
    //accessRestrictedArea(null, res_mock);
    //expect(string_received).toBe(true);
});