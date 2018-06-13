function accessRestrictedArea(req, res) {

    res.send('You have gained access to the area')
}

module.exports =  {
    "accessRestrictedArea": accessRestrictedArea
};