var eu = require('ethereumjs-util')
var fs = require('fs');

var lblMap = {}
var data = fs.readFileSync('key_map.txt', 'utf8');
for (line of data.split('\n')) {
    if (line !== "") {
        let fields = line.split(' ');
        let id = fields[1];
        let pubkey = fields[2];
        let addr = '0x' + eu.pubToAddress(new Buffer(pubkey, 'hex')).toString('hex');
        lblMap[fields[0]] = {'id': id, 'pubkey': pubkey, 'addr': addr};
    }
}

exports.labelMap = lblMap;
