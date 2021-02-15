const assert = require('assert');
const ganache = require('ganache-cli');

const path = require('path');
const fs = require('fs-extra');
const BasicEnzianYellow = require('../../src/ethereum');
const Web3Wrapper = require('../../src/ethereum/web3-wrapper');
const parseBPMN = require('../../src/bpmn/parseBPMN');


// SEE THE BASIC-ENZIAN.TEST.JS - FILE

describe('Test the BasicEnzianYellow class', () => {

    let web3Wrapper, enzian;
    let gatewayContents, parsedBPMN;

    before(async () => {

        web3Wrapper = new Web3Wrapper(ganache.provider({}));
        await web3Wrapper.init();
        enzian = new BasicEnzianYellow(web3Wrapper);

        // load sample process model
        gatewayContents = await fs.readFile(
            path.resolve(__dirname, '../resources' , 'gateway.bpmn'), 'utf8');
        parsedBPMN = await parseBPMN(gatewayContents);
    });

    it('can deploy an enzian process', async () => {
        let contract = await enzian.deployEnzianProcess(parsedBPMN, web3Wrapper.accounts[0]);
    });

});