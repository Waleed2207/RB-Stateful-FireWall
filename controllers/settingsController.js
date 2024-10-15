const fs = require('fs');
const path = require('path');

// Path to the JSON file
const rulesFilePath = path.join(__dirname, '../settings/Settings.json');

// Get settings function
const getSettings = (req, res) => {
  fs.readFile(rulesFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading settings file' });
    }

    try {
      const settings = JSON.parse(data);
      res.json(settings);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Error parsing settings file' });
    }
  });
};

// Update settings function
const updateSettings = (req, res) => {
  const newSettings = req.body;

  fs.readFile(rulesFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading settings file' });
    }

    let currentSettings;
    try {
      currentSettings = JSON.parse(data);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Error parsing settings file' });
    }

    // Parse the values to integers
    const parsedSettings = Object.keys(newSettings).reduce((acc, key) => {
      acc[key] = parseInt(newSettings[key], 10);
      return acc;
    }, {});

    const updatedSettings = {
      ...currentSettings,
      ...parsedSettings
    };

    fs.writeFile(rulesFilePath, JSON.stringify(updatedSettings, null, 4), 'utf8', (writeErr) => {
      if (writeErr) {
        return res.status(500).json({ error: 'Error writing to settings file' });
      }

      res.json(updatedSettings);
    });
  });
};

module.exports = {
  getSettings,
  updateSettings
};
