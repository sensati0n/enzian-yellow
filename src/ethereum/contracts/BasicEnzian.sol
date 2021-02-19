pragma solidity 0.8.0;


import "./DecisionLibrary.sol";

contract BasicEnzian {

// CONTROL-FLOW PERSPECTIVE

    enum GatewayType {NONE, AND, OR, XOR}

    struct Task {
        string activity;
        address taskresource;
        bool completed;
        GatewayType preceedingMergingGateway;
        uint[] requirements;
        uint[] competitors;
        Decision decision;
    }
    
    // The global Task.ID is mapped to the Task
    mapping(uint => Task) tasks;
    //Event for a Task completion.
    //[FRONTEND] can not read the return value of a function, but events.
    event TaskCompleted(bool indexed success);

    event Test(uint indexed anumber);


// ORGANISATIONAL PERSPECTIVE


// INFORMATIONAL PERSPECTIVE
    
    enum DecisionType{STRINGDESC,INTDESC,TIMEDESC}

   struct Decision{
        uint endBoss;
        GatewayType gatewaytype;
        DecisionType type_;
        bool completed;
        bool exists;        
        DecisionLibrary.Operator operator;
        string processVariable;
        string s_value;
        int[] i_value;
    }

    
    // RENAME: PROCESS VARIABLES
    //string[] public string_processVariables;
    //string[] public integer_processVariables;
    mapping(string => int) public integer_processVariables;
    mapping(string => string) public string_processVariables;

    mapping(uint => bool) public enabled;
    
// EVENT-LOGS

    //The EventLog stores the global Task.IDs
    uint[] public theRealEventLog;
    function getLog() public view returns(uint[] memory theevents) {
        return theRealEventLog;
    }

    // [DEBUGGING] A EventLog containing the Activity-Names of Tasks instead of global IDs
    string[] public debugStringeventLog;
    function getDebugStringeventLog() public view returns(string[] memory theevents) {
        return debugStringeventLog;
    }

// -------------------------------
// FUNCTIONALITY
// -------------------------------

    /*
    * @Param: Creates a Task
    *
    */
    function createTask(
        uint _id,
        string memory _activity,
        address _taskresource,
        GatewayType _pmg,
        uint[] memory _requirements,
        uint[] memory _competitors
        ) public {
                                
        Task memory myStruct;
        myStruct.activity = _activity;
        myStruct.taskresource = _taskresource;
        myStruct.completed = false;
        myStruct.preceedingMergingGateway = _pmg;
        myStruct.requirements = _requirements;
        myStruct.competitors = _competitors;
        tasks[_id] = (myStruct);
    }
    
    
     function createTaskWithDecision(
        uint _id,
        string memory _activity,
        address _taskresource,
        GatewayType _pmg,
        uint[] memory _requirements,
        uint[] memory _competitors,
        Decision memory _decision
        ) public {

        if(_decision.type_ == DecisionType.STRINGDESC) {
            string_processVariables[_decision.processVariable] = "";
        } else if(_decision.type_ == DecisionType.INTDESC) {
            integer_processVariables[_decision.processVariable] = 0;
        }

        createTask(_id, _activity, _taskresource, _pmg, _requirements, _competitors);
       // emit Test(100 + _decision.endBoss);


        Decision memory myStruct;
        myStruct.endBoss = _decision.endBoss;
        myStruct.gatewaytype = _decision.gatewaytype;
        myStruct.type_ = _decision.type_;
        myStruct.completed = _decision.completed;
        myStruct.exists = _decision.exists;
        myStruct.operator = _decision.operator;
        myStruct.processVariable = _decision.processVariable;
        myStruct.s_value = _decision.s_value;
        myStruct.i_value = _decision.i_value ;


        tasks[_id].decision = (myStruct);
       // emit Test(200 + tasks[_id].decision.endBoss);


    }

    function getTaskDecisionEndBoss(uint taskid) public view returns (uint theboss) {
        return tasks[taskid].decision.endBoss;
    }
    
    function updateIntProcessVariable(string calldata variableName, int newValue) public {
        integer_processVariables[variableName] = newValue;
    }
    
    function updateStringProcessVariable(string calldata variableName, string calldata newValue) public {
        string_processVariables[variableName] = newValue;
    }

    function getIntProcessVariableValue(string calldata variableName) public view returns (int thevalue) {
        return integer_processVariables[variableName];
    }


    /*
    * @Param: sets a Task on completed if resource equal to taskresource
    */
    function completing(uint taskId) public returns (bool success){

        require(!tasks[taskId].completed, "DO NOT REPEAT TASKS!!!");

    uint endBoss = 0;
    Task memory thetask = tasks[taskId];
    // ORGANISATIONAL PERSPECTIVE
        
        address resource = tasks[taskId].taskresource;
        require(resource == address(0) || resource == msg.sender, tasks[taskId].activity);

    // INFORMATIONAL PERSPECTIVE
        
        // evaluate Decision

        if(tasks[taskId].decision.exists) {
            endBoss = tasks[taskId].decision.endBoss;
            bool result = evaluateDecision(tasks[taskId].decision);
            require(result, 'Process Variable is not correct.');
        }
        
    // CONTROL-FLOW PERSPECTIVE
    
        uint[] memory requiredTasksIds = tasks[taskId].requirements;
        if (requiredTasksIds.length == 0) {

            success = true;
        }
        else {

            GatewayType gateway = tasks[taskId].preceedingMergingGateway;
            
            if (gateway == GatewayType.NONE) {
                if (isTaskCompletedById(requiredTasksIds[0]) == true) {
                    success = true;
                }
            }
            else {

                uint fulfilledRequirements;
                // HOW MANY REQUIREMENTS ARE FULFILLED?
               for (uint i = 0; i < requiredTasksIds.length; i++) {
                    if (isTaskCompletedById(requiredTasksIds[i]) == true) {
                        fulfilledRequirements++;
                    }
                }
                
                if(gateway == GatewayType.AND) {
                  
                  // alle müssen erfüllt sein
                    if (fulfilledRequirements == requiredTasksIds.length) {
                       success = true;
                    }
                    
                }
                else {
                    // enabled müssen erfüllt sein
                    // enabled ist,
                    //  decision stores
                    
                    if(gateway == GatewayType.OR) {
                    // F
                    // if forAll enabledFor(F) are executed OK
    
                        success = true;
                    }
                    else if(gateway == GatewayType.XOR) {

                       for (uint i = 0; i < requiredTasksIds.length; i++) {

                            // requirements of tasks following a merging gateway:
                            // tasks following an split gateway must store the end boss and set the required flag to true;
                            // NO! better: gateway (give it not--> ) decision stores end boss   
                            if (enabled[requiredTasksIds[i]]) {
                                emit Test(taskId);
                                emit Test(requiredTasksIds[i]);
                                success = isTaskCompletedById(requiredTasksIds[i]);
                            }
                        }
 
                    }
                    
                } // END ELSE GATEWAY DECISION
            } // END ELSE GATEWAY
        }
        
        if(success) {
            if(tasks[taskId].decision.exists) {
                enabled[endBoss] = true;

                emit Test(1100);
                emit Test(thetask.competitors.length);

                //LOCKING
                for (uint i = 0; i < thetask.competitors.length; i++) {
                    emit Test(i);
                    emit Test(thetask.competitors[i]);

                    tasks[(thetask.competitors[i])].completed = true;
                }       

            }

            debugStringeventLog.push(thetask.activity);    
            tasks[taskId].completed = true;
            theRealEventLog.push(taskId);
            emit TaskCompleted(true);
        }
        else {
            emit TaskCompleted(false);
        }
        
        return success;
        
    }
    
    function evaluateTest(int i1, int[] memory i2, DecisionLibrary.Operator op) public pure returns (bool equality) {
        return DecisionLibrary.evaluate(i1, i2, op);
    }

    function evaluateDecision(Decision memory _decision) public view returns (bool success){
        if(_decision.type_ == DecisionType.STRINGDESC){
            string memory valueOfProcessVariable = string_processVariables[_decision.processVariable];
            return DecisionLibrary.evaluate(valueOfProcessVariable, _decision.s_value, _decision.operator);
        }
        else if(_decision.type_ == DecisionType.INTDESC){
            int valueOfProcessVariable = integer_processVariables[_decision.processVariable];
            return DecisionLibrary.evaluate(valueOfProcessVariable, _decision.i_value, _decision.operator);
        }
    }    
    
    
// -------------------------------
// GETTER
// -------------------------------


    /*
    * @param: ID of a Task
    * @returns: bool value if task is completed
    */
    function isTaskCompletedById(uint _id) public view returns (bool success){
          return (tasks[_id].completed);
    }

    /*
    * @param: Id of a State
    * @returns: status and description of the Task
    */
    function getTaskById(uint _id) public view returns (bool status,
        string memory description, address taskresource, GatewayType gateway,
        uint[] memory requirements, uint[] memory competitors){
        return (tasks[_id].completed, tasks[_id].activity, tasks[_id].taskresource,
         tasks[_id].preceedingMergingGateway, tasks[_id].requirements, tasks[_id].competitors);
    }

    function decisionTest() public pure returns(uint drei) {
        uint zwo = DecisionLibrary.returnZwo();
        return zwo+5;

    }

}

