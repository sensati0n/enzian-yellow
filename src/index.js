const parseBPMN = require('./bpmn/parseBPMN');
const Web3Wrapper = require('./ethereum/web3-wrapper');
const BasicEnzianYellow = require('./ethereum');

class EnzianYellow {

    constructor(provider) {
        console.log("Enzian-Dev!");
        this.web3Wrapper = new Web3Wrapper(provider);
        this.basicEnzianYellow = new BasicEnzianYellow(this.web3Wrapper);
    }


    async parseBpmnModel(bpmnModel) {
        return await parseBPMN(bpmnModel);
    }

    /**
     *
     * @param enzianModel
     * @param compiled OPTIONAL
     * @param privateKey OPTIONAL
     * @returns {Promise<*|*|*>}
     */
    async deployEnzianModel(enzianModel, compiled = undefined, privateKey = undefined) {
        let deployedModel;

        if(privateKey){
            deployedModel = await this.basicEnzianYellow.deployEnzianProcessSelfSigned(enzianModel, privateKey, compiled);
        } else {
            if(!this.web3Wrapper.initialized) await this.web3Wrapper.init();

            console.log("Deploy Contract with account ", this.web3Wrapper.accounts[0]);
            deployedModel = await this.basicEnzianYellow.deployEnzianProcess(enzianModel, this.web3Wrapper.accounts[0], compiled);
        }

        return deployedModel;
    }

    async deployBPMNProcess(bpmnModel) {
    
        if(!this.web3Wrapper.initialized) {
            await this.web3Wrapper.init();
        }

        let parsedBPMN = await this.parseBpmnModel(bpmnModel);
        let deployedModel = await this.basicEnzianYellow.deployEnzianProcess(parsedBPMN, this.web3Wrapper.accounts[0]);

        return { parsedBPMN, deployedModel };
    }

    async executeTask(instance, task, account) {

        return this.basicEnzianYellow.executeTask(instance, task, account);
    }

    /**
     * Executes Task by Contract Address and Task ID.
     * @param contractAddress
     * @param task ID
     * @param privateKey OPTIONAL
     * @returns {Promise<Event>}
     */
    async executeTaskByAddress(contractAddress, task, privateKey) {
        if(!this.web3Wrapper.initialized) {
            await this.web3Wrapper.init();
        }
        return this.basicEnzianYellow.executeTaskByAddress(contractAddress, task, privateKey);
    }

    async updateProcessVariable(instance, variableName, newValue, account) {
        return this.basicEnzianYellow.updateProcessVariable(instance, variableName, newValue, account);
    }

    async eventlog(instance) {
        return this.basicEnzianYellow.eventlog(instance);
    }

    async eventlogByAddress(address) {
        if(!this.web3Wrapper.initialized) {
            await this.web3Wrapper.init();
        }
        return this.basicEnzianYellow.eventlogByAddress(address);
    }

}

module.exports = EnzianYellow;

