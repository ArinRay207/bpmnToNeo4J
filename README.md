## Installation Guide
0. Prerequisites:
   You need to have git, Node.js, npm and Neo4J installed

1. Clone the repository:
   ```
   git clone https://github.com/ArinRay207/bpmnToNeo4J.git
   ``` 
2. Get into the main directory:
   ```
   cd bpmnToNeo4J
   ```
3. Install Dependencies:
   ```
   npm install
   ```
4. Configure environment variables:
   Create a '.env' file and fill your credentials:
   ```
   VITE_NEO4J_URL=<neo4j_url>
   VITE_NEO4J_USERNAME=<neo4j_username>
   VITE_NEO4J_PASSWORD=<neo4j_password>
   ```
5. Run the application:
   ```
   npm run dev
   ```
The application should run on port 5173 of your localhost by default.
