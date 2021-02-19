const GatewayType = {

    NONE: { id: 0 },
    AND: { id: 1},
    OR: { id: 2 },
    XOR: { id: 3}
}

const DecisionType = {
    STRINGDESC: { id: 0 },
    INTDESC: { id: 1}
}

const Operator = {
    LESS: { id: 0, symbol: '<' },
    GREATER: { id: 1, symbol: '>' },
    EQUAL: { id: 2, symbol: '=' },
    NEQ: { id: 3, symbol: '!=' },
    LEQ: { id: 4, symbol: '<=' },
    GEQ: { id: 5, symbol: '>='},
    ELEMENT: { id: 6, symbol: 'in' }
}

const operatorBySymbol = (symbol) => {

    switch(symbol) {
        case '<': return Operator.LESS; break;
        case '>': return Operator.GREATER; break;
        case '==': return Operator.EQUAL; break;
        case '!=': return Operator.NEQ; break;
        case '<=': return Operator.LEQ; break;
        case '>=': return Operator.GEQ; break;
        case 'in': return Operator.ELEMENT; break;
    }
}

module.exports = { 
    GatewayType, DecisionType, Operator, operatorBySymbol
};
