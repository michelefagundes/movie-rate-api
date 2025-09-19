
const express = require('express');
const app = express();
app.use(express.json());

const userController = require('./controllers/userController');
const mediaController = require('./controllers/mediaController');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger/swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/users', userController);
app.use('/', mediaController);

app.get('/', (req, res) => {
  res.send('Media Rate API is running');
});

module.exports = app;
