const assert = require('assert');
const ganache = require('ganache-cli');

const fs = require('fs-extra');
const path = require('path');
const util = require('util')

const EnzianYellow = require('./../src')

// do not change this
const MNEMONIC = "enzian yellow";
const account0 = '0xC09Df25ae8Cb470be2455bf9d91eF92fc437732b';
const account1 = '0xCcB73f1F58Ed551169691d91dF2963c429C76c60';
const account2 = '0x03E1E628870fABfFa154a152B07ed306811c2D6b';

/**
 * Tests the whole application, i.e. the EnzianYellow class.
 * 
 * "Methods" under investigation are: deploy a process model and execute processes.
 * "Test Cases" are: Get correct traces executed and are invalid traces forbidden?
 * 
 */
describe('The EnzianYellow-Application', () => {
  
  it('can instantiate a new EnzianModel from a XML-encoded BPMN Process Model', async () => {
    
    // A bpmn-file is read client-sided
    let gatewayContents = await fs.readFile(
      path.resolve(__dirname, './resources' , 'gateway.bpmn'), 'utf8');
      
    let enzian = new EnzianYellow(ganache.provider({
      "mnemonic": MNEMONIC
    }));

    let { parsedBPMN, deployedModel } = await enzian.deployBPMNProcess(gatewayContents);
    assert(parsedBPMN);
    assert(deployedModel);
  });
  
  /**                   -> C -> D ->
   *            ->  B x               x ->  F ->
   *                    ->    E   ->
   *  () -> A +                                   + -> H -> (())
   *            ->                G           ->
   */   
  describe('A deployed EnzianModel (BPMN Process)', () => {
    
    let enzian, contractInstance, enzianModel;

    /**
     * Before each Test, we assume a clean, fresh deployed contract
     */
    beforeEach(async() => {
      let gatewayContents = await fs.readFile(
        path.resolve(__dirname, './resources' , 'gateway.bpmn'), 'utf8');
  
        // new instance
        enzian = new EnzianYellow(ganache.provider({
          "mnemonic": MNEMONIC
        }));
  
        // deploy BPMN Process model
        let { parsedBPMN, deployedModel } = await enzian.deployBPMNProcess(gatewayContents);

        assert(parsedBPMN);
        assert(deployedModel);

        contractInstance = deployedModel;
        enzianModel = parsedBPMN;
    });
    
    describe('The Control-Flow Perspective is conformal and the Application', () => {
      
      it('executes valid tasks', async () => {
        let success = await enzian.executeTask(contractInstance, enzianModel.idByName('start'), account0);
        assert(success);

        success = await enzian.executeTask(contractInstance, enzianModel.idByName('A'), account0);
        assert(success);

        success = await enzian.executeTask(contractInstance, enzianModel.idByName('B'), account0);
        assert(success);

        success = await enzian.executeTask(contractInstance, enzianModel.idByName('G'), account0);
        assert(success);

        let eventlog = await enzian.eventlog(contractInstance);
        assert.deepStrictEqual(eventlog, ['start', 'A', 'B', 'G']);
      });
      
      it('does not execute tasks when required tasks are not completed yet', async () => {
        let success = await enzian.executeTask(contractInstance, enzianModel.idByName('B'), account0);
        // REVERT
        assert(!success);

        success = await enzian.executeTask(contractInstance, enzianModel.idByName('start'), account0);
        assert(success);

        success = await enzian.executeTask(contractInstance, enzianModel.idByName('A'), account0);
        assert(success);

        let eventlog = await enzian.eventlog(contractInstance);
        assert.deepStrictEqual(eventlog, ['start', 'A']);
      });
      
      describe('When a XOR Gateway preceeds', () => {
        
        it('executes the succeeding task, if all required tasks are completed.', async () => {

          await enzian.executeTask(contractInstance, enzianModel.idByName('start'), account0);

          await enzian.executeTask(contractInstance, enzianModel.idByName('A'), account0);
          await enzian.executeTask(contractInstance, enzianModel.idByName('B'), account0);
          await enzian.executeTask(contractInstance, enzianModel.idByName('C'), account0);
          await enzian.executeTask(contractInstance, enzianModel.idByName('D'), account0);
          await enzian.executeTask(contractInstance, enzianModel.idByName('F'), account0);
          await enzian.executeTask(contractInstance, enzianModel.idByName('G'), account0);
          await enzian.executeTask(contractInstance, enzianModel.idByName('H'), account0);
          await enzian.executeTask(contractInstance, enzianModel.idByName('end'), account0);

          let eventlog = await enzian.eventlog(contractInstance);
          assert.deepStrictEqual(eventlog, ['start', 'A', 'B', 'C', 'D', 'F', 'G', 'H', 'end']);
        });
        
        it('does not execute more than one task after a splitting XOR gateway.', async () => {

          /*
          await enzian.executeTask(contractInstance, enzianModel.idByName('start'), account0);

          await enzian.executeTask(contractInstance, enzianModel.idByName('A'), account0);
          await enzian.executeTask(contractInstance, enzianModel.idByName('B'), account0);
          await enzian.executeTask(contractInstance, enzianModel.idByName('C'), account0);
          await enzian.executeTask(contractInstance, enzianModel.idByName('E'), account0);
          await enzian.executeTask(contractInstance, enzianModel.idByName('D'), account0);

          let eventlog = await enzian.eventlog(contractInstance);
          assert.deepStrictEqual(eventlog, ['start', 'A', 'B', 'C', 'D']);
          */

          // TODO: implemented with competitors
          // are they necessary with decisions?
        });
      
      }); // END OF XOR-GATEWAY TESTS
    
    }); // END OF CONTROL-FLOW PERSPECTIVE TEST SUITE
    
    /**
     * This Test-Suite uses the Lane.bpmn process model.
     */
    describe('The Organizational Perspective is conformal and the Application', () => {
       
      beforeEach(async() => {
        let laneContents = await fs.readFile(
          path.resolve(__dirname, './resources' , 'lane.bpmn'), 'utf8');
    
          enzian = new EnzianYellow(ganache.provider({
            "mnemonic": MNEMONIC
          }))
    
          let { parsedBPMN, deployedModel } = await enzian.deployBPMNProcess(laneContents);
  
          assert(parsedBPMN);
          assert(deployedModel);
  
          //console.log(util.inspect(parsedBPMN, false, null, true ));
          contractInstance = deployedModel;
      });

      it('allows only valid accounts the execution of tasks', async () => {
        
        await enzian.executeTask(contractInstance, 0, account0);  // start1
        await enzian.executeTask(contractInstance, 2, account0);  // A
        await enzian.executeTask(contractInstance, 5, account1);  // D
        // E MUST --> F MUST
        await enzian.executeTask(contractInstance, 1, account2);  // start2
        await enzian.executeTask(contractInstance, 6, account2);  // F
        await enzian.executeTask(contractInstance, 7, account1);  // E
       // await enzian.executeTask(contractInstance, 3, account0);  // B
       // await enzian.executeTask(contractInstance, 4, account0);  // C
        await enzian.executeTask(contractInstance, 8, account1);  // H
        // G MUST BEFORE I
        await enzian.executeTask(contractInstance, 9, account2);  // G
        await enzian.executeTask(contractInstance, 12, account1); // I
        await enzian.executeTask(contractInstance, 10, account2); // J
        await enzian.executeTask(contractInstance, 11, account2); // end2   
        await enzian.executeTask(contractInstance, 13, account1); // end1   
        
        let eventlog = await enzian.eventlog(contractInstance);
        // console.log("let eventlog = await enzian.eventlog(contractInstance);");
        // console.log(eventlog);
        assert.deepStrictEqual(eventlog, ['start1', 'A', 'D', 'start2', 'F', 'E',  'H', 'G', 'I', 'J', 'end2', 'end1']);
      });
    
    }); // END OF ORGANIZATIONAL PERSPECTIVE TEST SUITE
  
  }); // END OF MODEL IS ALEADY DEPLOYED.

}); // END OF ENZIAN-APPLICATION TEST-SUITE