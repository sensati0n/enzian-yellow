const assert = require('assert');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');

const load = require('../../src/bpmn/load');

describe('We can load BPMN Files', () => {

  let simpleFileContents, andFileContents, xorBpmnModelContents;

    before(async () => {
      const simpleBpmnModelPath = path.resolve(__dirname, '../resources' , 'simple.bpmn');
      simpleFileContents = await fs.readFile(simpleBpmnModelPath, 'utf8');

      const bpmnModelPath = path.resolve(__dirname, '../resources' , 'and.bpmn');
      andFileContents = await fs.readFile(bpmnModelPath, 'utf8');

      const xorBpmnModelPath = path.resolve(__dirname, '../resources' , 'xor.bpmn');
      xorBpmnModelContents = await fs.readFile(xorBpmnModelPath, 'utf8');
    });
    
    it('checks that the files are loaded', async () => {

      assert(simpleFileContents);
      assert(andFileContents);
      assert(xorBpmnModelContents);

    })
    
    /**
     *  () -> A -> B (())
     */
    it('can parse a simple BPMN model', async () => {
      let feedback = await load(simpleFileContents);
      assert(feedback);

      // 4 BPMN Elements are parsed (Start, A, B, End)
      assert.strictEqual(feedback.obj.length, 4)
      
      //REQUIREMENTS
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('bpmn:StartEvent'), []);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('A'), ['bpmn:StartEvent']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('B'), ['A']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('bpmn:EndEvent'), ['B']);
    });

    /**               ->  C -> D ->
     *  () -> A -> B +               + -> F -> (())
     *                ->    E    ->
     */           
    it('can parse the and BPMN model', async () => {
      let feedback = await load(andFileContents);
      assert(feedback);

      console.log(feedback.getRequirementsByTaskName('F'));
      // 4 BPMN Elements are parsed (Start, A, B, C, D, E, F End)
      assert.strictEqual(feedback.obj.length, 8)

      //REQUIREMENTS
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('start'), []);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('A'), ['start']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('B'), ['A']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('C'), ['B']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('D'), ['C']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('E'), ['B']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('F'), ['E', 'D']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('end'), ['F']);

    });

    /**           ->  C ->  D ->
     *  () -> A x               x -> F -> (())
     *            ->    E     ->
     */
    it('can parse a xor BPMN model', async () => {
      let feedback = await load(xorBpmnModelContents);
      assert(feedback);

      
      console.log(feedback.getRequirementsByTaskName('F'));
      // 4 BPMN Elements are parsed (Start, A, B, C, D, E, F End)
      assert.strictEqual(feedback.obj.length, 8)

      //REQUIREMENTS
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('start'), []);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('A'), ['start']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('B'), ['A']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('C'), ['B']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('D'), ['C']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('E'), ['B']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('F'), ['E', 'D']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('end'), ['F']);

    });

  

});



