#!/bin/bash

echo "Writing to key.der"
openssl ec -inform DER -outform DER -in <(cat <(echo -n "302e0201010420") <(echo -n "$1") <(echo -n "a00706052b8104000a") | xxd -r -p) > key.der

echo "Writing to key.pem"
openssl ec -inform DER -outform PEM -in <(cat <(echo -n "302e0201010420") <(echo -n "$1") <(echo -n "a00706052b8104000a") | xxd -r -p) > key.pem
