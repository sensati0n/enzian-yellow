const assert = require('assert');
const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');

const parseBPMN = require('../../src/bpmn/parseBPMN');

describe('We can load BPMN Files', () => {

  let simpleFileContents;
    
    it('checks that the files are loaded', async () => {
      simpleFileContents = await fs.readFile(
        path.resolve(__dirname, '../resources' , 'simple.bpmn'), 'utf8');
      
        assert(simpleFileContents);

    })
});

/**
 * BPMN models with following properties:
 * - no 2 following gateways
 * - one start and one end event
 */
describe('we can load simple, block-structured process models', () => {

      let simpleFileContents, gatewayContents;

    before(async () => {
      simpleFileContents = await fs.readFile(
        path.resolve(__dirname, '../resources' , 'simple.bpmn'), 'utf8');

      gatewayContents = await fs.readFile(
        path.resolve(__dirname, '../resources' , 'gateway.bpmn'), 'utf8');

    });
    
    /**
     *  () -> A -> B (())
     */
    it('can parse a simple BPMN model', async () => {
      let feedback = await parseBPMN(simpleFileContents);
      assert(feedback);

      // 4 BPMN Elements are parsed (Start, A, B, End)
      assert.strictEqual(feedback.obj.length, 4)
      
      //REQUIREMENTS
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('bpmn:StartEvent'), []);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('A'), ['bpmn:StartEvent']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('B'), ['A']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('bpmn:EndEvent'), ['B']);
      console.log(feedback);
    });

    /**                   -> C -> D ->
     *            ->  B x               x ->  F ->
     *                    ->    E   ->
     *  () -> A +                                   + -> H -> (())
     *            ->                G           ->
     */           
    it('can parse a BPMN model with gateways', async () => {
      let feedback = await parseBPMN(gatewayContents);
      assert(feedback);

      
      // 4 BPMN Elements are parsed (Start, A, B, C, D, E, F, G, H End)
      assert.strictEqual(feedback.obj.length, 10)

      //REQUIREMENTS
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('start'), []);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('A'), ['start']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('B'), ['A']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('C'), ['B']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('D'), ['C']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('E'), ['B']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('F'), ['D', 'E']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('G'), ['A']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('H'), ['G', 'F']);
      assert.deepStrictEqual(feedback.getRequirementsByTaskName('end'), ['H']);

    });

   
});
  

/**
 * BPMN models with following properties:
 * - 2 following gateways allowed
 * - multiple start and event
 * - not block-structured in the simple, way of missing merging-gateway
 */
describe('we can load more complex, non-block-structured (simple-way) process models', () => {

      let multiEndContents, multiStartContents, multiGatewayContents;

      before(async () => {

        multiEndContents = await fs.readFile(
          path.resolve(__dirname, '../resources' , 'multi-end.bpmn'), 'utf8');

        multiStartContents = await fs.readFile(
          path.resolve(__dirname, '../resources' , 'multi-start.bpmn'), 'utf8');

        multiGatewayContents = await fs.readFile(
          path.resolve(__dirname, '../resources' , 'multi-gateway.bpmn'), 'utf8');
      });

      /**                -> B -> C -> ((end1))
       * (start) -> A x
       *                ->    D    -> ((end))
       */
      it('can parse a model with multiple end events', async () => {

        let feedback = await parseBPMN(multiEndContents);
        assert(feedback);

        // 4 BPMN Elements are parsed (start, A, B, C, D, end1, end)
        assert.strictEqual(feedback.obj.length, 7)
  
        //REQUIREMENTS
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('start'), []);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('A'), ['start']);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('B'), ['A']);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('C'), ['B']);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('D'), ['A']);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('end'), ['D']);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('end1'), ['C']);


      });

      /**
       * (start1) ->  A ->
       *                   x  -> D  -> 
       * (start2) ->  B ->                + ->  E   ->   ((bpmn:EndEvent))
       *                                
       * (start3) ->        C       ->
       */
      it('can parse a model with multiple start events', async () => {

        let feedback = await parseBPMN(multiStartContents);
        assert(feedback);

        // 4 BPMN Elements are parsed (start1, start2, start3 A, B, C, D, E, bpmn:EndEvent)
        assert.strictEqual(feedback.obj.length, 9)
  
        //REQUIREMENTS
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('start1'), []);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('start2'), []);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('start3'), []);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('A'), ['start1']);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('B'), ['start2']);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('C'), ['start3']);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('D'), ['A', 'B']);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('E'), ['D', 'C']);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('bpmn:EndEvent'), ['E']);

      });
    
       /**                              -> B  ->  C   ->
       *                          ->  + ----------------  +   ->
       *                                ->      D    ->
       *  (bpmn:StartEvent) ->  x ------------------------------  x  -> ((bpmn:EndEvent))
       *                          ->          E               ->
       * 
       */
      it('can parse a model with multiple gatways following each other', async () => {

        let feedback = await parseBPMN(multiGatewayContents);
        assert(feedback);
        
        // 4 BPMN Elements are parsed (start1, start2, start3 A, B, C, D, E, bpmn:EndEvent)
        assert.strictEqual(feedback.obj.length, 8)
  
        //REQUIREMENTS
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('bpmn:StartEvent'), []);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('A'), ['bpmn:StartEvent']);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('B'), ['A']);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('C'), ['B']);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('D'), ['A']);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('E'), ['A']);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('F'), ['E', 'C', 'D']);
        assert.deepStrictEqual(feedback.getRequirementsByTaskName('bpmn:EndEvent'), ['F']);

      });



});

