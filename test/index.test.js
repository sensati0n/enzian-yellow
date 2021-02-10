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

describe('A first Workflow', () => {
  


  it('can instantiate a BPMN Process Model', async () => {

    //here we are client?

    //client-sided:
    let gatewayContents = await fs.readFile(
      path.resolve(__dirname, './resources' , 'gateway.bpmn'), 'utf8');

      let enzian = new EnzianYellow(ganache.provider({
        "mnemonic": MNEMONIC
      }))

      let { parsedBPMN, deployedModel } = await enzian.deployBPMNProcess(gatewayContents);
      assert(parsedBPMN);
      assert(deployedModel);

  });

  describe('When a EnzianModel is deployed', () => {

    let enzian, contractInstance;

    beforeEach(async() => {
      let gatewayContents = await fs.readFile(
        path.resolve(__dirname, './resources' , 'gateway.bpmn'), 'utf8');
  
        enzian = new EnzianYellow(ganache.provider({
          "mnemonic": MNEMONIC
        }))
  
        let { parsedBPMN, deployedModel } = await enzian.deployBPMNProcess(gatewayContents);

        assert(parsedBPMN);
        assert(deployedModel);

        contractInstance = deployedModel;
    });

    it('executes valid tasks', async () => {
      let success = await enzian.executeTask(contractInstance, 0, account0);
      assert(success);

      success = await enzian.executeTask(contractInstance, 1, account0);
      assert(success);

      success = await enzian.executeTask(contractInstance, 2, account0);
      assert(success);

      let eventlog = await enzian.eventlog(contractInstance);
      assert.deepStrictEqual(eventlog, ['start', 'A', 'B']);
    })

    it('does not execute invalid tasks', async () => {
      let success = await enzian.executeTask(contractInstance, 2, account0);
      assert(!success);

      success = await enzian.executeTask(contractInstance, 0, account0);
      assert(success);

      success = await enzian.executeTask(contractInstance, 1, account0);
      assert(success);

      let eventlog = await enzian.eventlog(contractInstance);
      assert.deepStrictEqual(eventlog, ['start', 'A']);
    })

  });

  describe('With the resource perspective', () => {

    let enzian, contractInstance;

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

    it('executes valid tasks', async () => {

     
      await enzian.executeTask(contractInstance, 0, account0);  // start1
      await enzian.executeTask(contractInstance, 2, account0);  // A
      await enzian.executeTask(contractInstance, 5, account1);  // D
      // E MUST --> F MUST
      await enzian.executeTask(contractInstance, 1, account2);  // start2
      await enzian.executeTask(contractInstance, 6, account2);  // F
      await enzian.executeTask(contractInstance, 7, account1);  // E
      await enzian.executeTask(contractInstance, 3, account0);  // B
      await enzian.executeTask(contractInstance, 4, account0);  // C
      await enzian.executeTask(contractInstance, 8, account1);  // H
      // G MUST BEFORE I
      await enzian.executeTask(contractInstance, 9, account2);  // G
      await enzian.executeTask(contractInstance, 12, account1); // I
      await enzian.executeTask(contractInstance, 10, account2); // J
      await enzian.executeTask(contractInstance, 11, account2); // end2   
      await enzian.executeTask(contractInstance, 13, account1); // end1   
      
      let eventlog = await enzian.eventlog(contractInstance);
      assert.deepStrictEqual(eventlog, ['start1', 'A', 'D', 'start2', 'F', 'E', 'B', 'C', 'H', 'G', 'I', 'J', 'end2', 'end1']);
    })

   

  });

});