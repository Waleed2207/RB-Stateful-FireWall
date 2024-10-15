const fs = require('fs');
const path = require('path');

// Path to the JSON file
const rulesFilePath = path.join(__dirname, '../db/rules.json');

// Helper function to read rules from the file
const readRulesFromFile = () => {
  try {
    const data = fs.readFileSync(rulesFilePath, 'utf8');
    const rules = JSON.parse(data);
    return Array.isArray(rules) ? rules : [];
  } catch (error) {
    return []; // Return an empty array if file doesn't exist or is empty
  }
};

// Helper function to write rules to the file
const writeRulesToFile = (rules) => {
  fs.writeFileSync(rulesFilePath, JSON.stringify(rules, null, 2));
};

// Function to generate a random number for the ID
const generateRandomId = () => {
  return Math.floor(Math.random() * 1000000).toString();
};

// Controller functions
const getRules = (req, res) => {
  const rules = readRulesFromFile();
  res.json(rules);
};

// Function to validate the rate limit
const isValidRateLimit = (rate_limit) => {
  // Check if rate_limit is an integer and greater than or equal to 0
  return Number.isInteger(rate_limit) && rate_limit >= 0;
};

const isValidLimitWindow = (limit_window) => {
  // Check if rate_limit is an integer and greater than or equal to 0
  return Number.isInteger(limit_window) && limit_window >= 0;
};

const addOrUpdateIp = (req, res) => {
  const {
    source_ip,
    destination_ip,
    source_port,
    destination_port,
    protocol,
    state,
    action,
    log_action,
    rate_limit: rateLimitStr,
    limit_window: limitWindow,
    id
  } = req.body;

  // Convert rate limit to integer
  const rate_limit = parseInt(rateLimitStr, 10);
  const limit_window = parseInt(limitWindow,10);
  // Helper functions to validate fields
  const isValidIpOrAny = (ip) => ip === 'any' || /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
  const isValidPortOrAny = (port) => port === 'any' || /^\d+$/.test(port);
  const isValidProtocol = (proto) => ['ARP', 'TCP', 'ICMP'].includes(proto);
  const validStates = [
    'SYN_SENT', 'SYN_RECEIVED', 'ESTABLISHED', 'FIN_WAIT', 'CLOSED',
    'ICMP echo', 'ICMP reply wait', 'ARP request', 'ARP reply', 'any'
  ];
  const isValidState = (st) => validStates.includes(st);
  const isValidAction = (act) => ['allow', 'deny'].includes(act);

  // Validate required fields
  if (!source_ip || !destination_ip || !source_port || !destination_port || !protocol || !state || !action || rate_limit === undefined || limit_window === undefined) {
    return res.status(400).json({ error: 'Missing required rule fields' });
  }

  // Validate field values
  if (!isValidIpOrAny(source_ip) || !isValidIpOrAny(destination_ip)) {
    return res.status(400).json({ error: 'Invalid IP address' });
  }

  if (!isValidPortOrAny(source_port) || !isValidPortOrAny(destination_port)) {
    return res.status(400).json({ error: 'Invalid port' });
  }

  if (!isValidProtocol(protocol)) {
    return res.status(400).json({ error: 'Invalid protocol' });
  }

  if (!isValidState(state)) {
    return res.status(400).json({ error: 'Invalid state' });
  }

  if (!isValidAction(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  if (typeof log_action !== 'boolean') {
    return res.status(400).json({ error: 'Invalid log_action' });
  }

  if (!isValidRateLimit(rate_limit)) {
    return res.status(400).json({ error: 'Invalid rate limit. It should be an integer greater than or equal to 0.' });
  }
  if (!isValidLimitWindow(limit_window)) {
    return res.status(400).json({ error: 'Invalid rate limit. It should be an integer greater than or equal to 0.' });
  }

  const rules = readRulesFromFile();
  let rule;

  if (id) {
    const existingRuleIndex = rules.findIndex(rule => rule.id === id);

    if (existingRuleIndex >= 0) {
      rules[existingRuleIndex] = {
        id,
        source_ip,
        destination_ip,
        source_port,
        destination_port,
        protocol,
        state,
        action,
        log_action,
        rate_limit,
        limit_window
      };
      rule = rules[existingRuleIndex];
    } else {
      return res.status(404).json({ error: 'Rule not found' });
    }
  } else {
    rule = {
      source_ip,
      destination_ip,
      source_port,
      destination_port,
      protocol,
      state,
      action,
      log_action,
      rate_limit,
      limit_window,
      id: generateRandomId()
    };
    rules.push(rule);
  }

  writeRulesToFile(rules);
  res.json({ message: 'Rule added/updated successfully', rule });
};

const deleteRule = (req, res) => {
  const { id } = req.params;
  const rules = readRulesFromFile();
  const newRules = rules.filter(rule => rule.id !== id);

  if (newRules.length === rules.length) {
    return res.status(404).json({ error: 'Rule not found' });
  }

  writeRulesToFile(newRules);
  res.json({ message: 'Rule deleted successfully' });
};

module.exports = {
  getRules,
  addOrUpdateIp,
  deleteRule,
};
