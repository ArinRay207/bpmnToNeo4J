import neo4j from 'neo4j-driver';

/**
 * 
 * @param {string} neo4jURL - the URL to connect to Neo4j Database
 * @param {string} neo4jUsername - Username
 * @param {string} neo4jPassword - Password
 * @returns {object} Driver to connect to Neo4j
 */
const createNeo4jDriver = (neo4jURL, neo4jUsername, neo4jPassword) => {
    const neo4jDriver = neo4j.driver(neo4jURL, neo4j.auth.basic(`${neo4jUsername}`, `${neo4jPassword}`));
    return neo4jDriver;
}

export default createNeo4jDriver;