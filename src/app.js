
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const { medias } = require('./model/mediaModel');
const app = express();
app.use(express.json());

const userController = require('./controllers/userController');
const mediaController = require('./controllers/mediaController');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/users', userController);
app.use('/', mediaController);

// GraphQL setup
const schema = buildSchema(`
  type Media {
    id: ID!
    title: String!
    description: String
    genre: String
    releaseDate: String
    type: String
  }
  type Query {
    medias: [Media]
  }
`);

const root = {
  medias: () => medias,
};

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
}));

app.get('/', (req, res) => {
  res.send('Media Rate API is running');
});

module.exports = app;
