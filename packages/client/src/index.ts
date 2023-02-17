import { JsonRpcProvider } from 'ethers'
import Gun from 'gun/gun'
import { Web3GunIndexer } from '@web3gun/indexer'

export class Web3GunClient extends Web3GunIndexer {
  constructor(provider: string | JsonRpcProvider, peers: string[] = []) {
    super(provider, Gun({ peers: peers.map(url => url + '/gun') }))
  }
}