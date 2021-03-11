const express = require('express');
const app = express();

app.get('/', (req, res) => {
  console.log('Trigger_func received a request.');

  const target = process.env.TARGET || 'World';
  res.send(`${target}!\n`);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Trigger_func listening on port', port);
});
