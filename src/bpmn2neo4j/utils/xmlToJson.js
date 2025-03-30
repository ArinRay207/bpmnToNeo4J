import BpmnModdle from 'bpmn-moddle';

/**
 * Converts the BPMN data from XML string to JSON object
 * @param {string} bpmnXml BPMN data in XML format
 * @returns {object} BPMN data in JSON format
 */
const xmlToJson = async (bpmnXml) => {
    const moddle = new BpmnModdle();
    const bpmnJson = await moddle.fromXML(bpmnXml);

    return bpmnJson;
}

export default xmlToJson;