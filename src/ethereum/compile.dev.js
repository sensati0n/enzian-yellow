const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');
const { DECISION_LIBRARY_ROPSTEN } = require('../global');

const compileAll = async () => {

    await compileOne('DecisionLibrary.sol');
    compileOne('BasicEnzian.sol');

}

const compileOne = async (fileName, libraryaddress) => {
            //remove output file
            const buildPath = path.resolve(__dirname, 'build');
            fs.removeSync(buildPath + '\\' + fileName.replace('.sol', '.json'));


            const contractPath = path.resolve(__dirname, 'contracts', fileName);
            const source = fs.readFileSync(contractPath, 'UTF-8');

            let input;

            if(fileName === 'BasicEnzian.sol') {
                input = {
                language: 'Solidity',
                sources: {
                    [fileName] : {
                        content: source
                    }
                },
                settings: {
                    libraries: {
                        // The top level key is the the name of the source file where the library is used.
                        // If remappings are used, this source file should match the global path
                        // after remappings were applied.
                        // If this key is an empty string, that refers to a global level.
                        'DecisionLibrary.sol': {
                        'DecisionLibrary': libraryaddress
                        //'DecisionLibrary': DECISION_LIBRARY_ROPSTEN
                        }
                    },
                    outputSelection: {
                        '*': {
                            '*': [ '*' ]
                        }
                    }
                }
                }; 
            }
            else if(fileName === 'DecisionLibrary.sol') {
                input = {
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

            }

            const output = JSON.parse(solc.compile(JSON.stringify(input), { import: getDecisionLibrarySource }));

            // create build folder if not exists
            fs.ensureDirSync(buildPath);
            fs.outputJsonSync(path.resolve(buildPath,  fileName.replace('.sol', '.json')), output.contracts[fileName][fileName.replace('.sol', '')]);

            return output.contracts[fileName][fileName.replace('.sol', '')];
    

}

function getDecisionLibrarySource() {

    const source = fs.readFileSync(path.resolve(__dirname, 'contracts', 'DecisionLibrary.sol'), 'UTF-8');

      return {
        contents:
        source
      };
}


compileAll();

module.exports = { compileOne }