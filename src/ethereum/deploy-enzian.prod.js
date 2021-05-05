
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
  
  let basicEnzian_deployed;
  if(compiled) {
    basicEnzian_deployed = await web3Wrapper.deployContractByAbiAndBytecode(compiled.abi, compiled.evm.bytecode.object, opts, privateKey);
  } else {
    basicEnzian_deployed = await web3Wrapper.deployContractByAbiAndBytecode(basicEnzianCompiled.abi, basicEnzianCompiled.evm.bytecode.object, opts, privateKey);
  }


  





    return {
      basicEnzian: basicEnzian_deployed
    };
}

module.exports = deployContractAndLibrary;
