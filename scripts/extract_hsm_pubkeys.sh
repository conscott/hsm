#!/bin/bash

echo "Extracting all HSM objects to all_objects.txt..."
pkcs11-tool --module $MODULE -l -p $PIN --list-objects > all_objects.txt

echo "Writing label / public keys to key_map.txt"
cat all_objects.txt | grep -B 1 -A 2 06052b8104000a | tr '\n' ' ' | sed 's/--/\n/g'  | awk '{print $6, $8, $2}' | sed 's/044104//' > key_map.txt
