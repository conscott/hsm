const assert = require('assert');
const tx = require('ethereumjs-tx');
const rlp = require('rlp');
const secp256k1 = require('secp256k1');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

require('dotenv').config();

const lib = require('./sign_lib.js');

// Load the map of labels -> pubkeys
const labelMap = require('./label_map.js').labelMap;

// Pass in signing account as arg
// Usage is :
// $ node sign.js <unsigned tx> <account label>
let unsigned = process.argv[2];
const account = process.argv[3];

if (!(account in labelMap)) {
    console.log(labelMap)
    console.log("Must pass account label as arg. View key_map.txt for valid account labels");
} else {
    lib.sign(unsigned, account).then((result) => {
        console.log("Signed Tx:\n" + result);
    });
}

