const assert = require('assert');
const aesjs = require('aes-js');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const tx = require('ethereumjs-tx');
const express = require('express');
const morgan = require('morgan');
const rlp = require('rlp');

const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

// Load secrets into environment variables
require('dotenv').config()

// Load logger after loading env config
const logger = require('./logging.js');

const app = express();
app.set('port', process.env.PORT || 8090);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('doc'))

// For logging incoming requests
app.use(morgan('combined', { stream: logger.stream }))

// Error handling
app.use(function(err, req, res, next) {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(err.status || 500);
  return res.send({'error': err.message});
});

// Pull AES secrets from environment variables
const key = new Buffer(process.env.ENCRYPT_PHRASE, 'utf8').slice(0, 16);
const iv = new Buffer(process.env.ENCRYPT_IV, 'hex').slice(0, 16);

// return bytes
function decryptHex(hexStr) {
    var aes = new aesjs.ModeOfOperation.cbc(key, iv);
    return aesjs.utils.hex.fromBytes(aes.decrypt(aesjs.utils.hex.toBytes(hexStr)));
}

// return bytes
function encryptHex(hexStr) {
    var aes = new aesjs.ModeOfOperation.cbc(key, iv);
    return aesjs.utils.hex.fromBytes(aes.encrypt(aesjs.utils.hex.toBytes(hexStr)));
}

function zero2(word) {
  if (word.length === 1)
    return '0' + word;
  else
    return word;
}

function toHex(msg) {
  var res = '';
  for (var i = 0; i < msg.length; i++)
    res += zero2(msg[i].toString(16));
  return res;
}


CHAIN_ID = {
    'main': 1,
    'ropsten': 3
}

/**
 * @api {post} /api/sign Sign Raw Transaction
 * @apiGroup Public
 * @apiName SignTransaction
 * @apiDescription Sign a raw transaction string with the encrypted private key
 *
 * @apiExample {curl} Example usage:
 *     curl -d '{"tx" : "f8486c843b9aca008347e7c4943dc33fc3fe1dcfe55cbe33c7456c6f00b5ca084780a416a0368d09ded19fbaec56f35458b1558c8f7db4158948ff82fe3c2dff13f277e38dd9c81c8080", "key": "a332e12403944ff84aaac0a7393790a3a60e3372c4031352ffb45ee7555df339"}' -H "Content-Type: application/json" -X POST http://localhost:8090/api/sign
 *
 * @apiParam {String} tx The raw transaction string
 * @apiParam {String} key The AES encrypted private key
 *
 * @apiSuccess {String} signedTx The raw signed transaction string
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "signedTx": "f8886c843b9aca008347e7c4943dc33fc3fe1dcfe55cbe33c7456c6f00b5ca084780a416a0368d09ded19fbaec56f35458b1558c8f7db4158948ff82fe3c2dff13f277e38dd9c81ba070fe71539541a941b4d2a06441e4f62547f2fcd6592918db3e1a3593e37bc200a0434232f174218f35fd99ce37427b61fc2f740b25a66bf5ac70637876986b2d83"
 *     }
 *
 * @apiError Unknown sign errors
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request Error
 *     {
 *       "error": {"The error reason"}
 *     }
 */
app.post('/api/sign', async(req, res) => {
    let unsigned_tx = req.body.tx;
    let encrypted_key = req.body.key;
    logger.debug("Signing raw tx " + unsigned_tx);
    if (unsigned_tx.substring(0,2) != '0x') {
        unsigned_tx = '0x' + unsigned_tx;
    }
    let unrolled = rlp.decode(unsigned_tx);
    let transaction = new tx(unrolled);
    console.log('transaction ' + transaction.toJSON());

    let hsm = false;
    if (hsm) {
        // Get r,s value for signature
        const { stdout, stderr } = await exec('./sign.sh ' + unsigned_tx);
        logger.debug("Result is " + stdout);
        let sig = JSON.parse(stdout);
        transaction.r = '0x' + sig.r;
        transaction.s = '0x' + sig.s;
        transaction.v = toHex(27);
        console.log("Verified is ... " + transaction.verifySignature());
        transaction.v = toHex(28);
        console.log("Verified is ... " + transaction.verifySignature());
        console.log('transaction ' + transaction.toJSON());
    } else {
        // Now decrypt the private key and sign the rawtx
        let privateKey = decryptHex(encrypted_key);
        let pkBuffer = new Buffer(privateKey, 'hex');
        transaction.sign(pkBuffer);
        console.log("Transaction after signin is " + JSON.stringify(transaction, null, 4));
    }

    let signedTx = transaction.serialize().toString('hex');
    logger.debug("Returning signed tx " + signedTx);
    return res.json({'signedTx': signedTx});
});

/**
 * @api {get} /api/encrypt?data=dataToEncrypt Encrypt Data
 * @apiGroup Public
 * @apiName EncryptData
 * @apiDescription Can be used to AES encrypt the input hex data string
 *
 * @apiExample {curl} Example usage:
 *      curl http://localhost:8090/api/encrypt?data=d3799c52ee2f4f1c13bf7975ddcdeb6f94127d566fa270a25e36cf30bdfefddc
 *
 * @apiParam {String} data The hex data string to encrypt
 *
 * @apiSuccess {String} encrypted The encrypted hex data string
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "encrypted": "a332e12403944ff84aaac0a7393790a3a60e3372c4031352ffb45ee7555df339"
 *     }
 *
 * @apiError Unknown Possible encryption problems
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request Error
 *     {
 *       "error": {"The error reason"}
 *     }
 */
app.get('/api/encrypt', async(req, res) => {
    let encrypted = encryptHex(req.query.data);
    console.log(encrypted);
    return res.json({'encrypted': encrypted});
});

/**
 * @api {get} /api/decrypt?data=dataToEncrypt Decrypt Data
 * @apiGroup Public
 * @apiName DecryptData
 * @apiDescription Can be used AES decrypt the input encrypted hex data string
 *
 * @apiExample {curl} Example usage:
 *      curl http://localhost:8090/api/decrypt?data=a332e12403944ff84aaac0a7393790a3a60e3372c4031352ffb45ee7555df339
 *
 * @apiParam {String} data The hex data string to encrypt
 *
 * @apiSuccess {String} decrypted The decrypted hex data string
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "decrypted": "d3799c52ee2f4f1c13bf7975ddcdeb6f94127d566fa270a25e36cf30bdfefddc"
 *     }
 *
 * @apiError Unknown Possible decryption problems
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request Error
 *     {
 *       "error": {"The error reason"}
 *     }
 */
app.get('/api/decrypt', async(req, res) => {
    let decrypted = decryptHex(req.query.data);
    return res.json({'decrypted': decrypted});
});

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  logger.info('App is running at http://localhost:' + app.get('port'));
  logger.info('  Press CTRL-C to stop\n');
});

module.exports = app;
