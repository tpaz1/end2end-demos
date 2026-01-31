const express = require('express');
const morgan = require('morgan');

const app = express();
const PORT = 5000;
const LOGO = '📜';
const NAME = 'JavaScript';

app.use(morgan('combined'));

app.get('/plusone/:number', (req, res) => {
  const number = parseInt(req.params.number, 10);
  if (Number.isNaN(number)) {
    return res.status(400).send('invalid number');
  }
  const result = number + 1;
  res.set('Content-Type', 'text/plain; charset=utf-8').send(`${LOGO}${NAME} - ${result} - ${NAME}${LOGO}`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
