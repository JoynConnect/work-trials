### 🚀 Work Trial Requirements for Full Stack Developer

#### 🧹 Task 1: Prototype for Data Cleaning and Contextual Analysis

**Here’s what to do:**

- Whip up a Python script to simulate extracting, cleaning, and performing a basic contextual analysis of provided sample data (see `dataGen` folder)
- The Python script should watch for changes in src data and run through the extractin and cleaning if new data is loaded
- Ensure your script includes robust error handling and data validation.

**What to Turn In:**

- 💻🐍 Python code with clear comments.
- 📃 A README that guides us through your script operations and the flow of data.

#### 🛠️ Task 2: Design a Light Data Pipeline and API

**Objective:**

- Using Node.js, create a REST API that exposes the cleaned and analyzed data from Task 1. This API will serve as the backend for a frontend dashboard created in Task 3.
- Focus on developing an API that is scalable, secure, and efficiently serves data to client-side applications.

**What to Turn In:**

- **Architecture Diagram:** Illustrate how data flows from the source through your pipeline to the API.
- **Code and Documentation:** Provide the source code for REST API, accompanied by documentation outlining the setup, endpoints (swagger), and data schema.

#### 🔧 Task 3: Build a Simple React Dashboard

**Objective:**

- Create a basic dashboard using React and TypeScript that consumes the API developed in Task 2. The dashboard should dynamically display the cleaned and analyzed data.
- Utilize Tailwind CSS for styling and either WebSockets or polling to retrieve data from the API.

**What to Turn In:**

- **React Application Code:** Source code for the dashboard, including state management and API consumption logic.
- **UI Design Documentation:** A document or README file explaining the component structure, data handling, and user interaction flow.

#### 🌐 Task 4: Basic DevOps Setup

**Objective:**

- Set up a basic AWS environment that hosts the Data Cleaning and Contextual Analysis and the REST API using Terraform for infrastructure as code.
- Make a GH Action for publishing the React app to an AWS S3 bucket

**What to Turn In:**

- **Infrastructure Code:** Terraform scripts used to deploy the necessary AWS resources.
- **GH Action yaml:** a GH Action for publishing the React app to an AWS S3 bucket.
- **Deployment Documentation:** A guide on how to deploy and maintain the application using the provided Terraform scripts.

### 📊 Evaluation Criteria

- **Technical proficiency:** Efficiency and effectiveness in building and integrating systems.
- **Innovation and practical application:** Creativity in API design and UI implementation.
- **Documentation and clarity:** Quality of written materials and code comments.
- **Adaptability to new technologies:** Ability to use Python, TypeScript and React proficiently.
