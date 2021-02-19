const assert = require('assert');
const util = require('util')
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

    });
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
      assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('start'), []);
      assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('A'), ['start']);
      assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('B'), ['A']);
      assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('end'), ['B']);
    });

    /**                   -> C -> D ->
     *            ->  B x               x ->  F ->
     *                    ->    E   ->
     *  () -> A +                                   + -> H -> (())
     *            ->                G           ->
     */           
    it('MÖÖÖRKLcan parse a BPMN model with gateways', async () => {
      let parsedBPMN = await parseBPMN(gatewayContents);
      assert(parsedBPMN);

      // 4 BPMN Elements are parsed (Start, A, B, C, D, E, F, G, H End)
      assert.strictEqual(parsedBPMN.obj.length, 10)

      //REQUIREMENTS
      assert.deepStrictEqual(parsedBPMN.getRequirementNamesByTaskName('start'), []);
      assert.deepStrictEqual(parsedBPMN.getRequirementNamesByTaskName('A'), ['start']);
      assert.deepStrictEqual(parsedBPMN.getRequirementNamesByTaskName('B'), ['A']);
      assert.deepStrictEqual(parsedBPMN.getRequirementNamesByTaskName('C'), ['B']);
      assert.deepStrictEqual(parsedBPMN.getRequirementNamesByTaskName('D'), ['C']);
      assert.deepStrictEqual(parsedBPMN.getRequirementNamesByTaskName('E'), ['B']);
      assert.deepStrictEqual(parsedBPMN.getRequirementNamesByTaskName('F'), ['D', 'E']);
      assert.deepStrictEqual(parsedBPMN.getRequirementNamesByTaskName('G'), ['A']);
      assert.deepStrictEqual(parsedBPMN.getRequirementNamesByTaskName('H'), ['G', 'F']);
      assert.deepStrictEqual(parsedBPMN.getRequirementNamesByTaskName('end'), ['H']);



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
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('start'), []);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('A'), ['start']);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('B'), ['A']);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('C'), ['B']);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('D'), ['A']);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('end'), ['D']);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('end1'), ['C']);


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
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('start1'), []);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('start2'), []);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('start3'), []);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('A'), ['start1']);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('B'), ['start2']);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('C'), ['start3']);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('D'), ['A', 'B']);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('E'), ['D', 'C']);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('end'), ['E']);

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
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('start'), []);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('A'), ['start']);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('B'), ['A']);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('C'), ['B']);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('D'), ['A']);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('E'), ['A']);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('F'), ['E', 'C', 'D']);
        assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('end'), ['F']);

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
  //   assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('start1'), []);
  //   assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('start2'), []);
  //   assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('start3'), []);
  //   assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('A'), ['start1']);
  //   assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('B'), ['start2']);
  //   assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('C'), ['start3']);
  //   assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('D'), ['A', 'B']);
  //   assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('E'), ['D', 'C']);
  //   assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('bpmn:EndEvent'), ['E']);

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


    // // 4 BPMN Elements are parsed (start, A, B, C, D, end1, end)
    // assert.strictEqual(feedback.obj.length, 7)

    // //REQUIREMENTS
    // assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('start'), []);
    // assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('A'), ['start']);
    // assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('B'), ['A']);
    // assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('C'), ['B']);
    // assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('D'), ['A']);
    // assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('end'), ['D']);
    // assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('end1'), ['C']);


  });

  it('can parse a model with a pool and lanes', async () => {

    const firstLane = "0xC09Df25ae8Cb470be2455bf9d91eF92fc437732b";
    const secondLane = "0xCcB73f1F58Ed551169691d91dF2963c429C76c60";
    const thirdLane = "0x03E1E628870fABfFa154a152B07ed306811c2D6b";

    let feedback = await parseBPMN(laneContents);
    assert(feedback);

    // 4 BPMN Elements are parsed (start, A, B, C, D, end1, end)
    assert.strictEqual(feedback.obj.length, 15)

    //REQUIREMENTS
    assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('start1'), []);
    assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('start2'), []);
    assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('A'), ['start1']);
    assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('B'), ['A']);
    assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('C'), ['B']);
    assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('D'), ['A']);
    assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('E'), ['D', 'F']);
    assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('F'), ['start2']);
    assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('G'), ['F']);
    assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('H'), ['C', 'E']);
    assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('I'), ['H', 'G']);
    assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('J'), ['G']);
    assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('K'), ['I']);
    assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('end1'), ['K']);
    assert.deepStrictEqual(feedback.getRequirementNamesByTaskName('end2'), ['J']);


    // CHECK CORRECT LANE ASSIGNMENT
    //REQUIREMENTS
    assert.strictEqual(feedback.getResourceByTaskName('start1'), firstLane);
    assert.strictEqual(feedback.getResourceByTaskName('start2'), thirdLane);
    assert.strictEqual(feedback.getResourceByTaskName('A'), firstLane);
    assert.strictEqual(feedback.getResourceByTaskName('B'), firstLane);
    assert.strictEqual(feedback.getResourceByTaskName('C'), firstLane);
    assert.strictEqual(feedback.getResourceByTaskName('D'), secondLane);
    assert.strictEqual(feedback.getResourceByTaskName('E'), secondLane);
    assert.strictEqual(feedback.getResourceByTaskName('F'), thirdLane);
    assert.strictEqual(feedback.getResourceByTaskName('G'), thirdLane);
    assert.strictEqual(feedback.getResourceByTaskName('H'), secondLane);
    assert.strictEqual(feedback.getResourceByTaskName('I'), secondLane);
    assert.strictEqual(feedback.getResourceByTaskName('K'), secondLane);
    assert.strictEqual(feedback.getResourceByTaskName('J'), thirdLane);
    assert.strictEqual(feedback.getResourceByTaskName('end1'), secondLane);
    assert.strictEqual(feedback.getResourceByTaskName('end2'), thirdLane);
    assert.notStrictEqual(feedback.getResourceByTaskName('end2'), secondLane);
    assert.notStrictEqual(feedback.getResourceByTaskName('end2'), firstLane);

    // FIND A COOL STRUCTURE TO STORE LANE ASSIGNMENT

  });



});


