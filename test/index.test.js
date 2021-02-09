const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');

const { deployProcessModel } = require('./../src/index')

describe('A first Workflow', () => {
  

  it('combines BPMN parsing and web3 execution', async () => {


    //here we are client?

    //client-sided:
    let gatewayContents = await fs.readFile(
      path.resolve(__dirname, './resources' , 'gateway.bpmn'), 'utf8');


  });

});