describe('we can load complex, non-block-structured process models', () => {

  // let nonBlockContents;

  // before(async () => {
  //   nonBlockContents = await fs.readFile(
  //     path.resolve(__dirname, '../resources' , 'non-block.bpmn'), 'utf8');
  // });

  // /**
  //  * (start1) ->  A ->
  //  *                   x  -> D  -> 
  //  * (start2) ->  B ->                + ->  E   ->   ((bpmn:EndEvent))
  //  *                                
  //  * (start3) ->        C       ->
  //  */
  // it('can parse a complex model with non-block-structured character', async () => {

  //   let feedback = await load(multiStartContents);
  //   assert(feedback);

  //   // 4 BPMN Elements are parsed (start1, start2, start3 A, B, C, D, E, bpmn:EndEvent)
  //   assert.strictEqual(feedback.obj.length, 9)

  //   //REQUIREMENTS
  //   assert.deepStrictEqual(feedback.getRequirementsByTaskName('start1'), []);
  //   assert.deepStrictEqual(feedback.getRequirementsByTaskName('start2'), []);
  //   assert.deepStrictEqual(feedback.getRequirementsByTaskName('start3'), []);
  //   assert.deepStrictEqual(feedback.getRequirementsByTaskName('A'), ['start1']);
  //   assert.deepStrictEqual(feedback.getRequirementsByTaskName('B'), ['start2']);
  //   assert.deepStrictEqual(feedback.getRequirementsByTaskName('C'), ['start3']);
  //   assert.deepStrictEqual(feedback.getRequirementsByTaskName('D'), ['A', 'B']);
  //   assert.deepStrictEqual(feedback.getRequirementsByTaskName('E'), ['D', 'C']);
  //   assert.deepStrictEqual(feedback.getRequirementsByTaskName('bpmn:EndEvent'), ['E']);

  // });




});


describe('we can load process models with pools', () => {

  let poolContents, laneContents;

  before(async () => {

    poolContents = await fs.readFile(
      path.resolve(__dirname, '../resources' , 'pool.bpmn'), 'utf8');

    laneContents = await fs.readFile(
      path.resolve(__dirname, '../resources' , 'lane.bpmn'), 'utf8');
 
  });

  /**                -> B -> C -> ((end1))
   * (start) -> A x
   *                ->    D    -> ((end))
   */
  it('can parse a model with a pool', async () => {

    let feedback = await parseBPMN(poolContents);
    assert(feedback);

    console.log(feedback);

    // // 4 BPMN Elements are parsed (start, A, B, C, D, end1, end)
    // assert.strictEqual(feedback.obj.length, 7)

    // //REQUIREMENTS
    // assert.deepStrictEqual(feedback.getRequirementsByTaskName('start'), []);
    // assert.deepStrictEqual(feedback.getRequirementsByTaskName('A'), ['start']);
    // assert.deepStrictEqual(feedback.getRequirementsByTaskName('B'), ['A']);
    // assert.deepStrictEqual(feedback.getRequirementsByTaskName('C'), ['B']);
    // assert.deepStrictEqual(feedback.getRequirementsByTaskName('D'), ['A']);
    // assert.deepStrictEqual(feedback.getRequirementsByTaskName('end'), ['D']);
    // assert.deepStrictEqual(feedback.getRequirementsByTaskName('end1'), ['C']);


  });

  it('can parse a model with a pool and lanes', async () => {

    let feedback = await parseBPMN(laneContents);
    assert(feedback);


    // 4 BPMN Elements are parsed (start, A, B, C, D, end1, end)
    assert.strictEqual(feedback.obj.length, 14)

    //REQUIREMENTS
    assert.deepStrictEqual(feedback.getRequirementsByTaskName('start1'), []);
    assert.deepStrictEqual(feedback.getRequirementsByTaskName('start2'), []);
    assert.deepStrictEqual(feedback.getRequirementsByTaskName('A'), ['start1']);
    assert.deepStrictEqual(feedback.getRequirementsByTaskName('B'), ['A']);
    assert.deepStrictEqual(feedback.getRequirementsByTaskName('C'), ['B']);
    assert.deepStrictEqual(feedback.getRequirementsByTaskName('D'), ['A']);
    assert.deepStrictEqual(feedback.getRequirementsByTaskName('E'), ['D', 'F']);
    assert.deepStrictEqual(feedback.getRequirementsByTaskName('F'), ['start2']);
    assert.deepStrictEqual(feedback.getRequirementsByTaskName('G'), ['F']);
    assert.deepStrictEqual(feedback.getRequirementsByTaskName('H'), ['C', 'E']);
    assert.deepStrictEqual(feedback.getRequirementsByTaskName('I'), ['H', 'G']);
    assert.deepStrictEqual(feedback.getRequirementsByTaskName('J'), ['G']);
    assert.deepStrictEqual(feedback.getRequirementsByTaskName('end1'), ['I']);
    assert.deepStrictEqual(feedback.getRequirementsByTaskName('end2'), ['J']);


    // CHECK CORRECT LANE ASSIGNMENT

    // FIND A COOL STRUCTURE TO STORE LANE ASSIGNMENT

  });



});

//TODO: LOOP
//TODO: EVENTS?
// MULTIPLE POOLS?