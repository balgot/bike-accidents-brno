const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.options('*', cors());

app.use(express.static('public'));
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
