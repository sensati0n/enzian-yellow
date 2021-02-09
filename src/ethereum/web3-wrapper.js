const Web3 = require('web3');
const ganache = require('ganache-cli');


const web3 = new Web3(ganache.provider({}));




// Assumption: Metamast has already imjected a Web3 instance into the page
// !! FALSE FOR 2021 !! AND FOR SERVER-SIDE RENDERING !!

//const web3 = new Web3(window.web3.currentProvider);


/*


if(typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
    // Executed inside the browser, and metamask is available
    web3 = new Web3(window.web3.currentProvider);
} else {
    // We are on the browser *OR* the user is not running metamask
    const provider = new Web3.providers.HttpProvider(
        'https://rinkeby.infura.io/v3/559faf9ec0034bb9a265c681df791cdf',
    );
    web3 = new Web3(provider);
}
*/


const deployContract = async (compiled, account) => {

    
    let returnContract;

    await new web3.eth.Contract(compiled.abi)
    .deploy({
        data: compiled.evm.bytecode.object,
        arguments: ["INITIAL_MESSAGE"]
    })
    .send({
        from: account,
        gas: 1000000,
        gasPrice: '30000000000000'
    }, function(error, transactionHash){  })
    .on('error', function(error){
        assert.fail("No error should occur.");
    })
    .then((newContractInstance) => {
        returnContract = newContractInstance;
    });

    return returnContract;

}


module.exports = {web3, deployContract};