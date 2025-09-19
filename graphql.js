const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mediaModel = require('./src/model/mediaModel');

const schema = buildSchema(`
  type Media {
    id: ID!
    title: String!
    description: String
  }
  type Query {
    medias: [Media]
  }
`);

const root = {
  medias: () => mediaModel.getAllMedia(),
};

const app = express();
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
}));

module.exports = app;
