#!/bin/bash

node privkey_to_der.js | xargs ./hex_to_binary.sh > key.der
