const { compileOne } = require('../ethereum/compile.dev');
const Web3Wrapper = require("../ethereum/web3-wrapper.js");
const Web3 = require('web3');

main = async() => {


// CHRYSALIS
// let provider = new Web3(new Web3.providers.HttpProvider('http://85.215.90.101:4191'))

// GANACHE
let provider = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))


  web3Wrapper = new Web3Wrapper(provider);
  await web3Wrapper.init();

  // not permitted
  // web3Wrapper.web3.eth.personal.unlockAccount('0x41816Df8652F4852930DD3820d5c898344e6D1A6', 'pw2')
  

  let library_compiled = await compileOne('DecisionLibrary.sol');

  // let library_deployed = await web3Wrapper.deployContractSelfSigned(library_compiled, { from: web3Wrapper.accounts[0]  });
   let library_deployed = await web3Wrapper.deployContract(library_compiled, { from: web3Wrapper.accounts[0]  });

   console.log(library_deployed)

   //when using chrysalis, library_deployed has a field contractAddress || when using metamask, it is called _address
  //let basicEnzian_compiled = await compileOne('BasicEnzian.sol', library_deployed.contractAddress);
  let basicEnzian_compiled = await compileOne('BasicEnzian.sol', library_deployed._address);





  console.log("LIBRARY ADDRESS");
  console.log(library_deployed.contractAddress);
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