var eu = require('ethereumjs-util')
var fs = require('fs');
exports.labelMap = JSON.parse(fs.readFileSync('accounts.json', 'utf8'));
