const assert = require('assert');
const Web3 = require('web3');
const ganache = require('ganache-cli');

const web3 = new Web3(ganache.provider({}));

describe('The web3 library is setup correctly', () => {

    
    it('and has 10 accounts available', async () => {

        
        let accounts = await web3.eth.getAccounts();
        assert.strictEqual(accounts.length, 10);

        /*
        let factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
            .deploy({ data: compiledFactory.bytecode })
            .send({ from: accounts[0], gas: '1000000'});
            */
    })
    

});