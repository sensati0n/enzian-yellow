const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');


const compileAll = () => {

    let contracts = fs.readdirSync(path.resolve(__dirname, 'contracts'));

    contracts.forEach(fileName => compileOne(fileName));
    

}

const compileOne = async (fileName) => {

    //remove output file
    const buildPath = path.resolve(__dirname, 'build');
    fs.removeSync(buildPath + '\\' + fileName.replace('.sol', '.json'));

        
    const contractPath = path.resolve(__dirname, 'contracts', fileName);
    const source = fs.readFileSync(contractPath, 'UTF-8');

    var input = {
        language: 'Solidity',
        sources: {
            [fileName] : {
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
    //console.log(JSON.parse(solc.compile(JSON.stringify(input))));
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    // create build folder if not exists
    fs.ensureDirSync(buildPath);
    fs.outputJsonSync(path.resolve(buildPath,  fileName.replace('.sol', '.json')), output.contracts[fileName][fileName.replace('.sol', '')]);

    for (var contractName in output.contracts[fileName]) {
        // console.log(contractName + ': ' + output.contracts[fileName][contractName].evm.bytecode.object);
    }


}

compileOne(process.argv.slice(2)[0])

//compileAll();
