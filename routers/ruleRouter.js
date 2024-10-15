const ruleController = require('../controllers/ruleController');
const { Router } = require("express");
const ruleRouter = new Router();

// GET
ruleRouter.get('/rule', ruleController.getRules);

// POST
ruleRouter.post('/rule', ruleController.addOrUpdateIp);

// DELETE
ruleRouter.delete('/rule/:id', ruleController.deleteRule);

module.exports = { ruleRouter };
