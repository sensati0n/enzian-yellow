var _ = require('lodash');
const { BpmnGateway } = require('../global');
const Requirements = require('./requirements');
const BpmnModdle = require('./BpmnModdleWrapper');


var moddle = new BpmnModdle();

let returnvalue;

let globalId = 0;
let laneMap = new Map();

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
function getIncomingFlows(element) {
      // GET ALL PRECEEDING FLOWS OF THE CURRNT ELEMENT
      return _.filter(returnvalue.references, (reference) => {
        return reference.id === element.id && reference.property === 'bpmn:targetRef'
      // MAP THE RESULT-ELEMENT TO THEIR ID
      }).map((reference) => {
        return reference.element.id
      });
}

function getRequirements(incomingFlows) {

      // GET ALL PREDECESSORS OF THE PRECEEDING FLOWS
      return _.filter(returnvalue.references, (reference) => {
        return incomingFlows.includes(reference.id) && reference.property === 'bpmn:outgoing'
        // MAP TO THE ELEMENT
      }).flatMap((resource) => {
  
         // 'Recursive call': Get all requirements from the gateway
        if(resource.element.$type === 'bpmn:ExclusiveGateway' || resource.element.$type === 'bpmn:ParallelGateway') {

          getIncomingFlows(resource.element);
  
          // get all requirements of this flow
          let requirements2 = getRequirements( getIncomingFlows(resource.element));
          return requirements2;
        }
        else {
          return resource.element
        }
  
      });
}

function getDecisions(incomingFlows) {

  // GET ALL PREDECESSORS OF THE PRECEEDING FLOWS
  return _.filter(returnvalue.references, (reference) => {
    return incomingFlows.includes(reference.id) && reference.property === 'bpmn:outgoing'
    // MAP TO THE ELEMENT
  }).flatMap((resource) => {

    // 'Recursive call': Get all requirements from the gateway
    if(resource.element.$type === 'bpmn:ExclusiveGateway' && resource.element.incoming.length == 1) {
      let thedecision = resource.element.outgoing.filter(elem => elem.id === resource.id ).map(elem => elem.name);
      
      //ModdleElement
      let startWithSequenceFlowWithDecision = resource.element.outgoing.filter(elem => elem.id === resource.id)[0];
      let flag = true;

      while(flag) {
        if(startWithSequenceFlowWithDecision.$type === 'bpmn:SequenceFlow') {
          if(startWithSequenceFlowWithDecision.targetRef.$type === 'bpmn:ExclusiveGateway') {// ASSUME: CORRESPONDING MERGING
            startWithSequenceFlowWithDecision = startWithSequenceFlowWithDecision.sourceRef
          flag = false;

            }
            else {
              startWithSequenceFlowWithDecision = startWithSequenceFlowWithDecision.targetRef;
            }  
        }
        else if(startWithSequenceFlowWithDecision.$type === 'bpmn:Task') {
          startWithSequenceFlowWithDecision = startWithSequenceFlowWithDecision.outgoing[0];
        }
        else {
          // IGNORE THIS CASES
          flag = false;
        }
      }

      //PARSE THE DECISION
      /*
      // integer: pVV without ticks
        pvId OPERATOR 4

        //with element as OPERATOR
        pvId in [5, 12]
        pvId in {1, 3, 7, 12}
      // string: pVV with 'ticks'
        pVId OPERATOR 'processVariableValue' 
      */
      if(thedecision[0]) {

        let processVariable = thedecision[0].split(" ")[0];
        let operator = thedecision[0].split(" ")[1];
          
        let localValue = thedecision[0].split(" ")[2];
      
        if(!processVariable.startsWith('\'\'')) {
          localValue = [parseInt(localValue)];
        }
      
        return {
          decisions: {
            processVariable, operator, localValue
          },
          lastTask: startWithSequenceFlowWithDecision.name
        };
      
      }
     
    }

  });
}

function getCompetitors(incomingFlows) {

     // GET ALL PREDECESSORS OF THE PRECEEDING FLOWS
     return _.filter(returnvalue.references, (reference) => {
      return incomingFlows.includes(reference.id) && reference.property === 'bpmn:outgoing'
      // MAP TO THE ELEMENT
    }).flatMap((resource) => {

      //'Recursive call': Get all requirements from the gateway
      if(resource.element.$type === 'bpmn:ExclusiveGateway' || resource.element.$type === 'bpmn:InclusiveGateway') {

        return _.map(resource.element.outgoing, (elem) => {
            return elem.targetRef.name
        });
      }
    });
  
}


function getTaskType(incomingFlows) {

  // GET ALL PREDECESSORS OF THE PRECEEDING FLOWS
  return _.filter(returnvalue.references, (reference) => {
    return incomingFlows.includes(reference.id) && reference.property === 'bpmn:outgoing'
    // MAP TO THE ELEMENT
  }).flatMap((resource) => {

      if(_.filter(returnvalue.elementsById, (elem) => {return elem.id === resource.element.id})[0].incoming?.length > 1) {
        switch(resource.element.$type) {
          case 'bpmn:ExclusiveGateway': return BpmnGateway.XOR;
          case 'bpmn:ParallelGateway': return BpmnGateway.AND;
          case 'bpmn:InclusiveGateway': return BpmnGateway.OR;
        }
      }

  });
}


function getRequirementsOfElement(element) {

  let incommingFlows = getIncomingFlows(element);

  /**
   * requirements = [
   *    Base { '$type': 'bpmn:Task', id: 'Activity_1w5wj7r', name: 'E' },
   *    Base { '$type': 'bpmn:Task', id: 'Activity_05hwpw9', name: 'D' }
   * ]
   */
  let requirements = getRequirements(incommingFlows);
  let competitors = getCompetitors(incommingFlows);
  let decisions = getDecisions(incommingFlows);
  let taskType = getTaskType(incommingFlows)[0];

  // If laneMap is available, then get the resource associated with the task.
  let _resource;
  _resource = laneMap ? _resource = laneMap.get(element.id) : undefined

    return {
      "task": {name: element.name, id: element._id},
      "resource": _resource?.name,
      "decisions": decisions[0]? decisions[0] : undefined,
      "competitors": competitors[0]? competitors : undefined,
      "proceedingMergingGateway": taskType,
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

  globalId = 0;

  // PARSE THE BPMN MODEL
  returnvalue = await moddle.fromXML(bpmn);
  let rv2 = returnvalue;
  let wantedLanes = ['bpmn:Lane']

  const laneElements = _.filter(returnvalue.elementsById, (elem) => {return wantedLanes.includes(elem.$type)});

  if(laneElements.length != 0) {
    laneElements.forEach(lane => {
      lane.flowNodeRef.forEach(flowNode => {
        laneMap.set(flowNode.id, lane);
      })   
    })
  }


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
 
  let allRequirements = bpmnElements.map((element) => getRequirementsOfElement(element));
    

  return new Requirements(allRequirements);

};

module.exports = parseBPMNfile;