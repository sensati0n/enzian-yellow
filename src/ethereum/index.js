const deployContractAndLibrary = require('./deploy-enzian');
const{ GatewayType, DecisionType, operatorBySymbol } = require('../contract-consts');
const basicEnzianCompiled = require('./build/BasicEnzian.json');


/**
 * Knows contract information such as specific events
 */
class BasicEnzianYellow {

    constructor(web3Wrapper) {
        this.web3Wrapper = web3Wrapper;
    }

    /**
     *
     * @param parsedBPMN
     * @param account
     * @param compiled OPTIONAL
     * @returns {Promise<*|*|*>}
     */
    async deployEnzianProcess (parsedBPMN, account, compiled) {
        let deployedContract = await deployContractAndLibrary(this.web3Wrapper, compiled);


        for(let count = 0; count < parsedBPMN.obj.length; count++) {
           let elem = parsedBPMN.obj[count];

           if(!elem.decisions) {
               await deployedContract.basicEnzian.methods.createTask(
                    elem.task.id,
                    elem.task.name,
                    elem.resource? elem.resource : '0x0000000000000000000000000000000000000000',
                    elem.proceedingMergingGateway? elem.proceedingMergingGateway.id: 0,
                    elem.requirements.map(req => req.id), []
                ).send({ from: account, gas: 1000000 });
           }
           else {
               //which decision int vs string
                let thedecisiontype = elem.decisions.decisions.processVariable.startsWith('\'\'')
                    ? DecisionType.STRINGDESC.id : DecisionType.INTDESC.id;

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

    /**
     *
     * @param parsedBPMN
     * @param privateKey
     * @param compiled OPTIONAL
     * @returns {Promise<string>}
     */
    async deployEnzianProcessSelfSigned(parsedBPMN, privateKey, compiled = undefined) {

        console.log('deployEnzianProcessSelfSigned called with pk', privateKey)
        let deployedContract = await deployContractAndLibrary(this.web3Wrapper, compiled, privateKey);
        console.log('the deployed contract: ', deployedContract)

        var localContractInstance = new this.web3Wrapper.web3.eth.Contract( basicEnzianCompiled.abi, deployedContract.basicEnzian.contractAddress);
        
        console.log('the deployed contract is now wrapped:', localContractInstance)

        for(let count = 0; count < parsedBPMN.obj.length; count++) {
           let elem = parsedBPMN.obj[count];



           const fromAddress = this.web3Wrapper.web3.eth.accounts.privateKeyToAccount(privateKey).address;
           const contract = new this.web3Wrapper.web3.eth.Contract( basicEnzianCompiled.abi, deployedContract.basicEnzian.contractAddress);
       
         

           if(!elem.decisions) {
               let txString = contract.methods.createTask(
                    elem.task.id,
                    elem.task.name,
                    elem.resource? elem.resource : '0x0000000000000000000000000000000000000000',
                    elem.proceedingMergingGateway? elem.proceedingMergingGateway.id: 0,
                    elem.requirements.map(req => req.id), []
                );

                var tx = {
                    gas: this.web3Wrapper.web3.utils.toHex('5000000'),
                    data: txString
                   };
       
                   console.log('tx', tx)
       
            //    let signed = await this.web3Wrapper.web3.eth.accounts.signTransaction(tx, privateKey)

            console.log("TOOOOOOO",  deployedContract.basicEnzian.contractAddress);

               const signed = await this.web3Wrapper.web3.eth.accounts.signTransaction({
                to: deployedContract.basicEnzian.contractAddress,
                fromAddress,
                value: '0',
                data: txString.encodeABI(),
                //  gas: Math.round((await txString.estimateGas({ fromAddress })) * 1.5),
                gas: this.web3Wrapper.web3.utils.toHex('5000000'),

            }, privateKey)
        
            console.log('signed', signed)

                   
               let returnTx = await this.web3Wrapper.web3.eth.sendSignedTransaction(signed.rawTransaction)
               console.log('rtx', returnTx)
           }
           else {

            //which decision int vs string
            let thedecisiontype = elem.decisions.decisions.processVariable.startsWith('\'\'') ? DecisionType.STRINGDESC.id : DecisionType.INTDESC.id;

            let txString = localContractInstance.methods.createTaskWithDecision(
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
            ).encodeABI();
            var tx = {
                gas: this.web3Wrapper.web3.utils.toHex('5000000'),
                data: txString
               };
   
               console.log('tx', tx)
   
           let signed = await this.web3Wrapper.web3.eth.accounts.signTransaction(tx, privateKey)
           console.log('signed', signed)
               
           let returnTx = await this.web3Wrapper.web3.eth.sendSignedTransaction(signed.rawTransaction)
           console.log('rtx', returnTx)

           }
        }

        console.log("Contract deployment finished. contract address:", deployedContract.basicEnzian.contractAddress)
        return deployedContract.basicEnzian.contractAddress;

    }

    async executeTask(contractInstance, task, account) {
        
        let receipt = await contractInstance.methods.completing(task)
           .send({ from: account, gas: 1000000 })
           return receipt.events.TaskCompleted.returnValues.success;
    }

    async executeTaskByAddress(contractAddress, task, privateKey) {

        var localContractInstance = new this.web3Wrapper.web3.eth.Contract( basicEnzianCompiled.abi, contractAddress);
        if (privateKey){
            const fromAddress = this.web3Wrapper.web3.eth.accounts.privateKeyToAccount(privateKey).address;




            let txString = localContractInstance.methods.completing(task);

            var tx = {
                gas: this.web3Wrapper.web3.utils.toHex('5000000'),
                data: txString
            };
            console.log('tx', tx)

            const signed = await this.web3Wrapper.web3.eth.accounts.signTransaction({
                to: contractAddress,
                fromAddress,
                value: '0',
                data: txString.encodeABI(),
                //  gas: Math.round((await txString.estimateGas({ fromAddress })) * 1.5),
                gas: this.web3Wrapper.web3.utils.toHex('5000000'),

            }, privateKey)
            console.log('signed', signed)


            let returnTx = await this.web3Wrapper.web3.eth.sendSignedTransaction(signed.rawTransaction)
            console.log('rtx', returnTx)

            return returnTx.events.TaskCompleted.returnValues.success;
        } else {
            let receipt = await localContractInstance.methods.completing(task)
                .send({ from: this.web3Wrapper.accounts[0], gas: 1000000 })
            return receipt.events.TaskCompleted.returnValues.success;
        }

    }

    async updateProcessVariable(contractInstance, variableName, newValue, account) {
        await contractInstance.methods.updateIntProcessVariable(variableName, newValue).send({ from: account, gas: 1000000 });
    }

    async eventlog(contractInstance) {
        let eventLog = await contractInstance.methods.getDebugStringeventLog().call({from: this.web3Wrapper.accounts[0]});
        return eventLog;
    }

    async eventlogByAddress(contractAddress) {

        var localContractInstance = new this.web3Wrapper.web3.eth.Contract(basicEnzianCompiled.abi, contractAddress);
        let eventLog = await localContractInstance.methods.getDebugStringeventLog().call({from: this.web3Wrapper.accounts[0]});
        return eventLog;
    }

}

module.exports = BasicEnzianYellow;