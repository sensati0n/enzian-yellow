pragma solidity 0.8.0;

library DecisionLibrary{

    enum Operator{LESS,GREATER,EQUAL,NEQ,LEQ,GEQ,ELEMENT}

    function evaluate(string memory s1, string memory s2, Operator _op) public pure returns (bool isEqual) {
        bool equals = keccak256(bytes(s1)) == keccak256(bytes(s2));
        return _op == Operator.EQUAL? equals : !equals; 
    }

    // Evaluates a decision based on int
    function evaluate(uint i1, uint[] memory i2, Operator _op) public pure returns (bool isEqual) {
        
        // a < b
        if(_op == Operator.LESS) return i1 < i2[0];
        // a > b
        if(_op == Operator.GREATER)  return i1 > i2[0];
        // a = b
        if(_op == Operator.EQUAL) return i1 == i2[0];
        // a <= b
        if(_op == Operator.LEQ) return i1 <= i2[0];
        // a >= b
        if(_op == Operator.GEQ) return i1 >= i2[0];
        // e
        
        if(_op == Operator.ELEMENT){
            for (uint elementid = 0; elementid < i2.length ; elementid++){
                if (i1 == i2[elementid]){
                    return true;
                }
            }           
        }
        return false;
    }
    
    function returnZwo() public pure returns(uint zwo) {
        return 7;
    }
}

