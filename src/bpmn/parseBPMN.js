const BpmnModdle = require('bpmn-moddle');
var _ = require('lodash');
const Requirements = require('./requirements');

var moddle = new BpmnModdle();

let returnvalue;

let globalId = 0;

/**
     * incommingFlows: ['Flow_0gmq9vn']
     * 
     * mapped from 
     * [ 
     *     {
     *          element: { '$type': 'bpmn:SequenceFlow', id: 'Flow_0gmq9vn' }
     *          property: 'bpmn:sourceRef',
     *          id: 'StartEvent_10uewdp'
     *      }
     * ]
     */
function getIncommingFlows(element) {
      // GET ALL PRECEEDING FLOWS OF THE CURRNT ELEMENT
      return _.filter(returnvalue.references, (reference) => {
        return reference.id === element.id && reference.property === 'bpmn:targetRef'
      // MAP THE RESULT-ELEMENT TO THEIR ID
      }).map((reference) => {
        return reference.element.id
      });
}


function getRequirements(incommingFlows) {
  
      // GET ALL PREDECESSORS OF THE PRECEEDING FLOWS
      return _.filter(returnvalue.references, (reference) => {
        return incommingFlows.includes(reference.id) && reference.property === 'bpmn:outgoing'
        // MAP TO THE ELEMENT
      }).flatMap((resource) => {
  
        /**
         * 'Recursive call': Get all requirements from the gateway
         */
        if(resource.element.$type === 'bpmn:ExclusiveGateway' || resource.element.$type === 'bpmn:ParallelGateway') {
          getIncommingFlows(resource.element);
  
          // get all requirements of this flow
          let requirements2 = getRequirements( getIncommingFlows(resource.element));
          return requirements2;
        }
        else {
          return resource.element
        }
  
      });
}

function getRequirementsOfElement(element) {
  let incommingFlows = getIncommingFlows(element);
      
  //console.log("IF:\t", incommingFlows);
  

  /**
   * requirements = [
   *    Base { '$type': 'bpmn:Task', id: 'Activity_1w5wj7r', name: 'E' },
   *    Base { '$type': 'bpmn:Task', id: 'Activity_05hwpw9', name: 'D' }
   * ]
   */
  let requirements = getRequirements(incommingFlows);
  
  //console.log("REQ:\t", requirements);

  /*
  return {
    "task": element.name? element.name : element.$type ,
    "requirements": requirements.map((r) => {
      if(Array.isArray(r)) {
        return  r.map(rr => rr.name? rr.name : rr.$type);
      }
      return r.name? r.name : r.$type
    })};
  */
    
    return {
      "task": {name: element.name, id: element._id},
      "requirements": requirements.map((r) => {
        if(Array.isArray(r)) {
          return  r.map(rr => rr.name? rr.name : rr.$type);
        }
        return {name: r.name, id: r._id}
      })};
      
}


  // USING LODASH BECAUSE
  //console.log("END", returnvalue.elementsById.filter(i => i.$type === 'bpmn:Task' || i.$type === 'bpmn:StartEvent'));
  //NOT WORKING  "returnvalue.elementsById.filter is not a function" WE HAVE A JSON ELEMENT HERE
const parseBPMNfile = async (bpmn) => {

  // PARSE THE BPMN MODEL
  returnvalue = await moddle.fromXML(bpmn);

  let wantedLanes = ['bpmn:Lane']

  const laneElements = _.filter(returnvalue.elementsById, (elem) => {return wantedLanes.includes(elem.$type)});

  //console.log(laneElements);

  let laneMap = new Map();
  if(laneElements.length != 0) {
    laneElements.forEach(lane => {
      lane.flowNodeRef.forEach(flowNode => {
        laneMap.set(flowNode.id, lane);
      })   
    })
  }

  //console.log(laneMap);


  //FETCH ALL BPMN ELEMENTS (EXCEPT GATEWAYS - THEIR REQUIREMENTS ARE ENCODED IN THE TASKS)
  let wantedBpmn = ['bpmn:Task', 'bpmn:StartEvent', 'bpmn:EndEvent']

   /*
    [ 
      Base { '$type': 'bpmn:StartEvent', id: 'Event_19ta5rs', name: 'start' },
      Base { '$type': 'bpmn:Task', id: 'Activity_1jq91gf', name: 'A' },
      Base { '$type': 'bpmn:Task', id: 'Activity_18c2c8u', name: 'B' },
      Base { '$type': 'bpmn:Task', id: 'Activity_0x4rt6i', name: 'C' },
      Base { '$type': 'bpmn:Task', id: 'Activity_1w5wj7r', name: 'E' },
      Base { '$type': 'bpmn:Task', id: 'Activity_05hwpw9', name: 'D' },
      Base { '$type': 'bpmn:Task', id: 'Activity_0cd10xm', name: 'F' },
      Base { '$type': 'bpmn:EndEvent', id: 'Event_182j92b', name: 'end' }
    ]
  */
  const bpmnElements = _.filter(returnvalue.elementsById, (elem) => {return wantedBpmn.includes(elem.$type)})
    .map(elem => {
      elem._id = globalId++;
      return elem;
    });
 
  //console.log("BPMN", bpmnElements);


  // element: { '$type': 'bpmn:Task', id: 'Activity_1jq91gf', name: 'A' }
    //console.log("\nELEM:\t", element.name);
    let allRequirements = bpmnElements.map((element) => getRequirementsOfElement(element));
    

  return new Requirements(allRequirements);

};

module.exports = parseBPMNfile;