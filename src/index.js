const parseBPMN = require('./bpmn/parseBPMN');
const { deployContract } = require('../src/ethereum/web3-wrapper');
const basicEnzianCompiled = require('./ethereum/build/BasicEnzian.json');
const Web3Wrapper = require('../src/ethereum/web3-wrapper');
const BasicEnzianYellow = require('./ethereum');
class EnzianYellow {

    constructor(provider) {
        this.web3Wrapper = new Web3Wrapper(provider);
        this.basicEnzianYellow = new BasicEnzianYellow(this.web3Wrapper);
    }

    async deployAProcess(bpmnModel) {
    
        let parsedBPMN = await parseBPMN(bpmnModel);
        let deployedModel = await this.basicEnzianYellow.deployProcessModel(parsedBPMN);
    
    }

    async executeTask(instance, task) {

    }

}

module.exports = EnzianYellow;

