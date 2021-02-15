pragma solidity 0.8.0;

library DecisionLibrary{

    function returnZwo() public pure returns(uint zwo) {
        return 7;
    }
/*
    function evaluate(string memory _firststring,BasicEnzian.Operator _op,string memory _secondstring) public pure returns (bool){
        if(_op == BasicEnzian.Operator.EQUAL){
            // Required way to string compare
            if(keccak256(abi.encodePacked(_firststring)) == keccak256(abi.encodePacked(_secondstring))){
                return true;
            }
            else return false;
        }
        else if(_op != BasicEnzian.Operator.NEQ){
            if(keccak256(abi.encodePacked(_firststring)) != keccak256(abi.encodePacked(_secondstring))){
                return true;
            }
            else return false;
        }
        else return false;
    }
    // Evaluates a decision based on int
    function evaluate(uint _firstint, BasicEnzian.Operator _op, uint[] memory _secondint)
        public pure returns(bool status){
        // a < b
        if(_op == BasicEnzian.Operator.LESS){

            if(_firstint < _secondint[0]){
                return true;
            }
            else return false;
        }

        // a > b
        if(_op == BasicEnzian.Operator.GREATER){

            if(_firstint > _secondint[0]){
                return true;
            }
            else return false;
        }

        // a = b
        if(_op == BasicEnzian.Operator.EQUAL){

            if(_firstint == _secondint[0]){
                return true;
            }
            else return false;
        }

        // a <= b
        if(_op == BasicEnzian.Operator.LEQ){
            if(_firstint <= _secondint[0]){
                return true;
            }
            else return false;
        }

        // a >= b
        if(_op == BasicEnzian.Operator.GEQ){

            if(_firstint >= _secondint[0]){
                return true;
            }
            else return false;
        }
        
        if(_op == BasicEnzian.Operator.ELEMENT){
            for (uint elementid = 0; elementid < _secondint.length ; elementid++){
                if (_firstint == _secondint[elementid]){
                    return true;
                }
            }           
        }
        return false;
    }
    */
}

