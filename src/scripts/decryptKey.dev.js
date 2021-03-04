// https://ethereum.stackexchange.com/questions/3720/how-do-i-get-the-raw-private-key-from-my-mist-keystore-file

let address = '';
let password = '';

const keyth = require('keythereum');
const path = require('path');

const keyPath = path.resolve(__dirname, 'key');
var keyobj = keyth.importFromFile(address, keyPath);

var privateKeyPlain = keyth.recover(password, keyobj);

let privateKeyHex = privateKeyPlain.toString('hex');
console.log('Your private key is: ', privateKeyHex);