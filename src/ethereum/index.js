const deployContractAndLibrary = require('./deploy-enzian');
const basicEnzianCompiled = require('./build/BasicEnzian.json');

/**
 * Knows contract information such as specific events
 */
class BasicEnzianYellow {

    constructor(web3Wrapper) {
        this.web3Wrapper = web3Wrapper;
    }

    async deployEnzianProcess (parsedBPMN, account) {

        // let deployedContract = await this.web3Wrapper.deployContract(basicEnzianCompiled, {
        //     from: account
        // });

        let deployedContract = await deployContractAndLibrary(this.web3Wrapper);

       for(let count = 0; count < parsedBPMN.obj.length; count++) {
           let elem = parsedBPMN.obj[count];

           await deployedContract.basicEnzian.methods.createTask(
               elem.task.id,
               elem.task.name,
               elem.task.resource? elem.task.resource : '0x0000000000000000000000000000000000000000',
               elem.proceedingMergingGateway? elem.proceedingMergingGateway.id: 0,
               elem.requirements.map(req => req.id), []
            )
           .send({ from: account, gas: 1000000 });
        }

        return deployedContract.basicEnzian;
    }

    async executeTask(contractInstance, task, account) {
        
        let receipt = await contractInstance.methods.completing(task)
           .send({ from: account, gas: 1000000 })
           return receipt.events.TaskCompleted.returnValues.success;
    }

    async eventlog(contractInstance) {
        let eventLog = await contractInstance.methods.getDebugStringeventLog().call({from: this.web3Wrapper.accounts[0]});
        return eventLog;
    }

}

module.exports = BasicEnzianYellow;