const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider({}));
const inboxCompiled = require('../../src/ethereum/build/Inbox.json');


describe('The web3 library is setup correctly', () => {

    let INITIAL_MESSAGE = "Hello, there."
    let accounts;

    before(async () => {
        accounts = await web3.eth.getAccounts();
    });
    
    it('and ganache has 10 accounts available', async () => {
       assert.strictEqual(accounts.length, 10);
    });

    it('can compile a contract', async () => {

       await new web3.eth.Contract(inboxCompiled.abi)
            .deploy({
                data:
                inboxCompiled.evm.bytecode.object,
                        arguments: [INITIAL_MESSAGE]
            })
            .send({
                from: accounts[0],
                gas: 3000000,
                gasPrice: '300000000'
            }, function(error, transactionHash){  })
            .on('error', function(error){
                assert.fail("No error should occur.");
            })
            .on('transactionHash', (transactionHash) => {
                assert.ok(transactionHash.startsWith('0x'));
            })
            .on('receipt', (receipt) => {
                assert.ok(receipt.contractAddress);
                assert.ok(receipt.gasUsed);
                assert.ok(receipt.from === accounts[0].toLowerCase());
            })
            .on('confirmation', (confirmationNumber, receipt) => {
                assert.ok(typeof confirmationNumber === number);
                assert.ok(receipt.transactionHash);
                assert.ok(receipt.blockHash);
                assert.ok(receipt.blockNumber);
                assert.ok(receipt.from);
                assert.ok(receipt.gasUsed);

            })
            .then((newContractInstance) => {
                assert.ok(newContractInstance);
            });

    });

    describe('when a contract is already deployed', () => {

        let deployedContract;
        before( async () => {

            deployedContract =  await new web3.eth.Contract(inboxCompiled.abi)
            .deploy({
                data:
                inboxCompiled.evm.bytecode.object,
                arguments: [INITIAL_MESSAGE]
            })
            .send({
                from: accounts[0],
                gas: 3000000,
                gasPrice: '300000000'

            });
        });

        it('can call the contract', async () => {
            const message = await deployedContract.methods.message().call();
            assert.strictEqual(message, INITIAL_MESSAGE);
        });
    });

});