const deployContractAndLibrary = require('./deploy-enzian');
const{ GatewayType, DecisionType, operatorBySymbol } = require('../contract-consts');


/**
 * Knows contract information such as specific events
 */
class BasicEnzianYellow {

    constructor(web3Wrapper) {
        this.web3Wrapper = web3Wrapper;
    }

    async deployEnzianProcess (parsedBPMN, account) {

        let deployedContract = await deployContractAndLibrary(this.web3Wrapper);

       for(let count = 0; count < parsedBPMN.obj.length; count++) {
           let elem = parsedBPMN.obj[count];

           if(!elem.decisions) {
               await deployedContract.basicEnzian.methods.createTask(
                    elem.task.id,
                    elem.task.name,
                    elem.resource? elem.resource : '0x0000000000000000000000000000000000000000',
                    elem.proceedingMergingGateway? elem.proceedingMergingGateway.id: 0,
                    elem.requirements.map(req => req.id), []
                )
                .send({ from: account, gas: 1000000 });
           }
           else {

            //which decision int vs string
            let thedecisiontype = elem.decisions.decisions.processVariable.startsWith('\'\'') ? DecisionType.STRINGDESC.id : DecisionType.INTDESC.id;

            await deployedContract.basicEnzian.methods.createTaskWithDecision(
                elem.task.id,
                elem.task.name,
                elem.resource? elem.resource : '0x0000000000000000000000000000000000000000',
                elem.proceedingMergingGateway? elem.proceedingMergingGateway.id: 0,
                elem.requirements.map(req => req.id),
                // if competitors are available, map them to their corresponding id in the model and send the array of competitor-ids
                elem.competitors? _.map(elem.competitors, (ele) => { return parsedBPMN.idByName(ele); }) : [],
                {
                    //endBoss: elem.decisions.lastTask,
                    endBoss: parseInt(parsedBPMN.idByName(elem.decisions.lastTask)),
                    gatewaytype: GatewayType.XOR.id,    // ? 
                    type_: thedecisiontype,      
                    completed: false,                  // ?
                    exists: true,
                    operator: operatorBySymbol(elem.decisions.decisions.operator).id,
                    processVariable: elem.decisions.decisions.processVariable,
                    s_value: thedecisiontype == DecisionType.STRINGDESC.id? elem.decisions.decisions.localValue: '',
                    i_value: thedecisiontype == DecisionType.INTDESC.id? elem.decisions.decisions.localValue: 0,
                    //  s_value: '',
                    //  i_value: 0,
                    
                }
            )
            .send({ from: account, gas: 1000000 });
           }
        }

        return deployedContract.basicEnzian;
    }

    async executeTask(contractInstance, task, account) {
        
        let receipt = await contractInstance.methods.completing(task)
           .send({ from: account, gas: 1000000 })
           return receipt.events.TaskCompleted.returnValues.success;
    }

    async updateProcessVariable(contractInstance, variableName, newValue, account) {
        await contractInstance.methods.updateIntProcessVariable(variableName, newValue).send({ from: account, gas: 1000000 });
    }

    async eventlog(contractInstance) {
        let eventLog = await contractInstance.methods.getDebugStringeventLog().call({from: this.web3Wrapper.accounts[0]});
        return eventLog;
    }

}

module.exports = BasicEnzianYellow;