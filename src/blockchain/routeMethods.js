import {isConnected} from "./ethNode";

async function checkNodeConnection(req, res, next){
    const connected = await isConnected();

    if(!connected){
        res.status(500);
        res.json({
            "message": "Unable to connect to ethereum node"
        });
        return;
    }
    console.log("Node connection okay");
    next();
}


module.exports = checkNodeConnection;
