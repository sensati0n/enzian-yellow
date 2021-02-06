const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);


const contractPath = path.resolve(__dirname, 'contracts', 'Inbox.sol');
const source = fs.readFileSync(contractPath, 'UTF-8');

var input = {
    language: 'Solidity',
    sources: {
        'Inbox.sol' : {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
}; 
console.log(JSON.parse(solc.compile(JSON.stringify(input))));
const output = JSON.parse(solc.compile(JSON.stringify(input)));
//const output = solc.compile(source, 1).contracts;

//console.log(output);
/*
for (var contractName in output.contracts['Inbox.sol']) {
    console.log(
      contractName +
        ': ' +
        output.contracts['Inbox.sol'][contractName].evm.bytecode.object
    );
  }
*/

// create build folder if not exists
fs.ensureDirSync(buildPath);
fs.outputJsonSync(path.resolve(buildPath, 'output.json'), output.contracts['Inbox.sol'].Inbox);

for (var contractName in output.contracts['Inbox.sol']) {
    console.log(contractName + ': ' + output.contracts['Inbox.sol'][contractName].evm.bytecode.object
    );
}




