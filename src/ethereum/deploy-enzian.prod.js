
const basicEnzianCompiled = require('./build/BasicEnzian.json');

/**
 * Compiles, deploys and also links the two required Contracts:
 * The DecisionLibrary and the BasicEnzian.
 */
const deployContractAndLibrary = async(web3Wrapper, compiled, privateKey) => {

  let opts = { };
  if(!privateKey){
    opts = { from: web3Wrapper.accounts[0]  }
  }
  let tempCompiled = compiled;
  if(!tempCompiled){
    tempCompiled = basicEnzianCompiled;
  }

  let basicEnzian_deployed = await web3Wrapper.deployContractByAbiAndBytecode(tempCompiled.abi, tempCompiled.evm.bytecode.object, opts, privateKey);

   return {
     basicEnzian: basicEnzian_deployed
   };
}

module.exports = deployContractAndLibrary;