describe('we can load process models with decisions', () => {

  let gatewayDecisionSimpleContents, laneDecisionComplexContents;

  before(async () => {

    gatewayDecisionSimpleContents = await fs.readFile(
      path.resolve(__dirname, '../resources' , 'gateway_decision-simple.bpmn'), 'utf8');

    laneDecisionComplexContents = await fs.readFile(
      path.resolve(__dirname, '../resources' , 'lane_decision-complex.bpmn'), 'utf8');
 
  });


  it('and execute a simple model', async () => {

    let parsedBPMN = await parseBPMN(gatewayDecisionSimpleContents);
    assert(parsedBPMN);

    // DECISIONS
    assert.deepStrictEqual(parsedBPMN.getDecisionsByTaskName('C'), {
      decisions: {
        processVariable: 'i',
        operator: '>',
        localValue: [5]
      },
      lastTask: 'D'
    });
    assert.deepStrictEqual(parsedBPMN.getDecisionsByTaskName('E'), {
      decisions: {
        processVariable: 'i',
        operator: '<',
        localValue: [5]
      },
      lastTask: 'E'
    });
  });

  it('and execute a complex model with pools and lanes', async () => {

    let parsedBPMN = await parseBPMN(laneDecisionComplexContents);
    assert(parsedBPMN);

    // DECISIONS
    assert.deepStrictEqual(parsedBPMN.getDecisionsByTaskName('B'), {
      decisions: {
        processVariable: 'i',
        operator: '==',
        localValue: [5]
      },
      lastTask: 'C'
    });

    assert.deepStrictEqual(parsedBPMN.getDecisionsByTaskName('D'), {
      decisions: {
        processVariable: 'i',
        operator: '==',
        localValue: [6]
      },
      lastTask: 'E'
    });
  });

});

//TODO: LOOP
//TODO: EVENTS?
// MULTIPLE POOLS?