# Web3 Gun

Your friendly neighborhood web3 indexer. Low-profile, schemaless, offline-first, free!

## Client

```bash
npm i @web3gun/client
```

You can use the indexer in the browser. No server required. Indexed data is distributed to all clients automatically via a public relay.

All you need to do is to implement listeners for your contract events. The `indexer.contract` function will hand you the `contract` instance, connected to the provider you pass to the client and a `storage` instance that you can use to store your data.

```javascript
// indexer.js
import { Web3GunClient } from '@web3gun/client'

export const indexer = new Web3GunClient(jsonRpcProvider); // or URL

indexer.contract(ADDRESS, ABI, async (contract, storage) => {
  contract.on("Transfer", async (from, to, amount, event) => {
    const ethPrice = await fetch(/* external APIs, do whatever you want */)

    if (amount > 1000000000000000n && ethPrice > 2000.00) {
      storage.get("interestingTransfers").get(event.transactionHash).put({
        from,
        to,
        amount,
        ethPrice
      })
    }
  })
})
```

Using the data is as simple as this:

```javascript
// app.js
import { indexer } from './indexer.js'

const interestingTransfers = {}

// continuously update the list
indexer.storage.get("interestingTransfers").on((transfer, txHash) => {
  interestingTransfers[txHash] = transfer
})
```

The storage layer is a [Gun.js](https://gun.eco/) instance. Learn more [here](https://gun.eco/docs/API).


## Server

```bash
npm i @web3gun/server
```

By default data is only indexed **and** available when **clients are online**. All clients store a local copy of the data they need in your app or index when connected and listening to the events you implement.

You probably want to make sure your data is available around the clock. You can do so by running your own indexing server that also acts as a relay to connect clients (instead of using the public relay, which doesn't store data).

```javascript
// server.js
import { Web3GunServer } from '@web3gun/server'

const indexer = new Web3GunServer(PROVIDER_URL, PORT)

indexer.contract(ADDRESS, ABI, (contract, storage) => {
  contract.on("Transfer", async (from, to, amount, event) => {
    const ethPrice = await fetch(/* external APIs, do whatever you want */)

    if (amount > 1000000000000000n && ethPrice > 2000.00) {
      storage.get("interestingTransfers").get(event.transactionHash).put({
        from,
        to,
        amount,
        ethPrice
      })
    }
  })
})
```

```bash
$ node server.js

Indexer running at: http://localhost:4200
```

Use your relay (or multiple) in the client:

```javascript
const relays = ["http://localhost:4200"]
export const indexer = new Web3GunClient(jsonRpcProvider, relays);
```

If you want to run the indexer both in the client as well as on a server, you probably want to move your listeners to a separate file and import them in both places.

## Replaying

You can easily replay all events you implemented listeners for.

```javascript
indexer.replay()
```