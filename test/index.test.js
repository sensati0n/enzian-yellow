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
          await enzian.updateProcessVariable(contractInstance, 'i', 5, account0);
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
  
          contractInstance = deployedModel;
          enzianModel = parsedBPMN;
      });

      it('allows only valid accounts the execution of tasks', async () => {
        

        let laneBlockContents = await fs.readFile(
          path.resolve(__dirname, './resources' , 'lane_block.bpmn'), 'utf8');
    
          enzian = new EnzianYellow(ganache.provider({
            "mnemonic": MNEMONIC
          }))
    
          let { parsedBPMN, deployedModel } = await enzian.deployBPMNProcess(laneBlockContents);
  
          assert(parsedBPMN);
          assert(deployedModel);
  
          contractInstance = deployedModel;
          enzianModel = parsedBPMN;

          await enzian.executeTask(contractInstance, enzianModel.idByName('start'), account0);  
          await enzian.executeTask(contractInstance, enzianModel.idByName('A'), account0);  
          await enzian.executeTask(contractInstance, enzianModel.idByName('F'), account2);  
          await enzian.updateProcessVariable(contractInstance, 'i', 6, account0);
          await enzian.executeTask(contractInstance, enzianModel.idByName('D'), account1);  
          await enzian.executeTask(contractInstance, enzianModel.idByName('E'), account1);  
          await enzian.executeTask(contractInstance, enzianModel.idByName('G'), account2);  
          await enzian.executeTask(contractInstance, enzianModel.idByName('H'), account1);  
          await enzian.executeTask(contractInstance, enzianModel.idByName('J'), account2);  
          await enzian.executeTask(contractInstance, enzianModel.idByName('end2'), account2);  

          let eventlog = await enzian.eventlog(contractInstance);
          assert.deepStrictEqual(eventlog, ['start', 'A', 'F', 'D', 'E', 'G', 'H', 'J', 'end2']);
        });
    
    }); // END OF ORGANIZATIONAL PERSPECTIVE TEST SUITE
  
    describe('The Informational Perspective is conformal and the Application', () => {
      

      beforeEach(async() => {
        let laneDecisionContents = await fs.readFile(
          path.resolve(__dirname, './resources' , 'lane_decision-complex.bpmn'), 'utf8');
    
          enzian = new EnzianYellow(ganache.provider({
            "mnemonic": MNEMONIC
          }))
    
          let { parsedBPMN, deployedModel } = await enzian.deployBPMNProcess(laneDecisionContents);
  
          assert(parsedBPMN);
          assert(deployedModel);
  
          contractInstance = deployedModel;
          enzianModel = parsedBPMN;
      });
/*
      describe('in case of splitting gateways', () => {
        it('checks single integer values', async () => {
        
          await enzian.executeTask(contractInstance, enzianModel.idByName('start1'), account0);  // start1
          await enzian.executeTask(contractInstance, enzianModel.idByName('A'), account0);
          // i == 0 (initial value)
          try {
            await enzian.executeTask(contractInstance, enzianModel.idByName('B'), account0);
          } catch (error) {
            assert(error); // TODO: check for revert and message
          }
          try {
            await enzian.executeTask(contractInstance, enzianModel.idByName('D'), account0);
          } catch (error) {
            assert(error); // TODO: check for revert and message
          }
  
          await enzian.updateProcessVariable(contractInstance, 'i', 5, account0);
  
          try {
            await enzian.executeTask(contractInstance, enzianModel.idByName('D'), account0);
          } catch (error) {
            assert(error); // TODO: check for revert and message
          }
  
          await enzian.executeTask(contractInstance, enzianModel.idByName('B'), account0);
  
          let eventlog = await enzian.eventlog(contractInstance);
          assert.deepStrictEqual(eventlog, ['start1', 'A', 'B']);
        });
  
        it('checks interval integer values', async () => {
          
        
        });
  
        it('checks string values', async () => {
          
        
        });
      });
*/
      describe('in case of merging gateways', () => {

        it('checks single integer values', async () => {
        
          await enzian.executeTask(contractInstance, enzianModel.idByName('start1'), account0);  // start1
          await enzian.executeTask(contractInstance, enzianModel.idByName('A'), account0);
          await enzian.updateProcessVariable(contractInstance, 'i', 5, account0);
          await enzian.executeTask(contractInstance, enzianModel.idByName('B'), account0);
          await enzian.executeTask(contractInstance, enzianModel.idByName('C'), account0);
          await enzian.executeTask(contractInstance, enzianModel.idByName('H'), account1);

          // try {
          //   await enzian.executeTask(contractInstance, enzianModel.idByName('H'), account0);
          // } catch (error) {
          //   assert(error); // TODO: NOT ALLOWED
          // }


          let eventlog = await enzian.eventlog(contractInstance);
          assert.deepStrictEqual(eventlog, ['start1', 'A', 'B', 'C', 'H']);
        });


        it('NEGATIVE checks single integer values', async () => {
        
          await enzian.executeTask(contractInstance, enzianModel.idByName('start1'), account0);  // start1
          await enzian.executeTask(contractInstance, enzianModel.idByName('A'), account0);
          await enzian.updateProcessVariable(contractInstance, 'i', 5, account0);
          await enzian.executeTask(contractInstance, enzianModel.idByName('B'), account0);

          await enzian.executeTask(contractInstance, enzianModel.idByName('H'), account1);


          try {
            await enzian.executeTask(contractInstance, enzianModel.idByName('H'), account1);
          } catch (error) {
            console.log(error);
            assert(error); // TODO: NOT ALLOWED
            assert(!error); // TODO: NOT ALLOWED
          }


          let eventlog = await enzian.eventlog(contractInstance);
          assert.deepStrictEqual(eventlog, ['start1', 'A', 'B']);
        });

  
        it('checks interval integer values', async () => {
          
        
        });
  
        it('checks string values', async () => {
          
        
        });


      });


      



    
    }); // END OF INFORMATIONAL PERSPECTIVE TEST SUITE
  







  }); // END OF MODEL IS ALEADY DEPLOYED.

}); // END OF ENZIAN-APPLICATION TEST-SUITE