const _ = require('lodash');

class Requirements {

    constructor(obj) {
        this.obj = obj;
    }

    getRequirementsByTaskName(taskName) {
        return _.filter(this.obj,  ['task', taskName])[0].requirements;
    }


}

module.exports = Requirements;