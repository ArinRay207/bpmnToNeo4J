# BpmnToNeo4J
## About
The tool provides a front end environment to draw or upload a bpmn diagram and converts it into a Labelled Property Graph stored in Neo4J database. The Graph can then be visualized in Neo4J Desktop. 

## Installation Guide
0. Prerequisites:\
   You need to have git, Node.js, npm and Neo4J installed. \
   Here are the links to their installation guides: \
   git: https://git-scm.com/downloads \
   Node.js: https://nodejs.org/en/download \
   npm: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm \
   Neo4J: https://neo4j.com/download/ 

2. Clone the repository:
   ```
   git clone https://github.com/ArinRay207/bpmnToNeo4J.git
   ``` 
3. Get into the main directory:
   ```
   cd bpmnToNeo4J
   ```
4. Install Dependencies:
   ```
   npm install
   ```
5. Configure environment variables:
   Create a '.env' file and fill your credentials:
   ```
   VITE_NEO4J_URL=<neo4j_url>
   VITE_NEO4J_USERNAME=<neo4j_username>
   VITE_NEO4J_PASSWORD=<neo4j_password>
   ```
6. Run the application:
   ```
   npm run dev
   ```
The application should run on port 5173 of your localhost by default.
