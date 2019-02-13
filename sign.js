const assert = require('assert');
const tx = require('ethereumjs-tx');
const rlp = require('rlp');
const secp256k1 = require('secp256k1');

const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

require('dotenv').config();
const TEST_PK = new Buffer(process.env.PRIV_KEY, 'hex');
const expected_pubkey = process.env.TEST_PUBKEY;

const sign = async() => {
    
    let unsigned = process.argv[2];
    if (unsigned.substring(0,2) != '0x') {
        unsigned = '0x' + unsigned;
    }

    let unrolled = rlp.decode(unsigned);
    let transaction = new tx(unrolled);
    let msgHash = transaction.hash(false);

    let hsm = true;
    if (hsm) {
        const { stdout, stderr } = await exec('./sign.sh ' + msgHash.toString('hex'));
        let sig = JSON.parse(stdout);
        let r = sig.r;
        let s = sig.s;
        sig = Buffer.concat([new Buffer(r, 'hex'), new Buffer(s, 'hex')])
        let sig_normalize = secp256k1.signatureNormalize(sig)
        transaction.r = sig_normalize.slice(0, 32);
        transaction.s = sig_normalize.slice(32, 64);
        transaction.v =  27;
        transaction.verifySignature()
        if (transaction._senderPubKey.toString('hex') === expected_pubkey) {
            console.log("Tx signed\n" + transaction.serialize().toString('hex'));
        } else {
            transaction.v =  28;
            transaction.verifySignature()
            assert(transaction._senderPubKey.toString('hex') === expected_pubkey);
            console.log("Tx signed\n" + transaction.serialize().toString('hex'));
        }
    } else {
        transaction.sign(TEST_PK);
        console.log("Verified is ... " + transaction.verifySignature());
        console.log("Tx signed\n" + transaction.serialize().toString('hex'));
        console.log("\n" + JSON.stringify(transaction.toJSON(), null, 4));
    }

}

sign();
