# HSM Module for On and Offline Signing

### View HSM accounts
```
cat key_map.txt
```

### Sign Transaction Offline
```bash
node sign.js <unsigned tx> <account name>
```
Example To Sign Transaction with the "Backed Address" account
```bash
node sign.js ec80843b9aca008347e7c494c1c5da1673935527d4efe1714ef8dcbee12a93808801589cc6877c65c0801c8080 backed
```
