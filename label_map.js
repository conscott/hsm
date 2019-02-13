var fs = require('fs');

var lblMap = {}
var data = fs.readFileSync('key_map.txt', 'utf8');
for (line of data.split('\n')) {
  let fields = line.split(' ');
  lblMap[fields[0]] = [fields[1], fields[2]];
}

exports.labelMap = lblMap;
