const assert = require('assert');
const ganache = require('ganache-cli');

const fs = require('fs-extra');
const path = require('path');
const util = require('util')

const EnzianYellow = require('../src');
const Web3Wrapper = require('../src/ethereum/web3-wrapper');

// do not change this
const MNEMONIC = "enzian yellow";
const account0 = '0xC09Df25ae8Cb470be2455bf9d91eF92fc437732b';

/**
 * Tests the whole application, i.e. the EnzianYellow class.
 * 
 * "Methods" under investigation are: deploy a process model and execute processes.
 * "Test Cases" are: Get correct traces executed and are invalid traces forbidden?
 * 
 */
describe('The Int-Decisions', () => {
  
    let model, contractInstance, enzian;

    beforeEach(async() => {
        let intDecisionsContents = await fs.readFile(
            path.resolve(__dirname, './resources/dev' , 'int-decisions.bpmn'), 'utf8');

                  
      enzian = new EnzianYellow(ganache.provider({
        "mnemonic": MNEMONIC
      }));
              
        let { parsedBPMN, deployedModel } = await enzian.deployBPMNProcess(intDecisionsContents);
        model = parsedBPMN;
        contractInstance = deployedModel;

        assert(model);
        assert(contractInstance);

        // console.log(util.inspect(model, false, null, true));
    });


  it('int ==: start, A, B, [!D], C, [!E], F, end', async () => {

    await enzian.executeTask(contractInstance, model.idByName('start'),  account0);
    await enzian.executeTask(contractInstance, model.idByName('A'),  account0);
    try {
      await enzian.executeTask(contractInstance, model.idByName('B'),  account0);
      assert(false);
    } catch(error)
    {
      assert(error);
    }
    enzian.updateProcessVariable(contractInstance, 'i', 5, account0);
    await enzian.executeTask(contractInstance, model.idByName('B'),  account0);

    try {
      await enzian.executeTask(contractInstance, model.idByName('D'),  account0);
      assert(false);
    } catch(error)
    {
      assert(error);
    }

    enzian.updateProcessVariable(contractInstance, 'i', 6, account0);

    try {
      await enzian.executeTask(contractInstance, model.idByName('D'),  account0);
      assert(false);
    } catch(error)
    {
      // DO NOT REPEAT TASKS!!!
      assert(error);
    }

    await enzian.executeTask(contractInstance, model.idByName('C'),  account0);

    try {
      await enzian.executeTask(contractInstance, model.idByName('E'),  account0);
      assert(false);
    } catch(error)
    {
      // DO NOT REPEAT TASKS!!!
      assert(error);
    }

    await enzian.executeTask(contractInstance, model.idByName('F'),  account0);
    await enzian.executeTask(contractInstance, model.idByName('end'),  account0);


    // enzian.executeTask(contractInstance, model.idByName('start'),  account0);
    // enzian.executeTask(contractInstance, model.idByName('start'),  account0);
    // enzian.executeTask(contractInstance, model.idByName('start'),  account0);

    let eventlog = await enzian.eventlog(contractInstance);
    console.log(eventlog);

 //   console.log(util.inspect(model, false, null, true));
  });


  it('int >: start, A, B, [!D], C, [!E], F, end', async () => {

    await enzian.executeTask(contractInstance, model.idByName('start'),  account0);
    await enzian.executeTask(contractInstance, model.idByName('A'),  account0);
    try {
      await enzian.executeTask(contractInstance, model.idByName('B'),  account0);
      assert(false);
    } catch(error)
    {
      assert(error);
    }
    enzian.updateProcessVariable(contractInstance, 'i', 5, account0);
    await enzian.executeTask(contractInstance, model.idByName('B'),  account0);

    try {
      await enzian.executeTask(contractInstance, model.idByName('D'),  account0);
      assert(false);
    } catch(error)
    {
      assert(error);
    }

    enzian.updateProcessVariable(contractInstance, 'i', 6, account0);

    try {
      await enzian.executeTask(contractInstance, model.idByName('D'),  account0);
      assert(false);
    } catch(error)
    {
      // DO NOT REPEAT TASKS!!!
      assert(error);
    }

    await enzian.executeTask(contractInstance, model.idByName('C'),  account0);

    try {
      await enzian.executeTask(contractInstance, model.idByName('E'),  account0);
      assert(false);
    } catch(error)
    {
      // DO NOT REPEAT TASKS!!!
      assert(error);
    }

    await enzian.executeTask(contractInstance, model.idByName('F'),  account0);
    await enzian.executeTask(contractInstance, model.idByName('end'),  account0);


    // enzian.executeTask(contractInstance, model.idByName('start'),  account0);
    // enzian.executeTask(contractInstance, model.idByName('start'),  account0);
    // enzian.executeTask(contractInstance, model.idByName('start'),  account0);

    let eventlog = await enzian.eventlog(contractInstance);
    console.log(eventlog);

 //   console.log(util.inspect(model, false, null, true));
  });

  it('greater', async() => {

    await enzian.executeTask(contractInstance, model.idByName('start'),  account0);
    await enzian.executeTask(contractInstance, model.idByName('A'),  account0);
    try {
      await enzian.executeTask(contractInstance, model.idByName('B'),  account0);
      assert(false);
    } catch(error)
    {
      assert(error);
      console.log("B1: i == 0", error)
    }
    enzian.updateProcessVariable(contractInstance, 'i', 6, account0);
    try {
      await enzian.executeTask(contractInstance, model.idByName('D'),  account0);
      assert(false);
    } catch(error)
    {
      console.log("D. i==6", error);
      assert(error);
    }

    enzian.updateProcessVariable(contractInstance, 'i', 7, account0);

    await enzian.executeTask(contractInstance, model.idByName('D'),  account0);

    enzian.updateProcessVariable(contractInstance, 'i', 5, account0);

    try {
      await enzian.executeTask(contractInstance, model.idByName('B'),  account0);
      assert(false);
    } catch(error)
    {
      console.log("B2. i==5", error);

      assert(error);
    }


    let eventlog = await enzian.eventlog(contractInstance);
    console.log(eventlog);
  });




});