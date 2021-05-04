const { compileOne } = require('../ethereum/compile.dev');
const Web3Wrapper = require("../ethereum/web3-wrapper.js");
const Web3 = require('web3');
const config = require("../../config/config")

main = async() => {

  // CHRYSALIS
  // This was used to initialize the chrysalis-bpm Blockchain Network.
  // let provider = new Web3(new Web3.providers.HttpProvider('http://85.215.90.101:4191'))

  
  let provider = new Web3(new Web3.providers.HttpProvider(global.gConfig.node_http_url + ':' +
      global.gConfig.node_http_port))
  web3Wrapper = new Web3Wrapper(provider);
  await web3Wrapper.init();

  // Compile and Deploy the DecisionLibrary Contract
  let library_compiled = await compileOne('DecisionLibrary.sol');

  // let library_deployed = await web3Wrapper.deployContract(library_compiled, { from: web3Wrapper.accounts[0]  });
  let library_deployed = await web3Wrapper.deployContractSelfSigned(library_compiled);

  console.log(library_deployed)

  //when using chrysalis, library_deployed has a field contractAddress || when using metamask, it is called _address
  //let basicEnzian_compiled = await compileOne('BasicEnzian.sol', library_deployed._address);

  // Compile the Process Contract. The output is written to the src/ethereum/build folder (BasicEnzian.json)
  let basicEnzian_compiled = await compileOne('BasicEnzian.sol', library_deployed.contractAddress);


  console.log("LIBRARY ADDRESS");
  console.log(library_deployed.contractAddress);
  console.log("CONTRACT_ABI");
  console.log(basicEnzian_compiled.abi);
  return;
}

main();
