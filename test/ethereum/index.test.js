const assert = require('assert');
const BasicEnzianYellow = require('../../src/ethereum');
const Web3Wrapper = require('../../src/ethereum/web3-wrapper');
const ganache = require('ganache-cli');


describe('Test the BasicEnzianYellow class', () => {

    let web3Wrapper, enzian;

    before(async () => {

        web3Wrapper = new Web3Wrapper(ganache.provider({}));
        await web3Wrapper.init();
        enzian = new BasicEnzianYellow(web3Wrapper);
    });

    it('runs', async () => {

        let contract = await enzian.deployProcessModel({
            obj: [
                {task: 'start', requirements: []},
                {task: 'A', requirements: ['start']},
                {task: 'B', requirements: ['A']},
                {task: 'end', requirements: ['B']},
            ]
        }, web3Wrapper.accounts[0]);

        let lastTask = await contract.methods.getTaskById(3).call();
        console.log('lastTask', lastTask);
    });

});