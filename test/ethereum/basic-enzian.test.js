const assert = require('assert');
const { deployContract, web3 } = require('./../../src/ethereum/web3-wrapper');

const basicEnzianCompiled = require('../../src/ethereum/build/BasicEnzian.json');


describe('Test the BasicEnzian Contract', () => {
    
    let contractInstance;
    let accounts;

    before(async () => {
        accounts = await web3.eth.getAccounts();
        contractInstance = await deployContract(basicEnzianCompiled, accounts[0]);
    });

    it('checks that contract is compiled', async () => {
        assert(basicEnzianCompiled);
    });

    it('checks that contract is deployed', async () => {
        assert(contractInstance);
    });



    describe("Test the functionallity of BasicEnzian", () => {

    });

    

});