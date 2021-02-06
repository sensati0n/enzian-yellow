const assert = require('assert');
const Web3 = require('web3');
const ganache = require('ganache-cli');

const web3 = new Web3(ganache.provider({}));
const compiledContract = require('../../src/ethereum/build/output.json');


describe('All contracts are compiled in this stage', () => {

    
    it('checks that all contracts are compiled', async () => {



    })
    

});