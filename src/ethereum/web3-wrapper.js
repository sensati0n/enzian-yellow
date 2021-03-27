const { create } = require('lodash');
const Web3 = require('web3');
const util = require('util');
const path = require('path');


/**
 * Communication with Blockchain.
 * Does not know anything about bpmn or specific contracts.
 * 
 * Holds contracts.
 * 
 */
class Web3Wrapper {
    
    constructor(provider) {
        this.web3 = new Web3(provider);
        this.initialized = false;
    }

    async init() {
        this.accounts = await this.web3.eth.getAccounts();
        this.initialized = true;
    }

    async deployContract(compiled, opts) {
    
        let returnContract;

        let thecontract = new this.web3.eth.Contract(compiled.abi);
        let deploy_opt = {
            data: compiled.evm.bytecode.object,
            arguments: opts.arguments
        };
        let transactionObject = await thecontract.deploy(deploy_opt)
        const estimatedGas = await transactionObject.estimateGas();

        await transactionObject
        .send({
            from: opts.from,
            gas: estimatedGas,
            gasPrice: '1'
        }, function(error, transactionHash){  })
        .on('error', function(error){
            console.err("No error should occur.");
        })
        .then((newContractInstance) => {
            returnContract = newContractInstance;
        });

        return returnContract;
    }

    async deployContractSelfSigned(compiled, opts) {
    
        var tx = {
             gas: this.web3.utils.toHex('5000000'),
             data: compiled.evm.bytecode.object
            };

        console.log('tx', tx)

        let signed = await this.web3.eth.accounts.signTransaction(tx, '62188f47cefd16322ab69190a12d9c1fb9f41303bf48abfcd56491bf5594be12')
        console.log('signed', signed)
            
        let returnContract = await this.web3.eth.sendSignedTransaction(signed.rawTransaction)
        console.log('rc', returnContract)

        return returnContract;
    }


    
    async deployContractByAbiAndBytecode(abi, bytecode, opts, privateKey) {
        console.log('deploycontracbyabiandbytecode')
        console.log('abi', abi)
        console.log('bc', bytecode)
        console.log('opts', opts)
        console.log('pk', privateKey)
    
        let returnContract;

        let thecontract = new this.web3.eth.Contract(abi);
        let deploy_opt = {
            data: bytecode,
            arguments: opts.arguments
        };
        let transactionObject = await thecontract.deploy(deploy_opt)
      
        console.log('to', transactionObject)

        if(privateKey) {
    
            var tx = {
                gas: this.web3.utils.toHex('5000000'),
                data: bytecode
               };
   

               console.log('tx', tx)
   
           let signed = await this.web3.eth.accounts.signTransaction(tx, privateKey)
           console.log('signed', signed)
               
           let returnTx = await this.web3.eth.sendSignedTransaction(signed.rawTransaction)
           console.log('rtx', returnTx)
          
           return returnTx;


        }
        else {
            console.log('no private key found, using meta mask (opts from)')

            const estimatedGas = await transactionObject.estimateGas({gas: 5000000}, function(error, gasAmount){
                if(gasAmount == 5000000)
                    console.log('Method ran out of gas');
    
                if(error) {
                    console.log('ERROR', error);
                }
            });

            await transactionObject
            .send({
                from: opts.from,
                gas: estimatedGas,
                gasPrice: '1'
            }, function(error, transactionHash){  })
            .on('error', function(error){
                console.err("No error should occur.");
            })
            .then((newContractInstance) => {
                returnContract = newContractInstance;
            });
    
            return returnContract;
        }
      
    }

    
}


// Assumption: Metamast has already imjected a Web3 instance into the page
// !! FALSE FOR 2021 !! AND FOR SERVER-SIDE RENDERING !!

//const web3 = new Web3(window.web3.currentProvider);


/*


if(typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
    // Executed inside the browser, and metamask is available
    web3 = new Web3(window.web3.currentProvider);
} else {
    // We are on the browser *OR* the user is not running metamask
    const provider = new Web3.providers.HttpProvider(
        'https://rinkeby.infura.io/v3/559faf9ec0034bb9a265c681df791cdf',
    );
    web3 = new Web3(provider);
}
*/


module.exports = Web3Wrapper;