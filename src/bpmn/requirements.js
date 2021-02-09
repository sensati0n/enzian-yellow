const _ = require('lodash');

class Requirements {

    constructor(obj) {
        this.obj = obj;
    }
    
    getRequirementsByTaskName(taskName) {
        return _.filter(this.obj,  ['task', taskName])[0].requirements;
        //return _.filter(this.obj, (elem) => {return elem.task.name === taskName })[0].requirements;
    }

    getGlobalIdByTaskName(taskName) {

    }

}

module.exports = Requirements;