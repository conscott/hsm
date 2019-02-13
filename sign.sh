#!/bin/bash

export PIN="PRIMUSDEV"
export MODULE="/usr/local/primus/lib/libprimusP11.so"
export ID=7707

echo $1 | xxd -r -p > unsigned.raw

#echo "pkcs11-tool -p $PIN --module $MODULE --sign -m ECDSA --id=$ID --input-file unsigned.raw"

pkcs11-tool -p $PIN --module $MODULE --sign -m ECDSA --id=$ID --input-file unsigned.raw | head -c 64 > data.sig

r=$(cat data.sig | head -c 32 | xxd -p -c 64)
s=$(cat data.sig | tail -c 32 | xxd -p -c 64)

echo -e "{\"r\":\""$r"\", \"s\":\""$s"\"}"
