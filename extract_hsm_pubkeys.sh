#!/bin/bash

cat all_objects.txt | grep -B 1 06052b8104000a | grep EC_POINT | awk '{print $2}' | sed 's/^044104//'
