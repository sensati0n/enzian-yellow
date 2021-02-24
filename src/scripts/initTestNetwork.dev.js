const { compileOne } = require('../ethereum/compile.dev');
const Web3Wrapper = require("../ethereum/web3-wrapper.js");


main = async() => {
  web3Wrapper = new Web3Wrapper();
  await web3Wrapper.init();
  
  let library_compiled = await compileOne('DecisionLibrary.sol');
  let library_deployed = await web3Wrapper.deployContract(library_compiled, { from: web3Wrapper.accounts[0]  });

  let basicEnzian_compiled = await compileOne('BasicEnzian.sol', library_deployed._address);


  console.log("LIBRARY ADDRESS");
  console.log(library_deployed._address);
  console.log("CONTRACT_ABI");
  console.log(basicEnzian_compiled.abi);
  return;
}


main();


/*
deployContractAndLibrary = async(web3Wrapper) => {

    let library_compiled = await compileOne('DecisionLibrary.sol');
    let library_deployed = await web3Wrapper.deployContract(library_compiled, { from: web3Wrapper.accounts[0]  });

    let basicEnzian_compiled = await compileOne('BasicEnzian.sol', library_deployed._address);
    let basicEnzian_deployed = await web3Wrapper.deployContractByAbiAndBytecode(basicEnzian_compiled.abi, basicEnzian_compiled.evm.bytecode.object, { from: web3Wrapper.accounts[0]  });

    return {
      decisionLibrary: library_deployed,
      basicEnzian: basicEnzian_deployed
    };
}
*/