const BpmnModdleProd = require('bpmn-moddle').default;
const BpmnModdleDev = require('bpmn-moddle');

module.exports = BpmnModdleProd

if (process.env.NODE_ENV === "enzian-development") {
   module.exports = BpmnModdleDev
  } else {
   module.exports = BpmnModdleProd
  }