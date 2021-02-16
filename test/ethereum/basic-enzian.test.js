const assert = require('assert');
const ganache = require('ganache-cli');
const Web3Wrapper = require('./../../src/ethereum/web3-wrapper');

const deployContractAndLibrary = require('../../src/ethereum/deploy-enzian');

const { NULL_ADDRESS } = require('../../src/global');

/**
 * The BasicEnzian Contract must correctly deploy Process Models (Tasks, ...).
 * Infrastructural Code is tested here.
 * For Business Logic Tests, i.e. that Models are executed conformely, see index.test.js
 */
describe('Test the BasicEnzian Contract', () => {
    
    let web3Wrapper;
    let contractInstance;

    beforeEach(async () => {
        web3Wrapper = new Web3Wrapper(ganache.provider({}));
        await web3Wrapper.init();

        let deployed = await deployContractAndLibrary(web3Wrapper);
        contractInstance = deployed.basicEnzian;
    
    });

    it('checks that contract is deployed', () => {
        assert(contractInstance);
    });

    describe('Test the functionallity of BasicEnzian', () => {

        describe('Test the deployment of different process models', () => {

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
                            typ: 0,
                            completed: false,
                            exists: false,
                            operator: 0,
                            integeroperants: {idtoglobalintegerpayload: 0, local: []},
                            stringoperants: {idtoglobalstringpayload: 0, local: ""}
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

            it('can can compare', async () => {
                
                let theequality = await contractInstance.methods.evaluateTest(5, [3, 4], 2).call();

                assert.deepStrictEqual(theequality, false);
            });
        });

        /**
         *                      --  i > 5 --> 2:B -> 3:C  ->
         * (0:start) -> 1:A -> x                             x -> 5:E -> (6:end)
         *                      -- i <= 5 -->   4:D       ->
         */
        describe('Deploy multiple tasks (i.e. process model) and check the on-chain structure', () => {

            it('BIG PROCESS MODEL', async () => {

                await contractInstance.methods.createTaskWithDecision(
                    0,                  //_id
                    'start',                //_activity
                    NULL_ADDRESS,       //_taskresource
                    0,                  //_pmg
                    [],                 //_requirements
                    [],                 //_competitors
                    {
                        endBoss: 0,
                        gatewaytype: 0,
                        typ: 0,
                        completed: false,
                        exists: false,
                        operator: 0,
                        integeroperants: {idtoglobalintegerpayload: 0, local: []},
                        stringoperants: {idtoglobalstringpayload: 0, local: ""}
                    })
                .send({ from: web3Wrapper.accounts[0], gas: 1000000
            });
            console.log("Start deployed.");

            await contractInstance.methods.createTaskWithDecision(
                1,                  //_id
                'A',                //_activity
                NULL_ADDRESS,       //_taskresource
                0,                  //_pmg
                [0],                 //_requirements
                [],                 //_competitors
                {
                    endBoss: 0,
                    gatewaytype: 0,
                    typ: 0,
                    completed: false,
                    exists: false,
                    operator: 0,
                    integeroperants: {idtoglobalintegerpayload: 0, local: []},
                    stringoperants: {idtoglobalstringpayload: 0, local: ""}
                })
            .send({ from: web3Wrapper.accounts[0], gas: 1000000
            });
            console.log("A deployed.");

            await contractInstance.methods.createTaskWithDecision(
                2,                  //_id
                'B',                //_activity
                NULL_ADDRESS,       //_taskresource
                0,                  //_pmg
                [1],                 //_requirements
                [],                 //_competitors
                {
                    endBoss: 3,
                    gatewaytype: 3,
                    typ: 1,
                    completed: false,
                    exists: false,
                    operator: 1,
                    integeroperants: {idtoglobalintegerpayload: 0, local: [5]},
                    stringoperants: {idtoglobalstringpayload: 0, local: ""}
                })
            .send({ from: web3Wrapper.accounts[0], gas: 1000000
            });
            console.log("B deployed.");

            await contractInstance.methods.createTaskWithDecision(
                3,                  //_id
                'C',                //_activity
                NULL_ADDRESS,       //_taskresource
                0,                  //_pmg
                [2],                 //_requirements
                [],                 //_competitors
                {
                    endBoss: 0,
                    gatewaytype: 0,
                    typ: 0,
                    completed: false,
                    exists: false,
                    operator: 0,
                    integeroperants: {idtoglobalintegerpayload: 0, local: []},
                    stringoperants: {idtoglobalstringpayload: 0, local: ""}
                })
            .send({ from: web3Wrapper.accounts[0], gas: 1000000
            });
            console.log("C deployed.");

            await contractInstance.methods.createTaskWithDecision(
                4,                  //_id
                'D',                //_activity
                NULL_ADDRESS,       //_taskresource
                0,                  //_pmg
                [1],                 //_requirements
                [],                 //_competitors
                {
                    endBoss: 4,
                    gatewaytype: 3,
                    typ: 1,
                    completed: false,
                    exists: false,
                    operator: 4,
                    integeroperants: {idtoglobalintegerpayload: 0, local: [5]},
                    stringoperants: {idtoglobalstringpayload: 0, local: ""}
                })
            .send({ from: web3Wrapper.accounts[0], gas: 1000000
            });
            console.log("D deployed.");

            await contractInstance.methods.createTaskWithDecision(
                5,                  //_id
                'E',                //_activity
                NULL_ADDRESS,       //_taskresource
                3,                  //_pmg
                [3, 4],                 //_requirements
                [],                 //_competitors
                {
                    endBoss: 0,
                    gatewaytype: 0,
                    typ: 0,
                    completed: false,
                    exists: false,
                    operator: 0,
                    integeroperants: {idtoglobalintegerpayload: 0, local: []},
                    stringoperants: {idtoglobalstringpayload: 0, local: ""}
                })
            .send({ from: web3Wrapper.accounts[0], gas: 1000000
            });
            console.log("E deployed.");

            await contractInstance.methods.createTaskWithDecision(
                6,                  //_id
                'end',                //_activity
                NULL_ADDRESS,       //_taskresource
                0,                  //_pmg
                [5],                 //_requirements
                [],                 //_competitors
                {
                    endBoss: 0,
                    gatewaytype: 0,
                    typ: 0,
                    completed: false,
                    exists: false,
                    operator: 0,
                    integeroperants: {idtoglobalintegerpayload: 0, local: []},
                    stringoperants: {idtoglobalstringpayload: 0, local: ""}
                })
            .send({ from: web3Wrapper.accounts[0], gas: 1000000
            });
            console.log("End deployed.");


            await contractInstance.methods.completing(0).send({ from: web3Wrapper.accounts[0], gas: 1000000 });
            await contractInstance.methods.completing(1).send({ from: web3Wrapper.accounts[0], gas: 1000000 });

            let eventLog = await contractInstance.methods.getDebugStringeventLog().call({from: web3Wrapper.accounts[0]});

            console.log(eventLog);

            // console.log("let eventlog = await enzian.eventlog(contractInstance);");
            // console.log(eventlog);
            assert.deepStrictEqual(eventLog, ['start', 'A']);



            });
           

        });
    });
});