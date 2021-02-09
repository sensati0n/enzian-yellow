const assert = require('assert');
const ganache = require('ganache-cli');
const Web3Wrapper = require('../../src/ethereum/web3-wrapper');

const inboxCompiled = require('../../src/ethereum/build/Inbox.json');

describe('The Web3Wrapper works and', () => {

    let web3Wrapper;
    let my_address;
    let INITIAL_MESSAGE = "Hello, there."

    before(async () => {
        web3Wrapper = new Web3Wrapper(ganache.provider({}));
        await web3Wrapper.init();
        my_address = web3Wrapper.accounts[0];
    });
    
    it('can deploy a contract', async () => {

        let newContractInstance = await web3Wrapper.deployContract(inboxCompiled, {
            arguments: [INITIAL_MESSAGE],
            from: my_address
        })

        assert(newContractInstance);

    });

    describe('when a contract is already deployed', () => {

        let deployedContract;
        before( async () => {

            deployedContract = await web3Wrapper.deployContract(inboxCompiled, {
                arguments: [INITIAL_MESSAGE],
                from: my_address
            });

        });

        it('can call the contract', async () => {
            const message = await deployedContract.methods.message().call();
            assert.strictEqual(message, INITIAL_MESSAGE);
        });

    });

});