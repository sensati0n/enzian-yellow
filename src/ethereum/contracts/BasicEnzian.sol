pragma solidity 0.8.0;

contract BasicEnzian {

    enum Tasktype {TASK, AND, OR, XOR}

    struct Task {
        bool completed;
        string activity;
        Tasktype tasktype;
        uint[] requirements;
        uint[] competitors;
    }
    
    uint globalTaskId = 0;

    mapping(uint => Task) tasks;
    uint[] public tasksArray;



    /*
    * @Param: Creates a Task
    *
    */
    function createTask(string memory _activity, 
                            Tasktype _tasktype,
                            uint[] memory _requirements,
                            uint[] memory _competitors) public {
                                
        Task memory myStruct = Task (false, _activity, _tasktype, _requirements, _competitors);
        tasks[globalTaskId] = (myStruct);
        globalTaskId++;
        
    }


    function getTasks()  public view returns (uint[] memory){
        return tasksArray;
    }


    /*
    * @Param: sets a Task on completed if resource equal to taskresource
    */
    function setTaskOnCompleted(uint _id) public returns (bool success){
        uint tempcount;
        //require(tasks[_id].taskresource == msg.sender, "Not the right resource");

        // if task is already completed return true
        if (tasks[_id].completed == true) {
            return true;
        }
        uint[] memory temprequire = tasks[_id].requirements;
        if (temprequire.length == 0) {
            tasks[_id].completed = true;
            return true;
        }
        //TASK
        if (tasks[_id].tasktype == Tasktype.TASK) {
            if (isTaskCompletedById(temprequire[0]) == true) {
                
                    tasks[_id].completed = true;
                    return true;
            }
            else {
                return false;
            }
        }

        // ---------- GATES ----------
        // AND
        if (tasks[_id].tasktype == Tasktype.AND) {
            for (uint i = 0; i < temprequire.length; i++) {
                if (isTaskCompletedById(temprequire[i]) == true) {
                    tempcount++;
                }
            }
            if (tempcount == temprequire.length) {
                tasks[_id].completed = true;
                return true;
            }
            else {
                return false;

            }
        }
        // atleast 1
        if (tasks[_id].tasktype == Tasktype.OR) {
            for (uint j = 0; j < temprequire.length; j++) {
                if (isTaskCompletedById(temprequire[j]) == true) {
                    tempcount++;
                }
            }
            if (tempcount > 0) {
                tasks[_id].completed = true;
                return true;
            }
            else {
                return false;
            }
        }
        // exactly 1
        if (tasks[_id].tasktype == Tasktype.XOR) {
            for (uint k = 0; k < temprequire.length; k++) {
                if (isTaskCompletedById(temprequire[k]) == true) {
                    tempcount++;
                }
            }
            if (tempcount == 1) {
                tasks[_id].completed = true;
                return true;
            }
            else {
                return false;
            }
        }
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
    function getTaskById(uint _id) public view
        returns (
            bool status,
            string memory description,
            Tasktype tasktype,
            uint[] memory requirements,
            uint[] memory competitors
        ) {
        return (
            tasks[_id].completed,
            tasks[_id].activity,
            tasks[_id].tasktype,
            tasks[_id].requirements,
            tasks[_id].competitors);
    }

    /*
    * @param: Id
    * @returns: description of a task
    */
    function getTaskActivityById(uint _id) public view returns (string memory){
        return (tasks[_id].activity);
    }

    /*
    * @param: Id
    * @returns: description of a task
    */
    function getTaskRequirementsById(uint _id) public view returns (uint[] memory) {
        return (tasks[_id].requirements);
    }

}