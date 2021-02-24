const BpmnGateway = {

    AND: {
        id: 1,
        type: 'AND',
        bpmn: 'bpmn:ParallelGateway'
    },

    OR: {
        id: 2,
        
        type: 'OR',
        bpmn: 'bpmn:InclusiveGateway'
    },

    XOR: {
        id: 3,
        type: 'XOR',
        bpmn: 'bpmn:ExclusiveGateway'
    }
}

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const DECISION_LIBRARY_ROPSTEN = '0x94dF2208241fbF4c352F004287fAb147125E995a';
module.exports = { 
    BpmnGateway,
    NULL_ADDRESS,
    DECISION_LIBRARY_ROPSTEN
};