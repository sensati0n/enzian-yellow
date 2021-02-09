const _ = require('lodash');

class Requirements {

    constructor(obj) {
        this.obj = obj;
    }
    
    getRequirementNamesByTaskName(taskName) {
        return _.filter(this.obj, (elem) => {return elem.task.name === taskName })[0].requirements
            .map(elem => elem.name);
    }

    getGlobalIdByTaskName(taskName) {

    }

}

module.exports = Requirements;