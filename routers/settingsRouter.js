const settingsController = require('../controllers/settingsController');
const { Router } = require('express');
const settingsRouter = new Router();

// GET
settingsRouter.get('/settings', settingsController.getSettings);

// PUT
settingsRouter.put('/settings', settingsController.updateSettings);

module.exports = { settingsRouter };
