const BpmnModdle = require('bpmn-moddle');
var _ = require('lodash');
const Requirements = require('./requirements');

var moddle = new BpmnModdle();




const parseBPMNfile = async (bpmn) => {

  // PARSE THE BPMN MODEL
  let returnvalue = await moddle.fromXML(bpmn);

  // USING LODASH BECAUSE
  //console.log("END", returnvalue.elementsById.filter(i => i.$type === 'bpmn:Task' || i.$type === 'bpmn:StartEvent'));
  //NOT WORKING  "returnvalue.elementsById.filter is not a function" WE HAVE A JSON ELEMENT HERE


  //FETCH ALL BPMN ELEMENTS (EXCEPT GATEWAYS - THEIR REQUIREMENTS ARE ENCODED IN THE TASKS)
  let wantedBpmn = ['bpmn:Task', 'bpmn:StartEvent', 'bpmn:EndEvent']
  const bpmnElements = _.filter(returnvalue.elementsById, (elem) => {return wantedBpmn.includes(elem.$type)});
 

  //console.log("bpmnElements", bpmnElements);
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

  let allRequirements = bpmnElements.map((element) => {
    
    // element: { '$type': 'bpmn:Task', id: 'Activity_1jq91gf', name: 'A' }
    //console.log("\nELEM:\t", element.name);

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
    let incommingFlows =
      // GET ALL PRECEEDING FLOWS OF THE CURRNT ELEMENT
      _.filter(returnvalue.references, (reference) => {
        return reference.id === element.id && reference.property === 'bpmn:targetRef'
      // MAP THE RESULT-ELEMENT TO THEIR ID
      }).map((reference) => {
        return reference.element.id
      });
      
    //console.log("IF:\t", incommingFlows);
    

    /**
     * requirements = [
     *    Base { '$type': 'bpmn:Task', id: 'Activity_1w5wj7r', name: 'E' },
     *    Base { '$type': 'bpmn:Task', id: 'Activity_05hwpw9', name: 'D' }
     * ]
     */
    let requirements =
      // GET ALL PREDECESSORS OF THE PRECEEDING FLOWS
      _.filter(returnvalue.references, (reference) => {
      return incommingFlows.includes(reference.id) && reference.property === 'bpmn:outgoing'
      // MAP TO THE ELEMENT
    }).flatMap((resource) => {

      /**
       * 'Recursive call': Get all requirements from the gateway
       */
      if(resource.element.$type === 'bpmn:ExclusiveGateway' || resource.element.$type === 'bpmn:ParallelGateway') {
        // GET ALL PRECEEDING FLOWS OF THE GATEWAY
        let incommingFlows2 =
          _.filter(returnvalue.references, (reference) => {
            return reference.id === resource.element.id && reference.property === 'bpmn:targetRef'
          }).map((reference) => {
            return reference.element.id
          });

        // get all requirements of this flow
        let requirements2 =
        /**
         * Get all predecessors of incommingFlows
         */
        _.filter(returnvalue.references, (reference) => {
          return incommingFlows2.includes(reference.id) && reference.property === 'bpmn:outgoing' 
        }).map((resource) => {
          return resource.element
        });
        return requirements2;
      }
      else {
        return resource.element
      }

    });
    
    //console.log("REQ:\t", requirements);

    return {
      "task": element.name? element.name : element.$type ,
      "requirements": requirements.map((r) => {
        if(Array.isArray(r)) {
          return  r.map(rr => rr.name? rr.name : rr.$type);
        }
        return r.name? r.name : r.$type
      })};
   
  });

  return new Requirements(allRequirements);

 
  //multiple rootElements?
  //  console.log("The id of the process is:", definitions.rootElements[0].id);
  //  console.log(definitions.rootElements[0]);
  //  console.log(definitions.rootElements[0].flowElements);

  //  definitions.rootElements[0].flowElements.forEach( elem => { console.log(elem.$type); });
  

    //iterate over flow Elements

    //HOW?
    
    // [find all start elements] for each start

    // RECURSIVE

    //  start

    //  find all sequence flows where fistElem is start




  /*
  moddle.fromXML(bpmn, function (err, definitions) {
          if (definitions["rootElements"]) {
            definitions["rootElements"].forEach((process) => {

              if (process["laneSets"]) {
                process["laneSets"].forEach((laneset) => {
                  laneset["lanes"].forEach((lane) => {
                    if (lane["flowNodeRef"]) {
                      lane["flowNodeRef"].forEach((e) => {
                        if (e.$type === "bpmn:StartEvent") {
                          e.resource = lane.name;
                          addTasksToJson(e);
                        }
                      });
                      lane["flowNodeRef"].forEach((e) => {
                        if (e.$type === "bpmn:Task") {
                          e.resource = lane.name;
                          addTasksToJson(e);
                        }
                      });
                      lane["flowNodeRef"].forEach((e) => {
                        if (e.$type === "bpmn:EndEvent") {
                          e.resource = lane.name;
                          addTasksToJson(e);
                        }
                      });
                    }
                  });
                });
              }
              if (process["flowElements"]) {
                process["flowElements"].forEach((e) => {
                  if (e.$type !== "bpmn:SequenceFlow") {
                    //wenn e kein seqflow dann betrachte ich incoming elemente
                    if (e.incoming) {
                      e.incoming.forEach((incoming) => {

                        if (incoming.$type === "bpmn:SequenceFlow") {
                          //console.log(incoming);
                          let bpmnType = incoming.sourceRef.$type;
                          if (
                            bpmnType === "bpmn:StartEvent" ||
                            bpmnType === "bpmn:Task" ||
                            bpmnType === "bpmn:EndEvent"
                          ) {
                            if (tasksObject[e.id]) {
                              tasksObject[e.id].requirements.push(
                                tasksObject[incoming.sourceRef.id].id
                              );
                            }
                          }
                          if (bpmnType === "bpmn:ExclusiveGateway") {
                            incoming.sourceRef.incoming.forEach(
                              (exclusive_incoming) => {
                                if (tasksObject[e.id]) {
                                  tasksObject[e.id].requirements.push(
                                    tasksObject[exclusive_incoming.sourceRef.id]
                                      .id
                                  );
                                  tasksObject[e.id].type =
                                    "bpmn:ExclusiveGateway";
                                }
                              }
                            );
                          }
                          if (bpmnType === "bpmn:ParallelGateway") {
                            incoming.sourceRef.incoming.forEach(
                              (parallel_incoming) => {
                                if (tasksObject[e.id]) {
                                  tasksObject[e.id].requirements.push(
                                    tasksObject[parallel_incoming.sourceRef.id]
                                      .id
                                  );
                                  tasksObject[e.id].type = bpmnType;
                                }
                              }
                            );
                          }
                          if (bpmnType === "bpmn:InclusiveGateway") {
                            incoming.sourceRef.incoming.forEach(
                              (inclusive_incoming) => {
                                if (tasksObject[e.id]) {
                                  tasksObject[e.id].requirements.push(
                                    tasksObject[inclusive_incoming.sourceRef.id]
                                      .id
                                  );
                                  tasksObject[e.id].type = bpmnType;
                                }
                              }
                            );
                          }
                        }
                      });
                    }
                    //handle competitors and Decisions
                    if (e.$type === "bpmn:ExclusiveGateway") {
                      if (e.outgoing) {
                        //competitor sollten hier ausgehende Seqflows sein
                        e.outgoing.forEach((competitor) => {
                          e.outgoing.forEach((value) => {
                            if (
                              value.targetRef.id !== competitor.targetRef.id
                            ) {
                              tasksObject[
                                competitor.targetRef.id
                              ].competitor.push(
                                tasksObject[value.targetRef.id].id
                              );
                            }
                          });
                          if (competitor.name) {
                            // Hier 0 wegen exlusiveGateway
                            tasksObject[
                              competitor.targetRef.id
                            ].decision = parseDecision(competitor.name, 0);
                          }
                        });
                      }
                    }
                    if (e.$type === "bpmn:InclusiveGateway") {
                      if (e.outgoing) {
                        //competitor sollten hier ausgehende Seqflows sein
                        e.outgoing.forEach((competitor) => {
                          e.outgoing.forEach((value) => {
                            if (
                              value.targetRef.id !== competitor.targetRef.id
                            ) {
                              tasksObject[
                                competitor.targetRef.id
                              ].competitor.push(
                                tasksObject[value.targetRef.id].id
                              );
                            }
                          });
                          if (competitor.name) {
                            // Hier 0 wegen exlusiveGateway
                            tasksObject[
                              competitor.targetRef.id
                            ].decision = parseDecision(competitor.name, 1);
                          }
                        });
                      }
                    }
                  }
                });
                for (let x = 0; x < Object.keys(tasksObject).length; x++) {
                  for (var e in tasksObject) {
                    if (x === tasksObject[e].id) {
                      tasksForContract[x] = tasksObject[e];
                    }
                  }
                }
                console.log("BPMN Model parsed");
                //we need to remove the exclusive tag after opening exlusive
                for (var i in tasksForContract) {
                  if (
                    tasksForContract[i].type === "bpmn:ExclusiveGateway" &&
                    tasksForContract[i].requirements.length == 1
                  ) {
                    tasksForContract[i].type = "bpmn:Task";
                  }
                }
              }
            });
          }
        });*/
};

module.exports = parseBPMNfile;