const assert = require('assert');
const ganache = require('ganache-cli');

const fs = require('fs-extra');
const path = require('path');


const EnzianYellow = require('./../src')


describe('A first Workflow', () => {
  

  it('can instantiate a BPMN Process Model', async () => {

    //here we are client?

    //client-sided:
    let gatewayContents = await fs.readFile(
      path.resolve(__dirname, './resources' , 'gateway.bpmn'), 'utf8');

      let enzian = new EnzianYellow(ganache.provider({}))

      let { parsedBPMN, deployedModel } = await enzian.deployBPMNProcess(gatewayContents);
      assert(parsedBPMN);
      assert(deployedModel);

      let success = await enzian.executeTask(deployedModel, 2);
      assert(!success);

      success = await enzian.executeTask(deployedModel, 0);
      assert(success);

      success = await enzian.executeTask(deployedModel, 1);
      assert(success);

      let eventlog = await enzian.eventlog(deployedModel);
      assert.deepStrictEqual(eventlog, ['start', 'A']);

  });

});