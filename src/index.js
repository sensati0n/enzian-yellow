const parseBPMN = require('./bpmn/parseBPMN');
const { deployContract } = require('./ethereum/web3-wrapper');
const basicEnzianCompiled = require('./ethereum/build/BasicEnzian.json');
const Web3Wrapper = require('./ethereum/web3-wrapper');
const BasicEnzianYellow = require('./ethereum');

class EnzianYellow {

    constructor(provider) {
        this.web3Wrapper = new Web3Wrapper(provider);
        this.basicEnzianYellow = new BasicEnzianYellow(this.web3Wrapper);
    }

    async deployBPMNProcess(bpmnModel) {
    
        if(!this.web3Wrapper.initialized) {
            await this.web3Wrapper.init();
        }

        let parsedBPMN = await parseBPMN(bpmnModel);
        let deployedModel = await this.basicEnzianYellow.deployEnzianProcess(parsedBPMN, this.web3Wrapper.accounts[0]);

        return { parsedBPMN, deployedModel };
    }

    async executeTask(instance, task, account) {

        return this.basicEnzianYellow.executeTask(instance, task, account);
    }

    async updateProcessVariable(instance, variableName, newValue, account) {
        return this.basicEnzianYellow.updateProcessVariable(instance, variableName, newValue, account);
    }

    async eventlog(instance) {
        return this.basicEnzianYellow.eventlog(instance);
    }

}

module.exports = EnzianYellow;

