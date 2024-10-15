const express = require("express");
const fs = require('fs');
const path = require('path');
const server = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;

const {ruleRouter} = require('./routers/ruleRouter');
const {settingsRouter} = require('./routers/settingsRouter');
const {logsRouter} = require('./routers/logsRouter');

server.get('/favicon.ico', (req, res) => res.status(204).end());
server.use(express.urlencoded({extended: true}));  // hundel post reqs with body
server.use(bodyParser.json());
server.use(cors());

server.use(express.json());
server.use(express.static(path.join(__dirname, 'frontend/build')));

server.use('/api-rule', ruleRouter);
server.use('/api-settings', settingsRouter);
server.use('/api-logs', logsRouter);

server.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

server.use((req, res) => {
    res.status(400).send('Something is broken!');
});
server.listen(port, () => console.log(`listening on port ${port}`));