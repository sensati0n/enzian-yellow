const assert = require('assert');
const Web3 = require('web3');
const ganache = require('ganache-cli');
const Web3Wrapper = require('../../src/ethereum/web3-wrapper');

const deployContractAndLibrary = require('../../src/ethereum/deploy-enzian');

describe('The Library and Contract gets compiled, deployed and linked', () => {


    it('works', async () => {

        let web3Wrapper = new Web3Wrapper(ganache.provider({
            "mnemonic": "enzian yellow"
          }));
        await web3Wrapper.init();

        let returnvalue = await deployContractAndLibrary(web3Wrapper);

        assert(returnvalue);
    });

});
