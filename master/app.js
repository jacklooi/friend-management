const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
const api = require('./friend');

app.use(bodyParser.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/', api);

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});