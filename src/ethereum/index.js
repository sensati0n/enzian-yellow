const basicEnzianCompiled = require('./build/BasicEnzian.json');

class BasicEnzianYellow {

    constructor(web3Wrapper) {
        this.web3Wrapper = web3Wrapper;
    }

    async deployProcessModel (parsedBPMN, account) {

        let deployedContract = await this.web3Wrapper.deployContract(basicEnzianCompiled, {
            from: account
        });

       for(let count = 0; count < parsedBPMN.obj.length; count++) {
           let elem = parsedBPMN.obj[count];

           console.log("ELEM", elem);

           await deployedContract.methods.createTask(elem.task, 0, [], [])
           .send({ from: account, gas: 1000000 });
        }
        

        return deployedContract;
    }

}

module.exports = BasicEnzianYellow;