pragma solidity 0.8.0;

contract BasicEnzian {

    enum Tasktype {TASK, AND, OR, XOR}

    struct Task {
        string activity;
        address taskresource;
        bool completed;
        Tasktype tasktype;
        uint[] requirements;
        uint[] competitors;
    }
    
    // The global Task.ID is mapped to the Task
    mapping(uint => Task) tasks;

    //Event for a Task completion.
    //[FRONTEND] can not read the return value of a function, but events.
    event TaskCompleted(bool indexed success);
    
    /*
    *
        EVENT LOGS
    *
    */
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


    /*
    * @Param: Creates a Task
    *
    */
    function createTask(
        uint _id,
        string memory _activity,
        address _taskresource,
        Tasktype _tasktype,
        uint[] memory _requirements,
        uint[] memory _competitors) public {
                                
        Task memory myStruct = Task (_activity, _taskresource, false, _tasktype, _requirements, _competitors);
        tasks[_id] = (myStruct);
    }
    
        function createTask(
        uint _id,
        string memory _activity,
        Tasktype _tasktype,
        uint[] memory _requirements,
        uint[] memory _competitors) public {
                                
        Task memory myStruct = Task (_activity, address(0), false, _tasktype, _requirements, _competitors);
        tasks[_id] = (myStruct);
    }

    
    /*
    * @Param: sets a Task on completed if resource equal to taskresource
    */
    function completing(uint taskId) public returns (bool success){
        
        // uint tempcount;
        address resource = tasks[taskId].taskresource;
        require(resource == address(0) || resource == msg.sender, tasks[taskId].activity);


        uint[] memory temprequire = tasks[taskId].requirements;
        if (temprequire.length == 0) {
            success = true;
        }
        else {
            //TASK
            if (tasks[taskId].tasktype == Tasktype.TASK) {
                if (isTaskCompletedById(temprequire[0]) == true) {
                    success = true;
                }
            }
        }
        
     

        if(success) {
            tasks[taskId].completed = true;
            theRealEventLog.push(taskId);
            debugStringeventLog.push(tasks[taskId].activity);
            emit TaskCompleted(true);
        }
        else {
            emit TaskCompleted(false);
        }
        
        return success;
        
    }

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
        string memory description, address taskresource, Tasktype tasktype,
        uint[] memory requirements, uint[] memory competitors){
        return (tasks[_id].completed, tasks[_id].activity, tasks[_id].taskresource,
         tasks[_id].tasktype, tasks[_id].requirements, tasks[_id].competitors);
    }

}