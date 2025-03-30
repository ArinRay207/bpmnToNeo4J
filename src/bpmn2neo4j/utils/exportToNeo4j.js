/**
 * Takes the formatted BPMN data representing the LPG and stores it in Neo4j 
 * @param {object} formattedJson - formatted BPMN data 
 * @param {object} neo4jDriver - Neo4j driver to run queries 
 */
const exportToNeo4j = async (formattedJson, neo4jDriver) => {
    // Clear the existing database
    const deletingQuery = `MATCH (n) DETACH DELETE n`;

    try {
        const createNodeQueries = formattedJson.nodes?.map((node) => {
            let nodeProperties = `id: '${node.id}', name: '${node.name}'`;

            // Check if the node has an annotation property
            if (node.annotation) {
                // Add the annotation property
                nodeProperties += `, annotation: '${node.annotation}'`;
            }
            // check if there is a loopCharacteristics property like loop, parallel multiple instance marker, sequential multiple instance marker
            if (node.loopCharacteristics) {
                nodeProperties += `, marker: '${node.loopCharacteristics.$type.substring(5)}'`;
            }
            // check if there is a event definitions property like message, signal, error etc.
            if (node.eventDefinitions) {
                node.eventDefinitions.forEach(eventDefinition => {
                    nodeProperties += `, eventDef_type: '${eventDefinition.$type.substring(5)}'`;
                })
            }

            // Check if the node has a parent property - only valid in case of subprocesses
            if (node.parent) {
                if (node.parent.parentId)
                    nodeProperties += `, parent_id: '${node.parent.parentId}'`;
                if (node.parent.parentName)
                    nodeProperties += `, parent_name: '${node.parent.parentName}'`;
            }

            return `
                CREATE (n_${node.id}: ${node.$type} {
                ${nodeProperties}
                })
            `;
        });

        // Create relationships in Neo4j
        const createRelationshipQueries = formattedJson.relationships?.map(
            (relationship) => {
                const { source, target, $type, ...relationshipPropertiesObj } = relationship;
                var relationshipPropertiesString = '';
                Object.keys(relationshipPropertiesObj).forEach(key => {
                    relationshipPropertiesString += `${key}: '${relationshipPropertiesObj[key]}',`
                })
                relationshipPropertiesString = relationshipPropertiesString.slice(0, -1)
                return `
                    MATCH (sourceNode { id: '${relationship.source}' }),
                    (targetNode { id: '${relationship.target}' })
                    CREATE (sourceNode)-[:${relationship.$type} {${relationshipPropertiesString}}]->(targetNode)
                    RETURN sourceNode, targetNode
                `;
            }
        );
        const session = neo4jDriver.session();

        // Run the Cypher queries in a transaction
        const txc = session.beginTransaction();
        try {
            const queries = [
                deletingQuery,
                ...createNodeQueries,
                ...createRelationshipQueries,
            ];
            queries.forEach(async (query) => await txc.run(query));

            await txc.commit();
        } catch (error) {
            await txc.rollback();
        } finally {
            await session.close();
        }
    } catch (error) {
        console.error("Error converting BPMN to Neo4j:", error);
    }
}

export default exportToNeo4j;