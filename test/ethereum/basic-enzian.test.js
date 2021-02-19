const assert = require('assert');
const ganache = require('ganache-cli');
const Web3Wrapper = require('./../../src/ethereum/web3-wrapper');

const deployContractAndLibrary = require('../../src/ethereum/deploy-enzian');

const { NULL_ADDRESS } = require('../../src/global');
const{ GatewayType, DecisionType, Operator } = require('../../src/contract-consts.js');

/**
 * The BasicEnzian Contract must correctly deploy Process Models (Tasks, ...).
 * Infrastructural Code is tested here.
 * For Business Logic Tests, i.e. that Models are executed conformely, see index.test.js
 */
describe('The BasicEnzian Contract', () => {
    
    let web3Wrapper;
    let contractInstance;

    beforeEach(async () => {
        web3Wrapper = new Web3Wrapper(ganache.provider({}));
        await web3Wrapper.init();

        let deployed = await deployContractAndLibrary(web3Wrapper);
        contractInstance = deployed.basicEnzian;
    
    });

    it('can be deployed', () => {
        assert(contractInstance);
    });

    describe('and it', () => {

        it('can deploy single tasks', async () => {
            
            await contractInstance.methods
                .createTask(0, 'A', NULL_ADDRESS, 0, [], [])
                .send({ from: web3Wrapper.accounts[0], gas: 1000000
            });

            await contractInstance.methods
                .createTask(1, 'B', NULL_ADDRESS, 0, [0], [])
                .send({ from: web3Wrapper.accounts[0], gas: 1000000
            });
            
            let deployedTask_0 = await contractInstance.methods.getTaskById(0).call();
            assert.strictEqual(deployedTask_0.status, false);
            assert.strictEqual(deployedTask_0.description, 'A');
            assert.strictEqual(deployedTask_0.gateway, '0');
            assert.deepStrictEqual(deployedTask_0.requirements, []);
            assert.deepStrictEqual(deployedTask_0.competitors, []);

            let deployedTask_1 = await contractInstance.methods.getTaskById(1).call();
            assert.strictEqual(deployedTask_1.status, false);
            assert.strictEqual(deployedTask_1.description, 'B');
            assert.strictEqual(deployedTask_1.gateway, '0');
            assert.deepStrictEqual(deployedTask_1.requirements, ['0']);
            assert.deepStrictEqual(deployedTask_1.competitors, []);

        });

        it('can deploy single tasks with decisions', async () => {
            
            await contractInstance.methods
                .createTaskWithDecision(
                    0,                  //_id
                    'A',                //_activity
                    NULL_ADDRESS,       //_taskresource
                    0,                  //_pmg
                    [],                 //_requirements
                    [],                 //_competitors
                    {
                        endBoss: 0,
                        gatewaytype: 0,
                        type_: 1,
                        completed: false,
                        exists: true,
                        operator: 0,
                        processVariable: 'i',
                        s_value: '',
                        i_value: [0]
                    })
                .send({ from: web3Wrapper.accounts[0], gas: 1000000
            });

            await contractInstance.methods
                .createTask(1, 'B', NULL_ADDRESS, 0, [0], [])
                .send({ from: web3Wrapper.accounts[0], gas: 1000000
            });
            
            let deployedTask_0 = await contractInstance.methods.getTaskById(0).call();
            assert.strictEqual(deployedTask_0.status, false);
            assert.strictEqual(deployedTask_0.description, 'A');
            assert.strictEqual(deployedTask_0.gateway, '0');
            assert.deepStrictEqual(deployedTask_0.requirements, []);
            assert.deepStrictEqual(deployedTask_0.competitors, []);

            let deployedTask_1 = await contractInstance.methods.getTaskById(1).call();
            assert.strictEqual(deployedTask_1.status, false);
            assert.strictEqual(deployedTask_1.description, 'B');
            assert.strictEqual(deployedTask_1.gateway, '0');
            assert.deepStrictEqual(deployedTask_1.requirements, ['0']);
            assert.deepStrictEqual(deployedTask_1.competitors, []);

        });

        it('can update global process variables', async () => {

            await contractInstance.methods
            .createTaskWithDecision(
                0,                  //_id
                'A',                //_activity
                NULL_ADDRESS,       //_taskresource
                0,                  //_pmg
                [],                 //_requirements
                [],                 //_competitors
                {
                    endBoss: 17,
                    gatewaytype: 0,
                    type_: 1,
                    completed: false,
                    exists: true,
                    operator: 2, //==
                    processVariable: 'i',
                    s_value: '',
                    i_value: [5]
                })
            .send({ from: web3Wrapper.accounts[0], gas: 1000000 });

            let ivalue = await contractInstance.methods.getIntProcessVariableValue('i').call({ from: web3Wrapper.accounts[0] });
            assert.strictEqual(ivalue, '0'); // initial value
            await contractInstance.methods.updateIntProcessVariable('i', 5).send({ from: web3Wrapper.accounts[0], gas: 1000000 });
            ivalue = await contractInstance.methods.getIntProcessVariableValue('i').call({ from: web3Wrapper.accounts[0] });
            assert.strictEqual(ivalue, '5'); // updated value

            let theendboss = await contractInstance.methods.getTaskDecisionEndBoss(0).call({ from: web3Wrapper.accounts[0] });
            assert.strictEqual(theendboss, '17'); // endboss
            
            let methodreturn = await contractInstance.methods.completing(0).call({ from: web3Wrapper.accounts[0] });

        });

       
    });

    describe('and the DecisionLibrary', () => {
        it('can be called', async () => {
            
            let theequality = await contractInstance.methods.evaluateTest(5, [3, 4], 2).call();

            assert.deepStrictEqual(theequality, false);
        });
    })

    /**
     *                      --  i > 5 --> 2:B -> 3:C  ->
     * (0:start) -> 1:A -> x                             x -> 5:E -> (6:end)
     *                      -- i <= 5 -->   4:D       ->
     */
    describe('and when multiple tasks (i.e. process model) are deployed', () => {

        let web3Wrapper2;
        let contractInstance2;

        beforeEach(async () => {
            web3Wrapper2 = new Web3Wrapper(ganache.provider({}));
            await web3Wrapper2.init();

            let deployed = await deployContractAndLibrary(web3Wrapper2);
            contractInstance2 = deployed.basicEnzian;
        
            await contractInstance2.methods.createTask(0, 'start', NULL_ADDRESS, 0, [], [])
            .send({ from: web3Wrapper2.accounts[0], gas: 1000000 });

            await contractInstance2.methods.createTask(1, 'A', NULL_ADDRESS, 0, [0], [])
            .send({ from: web3Wrapper2.accounts[0], gas: 1000000 });

    
                
            await contractInstance2.methods.createTaskWithDecision(2, 'B', NULL_ADDRESS, 0, [1], [], {
                    endBoss: 3,
                    gatewaytype: 3,
                    type_: 1,
                    completed: false,
                    exists: true,
                    operator: 2, // ==
                    processVariable: 'i',
                    s_value: '',
                    i_value: [5]
                }).send({ from: web3Wrapper2.accounts[0], gas: 1000000 });

            await contractInstance2.methods.createTask(3, 'C', NULL_ADDRESS, 0, [2], [])
                .send({ from: web3Wrapper2.accounts[0], gas: 1000000 });
    
            await contractInstance2.methods.createTaskWithDecision(4, 'D', NULL_ADDRESS, 0, [1], [], {
                    endBoss: 4,
                    gatewaytype: 3,
                    type_: 1,
                    completed: false,
                    exists: true,
                    operator: 4,
                    processVariable: 'i',
                    s_value: '',
                    i_value: [5]
                }).send({ from: web3Wrapper2.accounts[0], gas: 1000000 });
    
            await contractInstance2.methods.createTask(5, 'E', NULL_ADDRESS, 3, [3, 4], [])
                .send({ from: web3Wrapper2.accounts[0], gas: 1000000 });
    
            await contractInstance2.methods.createTask(6, 'end', NULL_ADDRESS, 0, [5], [])
                .send({ from: web3Wrapper2.accounts[0], gas: 1000000 });
        });
        
        
        it('only executes control-flow conformal tasks', async () => {

            let success;
            success = await contractInstance2.methods.completing(0).send({ from: web3Wrapper2.accounts[0], gas: 1000000 });
            assert(success);
            success = await contractInstance2.methods.completing(1).send({ from: web3Wrapper2.accounts[0], gas: 1000000 });
            assert(success);
           try {
                await contractInstance2.methods.completing(2).send({ from: web3Wrapper2.accounts[0], gas: 1000000 });
                assert(false);
            }
            catch (error) {
                assert(error, "Expected an error but did not get one");
                //assert(error.message.startsWith('VM Exception while processing transaction: ' + 'revert'), "Expected an error starting with '" + PREFIX + message + "' but got '" + error.message + "' instead");
            }
            await contractInstance2.methods.updateIntProcessVariable('i', 5).send({ from: web3Wrapper2.accounts[0], gas: 1000000 });
            success = await contractInstance2.methods.completing(2).send({ from: web3Wrapper2.accounts[0], gas: 1000000 });
            assert(success);
            let eventLog = await contractInstance2.methods.getDebugStringeventLog().call({from: web3Wrapper2.accounts[0]});
    
            assert.deepStrictEqual(eventLog, ['start', 'A', 'B']);

        });

        it('misc', async () => {
            let ivalue = await contractInstance2.methods.getIntProcessVariableValue('i').call({ from: web3Wrapper2.accounts[0] });
            assert.strictEqual(ivalue, '0'); // initial value
            await contractInstance2.methods.updateIntProcessVariable('i', 5).send({ from: web3Wrapper2.accounts[0], gas: 1000000 });
            ivalue = await contractInstance2.methods.getIntProcessVariableValue('i').call({ from: web3Wrapper2.accounts[0] });
            assert.strictEqual(ivalue, '5'); // updated value
                
        })

    });
});