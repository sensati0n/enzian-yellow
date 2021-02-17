const GatewayType = {

    NONE: { id: 0 },
    AND: { id: 1},
    OR: { id: 2 },
    XOR: { id: 3}
}

const DecisionType = {
    STRINGDESC: { id: 0},
    INTDESC: { id: 1}
}

const Operator = {
    LESS: { id: 0 },
    GREATER: { id: 1 },
    EQUAL: { id: 2 },
    NEQ: { id: 3 },
    LEQ: { id: 4 },
    GEQ: { id: 5 },
    ELEMENT: { id: 6 }
}

module.exports = { 
    GatewayType, DecisionType, Operator
};
