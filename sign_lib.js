const assert = require('assert');
const tx = require('ethereumjs-tx');
const rlp = require('rlp');
const secp256k1 = require('secp256k1');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
const labelMap = require('./label_map.js').labelMap;

exports.sign = async(unsigned, account) => {
    if (unsigned.substring(0,2) != '0x') {
        unsigned = '0x' + unsigned;
    }
    let unrolled = rlp.decode(unsigned);
    let transaction = new tx(unrolled);
    let msgHash = transaction.hash(false).toString('hex');

    let labelid = labelMap[account][0];
    let expected_pubkey = labelMap[account][1];

    cmd = './sign.sh ' + msgHash + " " + labelid
    //console.log("Executing " + cmd);
    const { stdout, stderr } = await exec(cmd);
    let sig = JSON.parse(stdout);
    let r = sig.r;
    let s = sig.s;
    sig = Buffer.concat([new Buffer(r, 'hex'), new Buffer(s, 'hex')])
    let sig_normalize = secp256k1.signatureNormalize(sig)
    transaction.r = sig_normalize.slice(0, 32);
    transaction.s = sig_normalize.slice(32, 64);
    transaction.v =  27;
    transaction.verifySignature()
    //console.log("Pubkey: " + transaction._senderPubKey.toString('hex'));
    if (transaction._senderPubKey.toString('hex') === expected_pubkey) {
        //console.log("Tx signed\n" + transaction.serialize().toString('hex'));
    } else {
        transaction.v =  28;
        transaction.verifySignature()
        //console.log("Pubkey: " + transaction._senderPubKey.toString('hex'));
        assert(transaction._senderPubKey.toString('hex') === expected_pubkey);
    }
    return transaction.serialize().toString('hex')
}
