
const basicEnzianCompiled = require('./build/BasicEnzian.json');

/**
 * Compiles, deploys and also links the two required Contracts:
 * The DecisionLibrary and the BasicEnzian.
 */
const deployContractAndLibrary = async(web3Wrapper, compiled, privateKey) => {

  let basicEnzian_deployed;
  if(privateKey) {
    if(compiled) {
      basicEnzian_deployed = await web3Wrapper.deployContractByAbiAndBytecode(compiled.abi, compiled.evm.bytecode.object, {   }, privateKey);
    } else {
      basicEnzian_deployed = await web3Wrapper.deployContractByAbiAndBytecode(basicEnzianCompiled.abi, basicEnzianCompiled.evm.bytecode.object, {   }, privateKey);
    }
  }
  else {
    if(compiled) {
      basicEnzian_deployed = await web3Wrapper.deployContractByAbiAndBytecode(compiled.abi, compiled.evm.bytecode.object, { from: web3Wrapper.accounts[0]  }, privateKey);
    } else {
      basicEnzian_deployed = await web3Wrapper.deployContractByAbiAndBytecode(basicEnzianCompiled.abi, basicEnzianCompiled.evm.bytecode.object, { from: web3Wrapper.accounts[0]  }, privateKey);
    }
  }
  





    return {
      basicEnzian: basicEnzian_deployed
    };
}

module.exports = deployContractAndLibrary;
