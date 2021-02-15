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
module.exports = { 
    BpmnGateway, NULL_ADDRESS
};