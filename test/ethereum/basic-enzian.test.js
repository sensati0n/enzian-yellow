const assert = require('assert');
const ganache = require('ganache-cli');
const Web3Wrapper = require('./../../src/ethereum/web3-wrapper');

const basicEnzianCompiled = require('../../src/ethereum/build/BasicEnzian.json');


describe('Test the BasicEnzian Contract', () => {
   
    let web3Wrapper;
    
    let contractInstance;


    before(async () => {
        web3Wrapper = new Web3Wrapper(ganache.provider({}));
        await web3Wrapper.init();
        contractInstance = await web3Wrapper.deployContract(basicEnzianCompiled, { from: web3Wrapper.accounts[0]  });
    });

    it('checks that contract is compiled', () => {
        assert(basicEnzianCompiled);
    });

    it('checks that contract is deployed', () => {
        assert(contractInstance);
    });

    describe('Test the functionallity of BasicEnzian', () => {

        describe('Test the deployment of different process models', () => {

            it('can deploy single tasks', async () => {
                
                await contractInstance.methods
                    .createTask('A', 0, [], [])
                    .send({ from: web3Wrapper.accounts[0], gas: 1000000
                });

                await contractInstance.methods
                    .createTask('B', 0, [0], [])
                    .send({ from: web3Wrapper.accounts[0], gas: 1000000
                });
                
                let deployedTask_0 = await contractInstance.methods.getTaskById(0).call();
                assert.strictEqual(deployedTask_0.status, false);
                assert.strictEqual(deployedTask_0.description, 'A');
                assert.strictEqual(deployedTask_0.tasktype, '0');
                assert.deepStrictEqual(deployedTask_0.requirements, []);
                assert.deepStrictEqual(deployedTask_0.competitors, []);

                let deployedTask_1 = await contractInstance.methods.getTaskById(1).call();
                assert.strictEqual(deployedTask_1.status, false);
                assert.strictEqual(deployedTask_1.description, 'B');
                assert.strictEqual(deployedTask_1.tasktype, '0');
                assert.deepStrictEqual(deployedTask_1.requirements, ['0']);
                assert.deepStrictEqual(deployedTask_1.competitors, []);

            });

/*
                it('can deploy a simple process model', async () => {
                    
                    let simpleProcess = {
                        obj: [
                          { task: 'start', requirements: [] },
                          { task: 'A', requirements: ['start'] },
                          { task: 'B', requirements: ['A'] },
                          { task: 'end', requirements: ['B'] }
                        ]
                      }

                    console.log(contractInstance.methods);
                    await simpleProcess.obj.forEach(async (elem) => {
                         contractInstance.createTask(elem.task, 'TASK', elem.requirements, [])
                        .send({ from: accounts[0], gas: '1000000'});
                    })
    
                    let deployedTasks = await contractInstance.methods.getTasks().call();
                    console.log(deployedTasks);
    
                    
                });
*/

                
            });

        
        });

    });
    
