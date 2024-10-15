const fs = require('fs');
const path = require('path');

// Path to the JSON file
const logsFilePath = path.join(__dirname, '../logs/Logs.json');

// Cache to store the last known state of the logs
let lastLogsState = null;

// Function to read and send logs
const sendLogs = (res) => {
  fs.readFile(logsFilePath, null, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading logs file' });
    }

    try {
      const logs = JSON.parse(data.toString('utf8'));
      res.json(logs);
      lastLogsState = data.toString('utf8');
    } catch (parseErr) {
      return res.status(500).json({ error: 'Error parsing logs file' });
    }
  });
};

// Initial logs endpoint
const initialLogs = (req, res) => {
  sendLogs(res);
};

// Endpoint to get updated logs if any changes have been made
const getUpdatedLogs = (req, res) => {
  fs.readFile(logsFilePath, null, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading logs file' });
    }

    try {
      const dataStr = data.toString('utf8');
      if (dataStr !== lastLogsState) {
        const logs = JSON.parse(dataStr);
        res.json(logs);
        lastLogsState = dataStr;
      } else {
        res.status(204).send(); // No content, logs haven't changed
      }
    } catch (parseErr) {
      return res.status(500).json({ error: 'Error parsing logs file' });
    }
  });
};

// Watch for changes to the logs file
fs.watchFile(logsFilePath, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    lastLogsState = null; // Reset cache to force re-read on next request
  }
});

module.exports = {
  initialLogs,
  getUpdatedLogs
};
