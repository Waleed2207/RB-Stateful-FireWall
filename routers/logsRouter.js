const logsController = require('../controllers/logsController');
const { Router } = require('express');
const logsRouter = new Router();

// GET
logsRouter.get('/initial-logs', logsController.initialLogs);
logsRouter.get('/updated-logs', logsController.getUpdatedLogs);


// PUT
// git rm --cached rulebase-stateful-frontend

module.exports = { logsRouter };
