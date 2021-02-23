
const basicEnzianCompiled = require('./build/BasicEnzian.json');

/**
 * Compiles, deploys and also links the two required Contracts:
 * The DecisionLibrary and the BasicEnzian.
 */
const deployContractAndLibrary = async(web3Wrapper) => {

    let basicEnzian_deployed = await web3Wrapper.deployContractByAbiAndBytecode(basicEnzianCompiled.abi, basicEnzianCompiled.evm.bytecode.object, { from: web3Wrapper.accounts[0]  });

    return {
      basicEnzian: basicEnzian_deployed
    };
}

module.exports = deployContractAndLibrary;
