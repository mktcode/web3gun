import Gun from 'gun/gun'
import { Web3GunIndexer } from '@web3gun/indexer'

export class Web3GunClient extends Web3GunIndexer {
  constructor(peers: string[] = []) {
    super(Gun({ peers: peers.map(url => url + '/gun') }))
  }
}