
const { compileOne } = require('./compile.dev');

/**
 * Compiles, deploys and also links the two required Contracts:
 * The DecisionLibrary and the BasicEnzian.
 */
const deployContractAndLibrary = async(web3Wrapper) => {

    let library_compiled = await compileOne('DecisionLibrary.sol');
    let library_deployed = await web3Wrapper.deployContract(library_compiled, { from: web3Wrapper.accounts[0]  });

    let basicEnzian_compiled = await compileOne('BasicEnzian.sol', library_deployed._address);
    let basicEnzian_deployed = await web3Wrapper.deployContractByAbiAndBytecode(basicEnzian_compiled.abi, basicEnzian_compiled.evm.bytecode.object, { from: web3Wrapper.accounts[0]  });

    return {
      decisionLibrary: library_deployed,
      basicEnzian: basicEnzian_deployed
    };
}

module.exports = deployContractAndLibrary;
