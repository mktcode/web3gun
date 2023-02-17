import { JsonRpcProvider } from 'ethers'
import express from 'express'
import Gun from 'gun'
import { Web3GunIndexer } from '@web3gun/indexer'

declare module 'gun' {
  interface IGun {
    serve: any
  }
}

export class Web3GunServer extends Web3GunIndexer {
  constructor(provider: string | JsonRpcProvider, port: number) {
    const server = express()
    server.use(Gun.serve);
    
    const storage =  Gun({
      file: 'data',
      web: server.listen(port, () => {
        console.log(`Indexer running at: http://localhost:${port}`)
        console.log(`Peer link: http://localhost:${port}/gun`)
      })
    });

    super(provider, storage)
  }
}
