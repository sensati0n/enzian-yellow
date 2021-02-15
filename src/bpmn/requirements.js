const _ = require('lodash');

class Requirements {

    constructor(obj) {
        this.obj = obj;
    }
    
    getRequirementNamesByTaskName(taskName) {
        return _.filter(this.obj, (elem) => {return elem.task.name === taskName })[0].requirements
            .map(elem => elem.name);
    }

    getResourceByTaskName(taskName) {
        return _.filter(this.obj, (elem) => {return elem.task.name === taskName })[0].resource;
    }

    getDecisionsByTaskName(taskName) {
        return _.filter(this.obj, (elem) => {return elem.task.name === taskName })[0].decisions;
    }

    idByName(taskName) {
        return _.filter(this.obj, (elem) => {return elem.task.name === taskName })[0].task.id;
    }

}

module.exports = Requirements;