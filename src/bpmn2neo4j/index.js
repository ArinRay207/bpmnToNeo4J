import createNeo4jDriver from "./utils/DBconnect.js";
import xmlToJson from "./utils/xmlToJson.js";
import formatter from './utils/formatter';
import exportToNeo4j from "./utils/exportToNeo4j.js";

/**
 * Separates BPMN data in XML format into Nodes and Relationships and stores the corresponding LPG in Neo4j
 * 
 * @param {string} bpmnXml - BPMN data in XML format 
 * @param {string} neo4jURL 
 * @param {string} neo4jUsername 
 * @param {string} neo4jPassword 
 * @returns {object} Formatted BPMN data as an LPG represented by 2 arrays: nodes and relationships
 */

const xmlToNeo4j = async (bpmnXml, neo4jURL, neo4jUsername, neo4jPassword) => {
  const debugMode = localStorage.getItem('debugMode');
  const showBpmnXml = localStorage.getItem('showBpmnXml');
  const showBpmnJson = localStorage.getItem('showBpmnJson');
  const showFormattedJson = localStorage.getItem('showFormattedJson');
  const showTimeTaken = localStorage.getItem('showTimeTaken');

  const startDateTime = Date.now();

  if (debugMode === 'true') {
    console.log('DEBUG MODE');
  }

  if (debugMode === 'true' || showBpmnXml === 'true') {
    console.log("BPMN XML");
    console.log(bpmnXml);
  }

  const bpmnJson = await xmlToJson(bpmnXml);

  if (debugMode === 'true' || showBpmnJson === 'true') {
    console.log("BPMN JSON");
    console.log(bpmnJson);
  }

  const formattedJson = formatter(bpmnJson);

  if (debugMode === 'true' || showFormattedJson === 'true') {
    console.log("FORMATTED JSON");
    console.log(formattedJson);
  }

  const neo4jDriver = createNeo4jDriver(neo4jURL, neo4jUsername, neo4jPassword);
  await exportToNeo4j(formattedJson, neo4jDriver);

  const endDateTime = Date.now();

  if (debugMode === 'true' || showTimeTaken === 'true') {
    console.log('Time Taken');
    console.log(endDateTime - startDateTime);
  }

  return formattedJson;
}

export default xmlToNeo4j;