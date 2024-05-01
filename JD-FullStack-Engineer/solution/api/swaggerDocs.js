import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Joyn API',
      version: '1.0.0',
    },
  },
  apis: ['./index.js'],
};

const openapiSpecification = swaggerJsdoc(options);

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));
}

export {
    setupSwagger,
};
