import { InterfaceAbi, Contract, JsonRpcProvider, EventFragment, EventLog } from "ethers"
import { IGunInstance } from "gun/types/gun/IGunInstance"

export abstract class Web3GunIndexer {
  contracts: Contract[] = []
  provider: JsonRpcProvider | undefined
  storage: IGunInstance

  constructor(storage: IGunInstance) {
    this.storage = storage;
  }

  setProvider(provider: string | JsonRpcProvider) {
    if (typeof provider === 'string') {
      this.provider = new JsonRpcProvider(provider)
    } else {
      this.provider = provider
    }
  }
  
  contract(
    address: string,
    abi: InterfaceAbi,
    callback: (contract: Contract, storage: IGunInstance) => void
  ) {
    if (!this.provider) throw new Error('Provider not set. Call setProvider first.')

    const contract = new Contract(address, abi, this.provider)
    this.contracts.push(contract)
    callback(contract, this.storage)
  }

  async replay() {
    for (const contract of this.contracts) {
      const events = contract.interface.fragments.filter(
        (fragment) => fragment.type === "event"
      ) as EventFragment[];
      const eventNames = events.map((event) => event.name);
  
      const allPastEvents = [];
  
      for (const eventName of eventNames) {
        const pastEvents = await contract.queryFilter(eventName) as EventLog[];
        allPastEvents.push(...pastEvents);
      }
  
      allPastEvents.sort((a, b) =>
        a.blockNumber === b.blockNumber
          ? a.transactionIndex - b.transactionIndex
          : a.blockNumber - b.blockNumber
      );
  
      for (const pastEvent of allPastEvents) {
        const eventName = pastEvent.fragment.name;
        const listeners = await contract.listeners(eventName) as (
          // workaround because ethers doesn't account for async listeners
          ((...args: Array<any>) => Promise<void>) | ((...args: Array<any>) => void)
        )[];
        const decodedEventData = contract.interface.decodeEventLog(
          eventName,
          pastEvent.data,
          pastEvent.topics
        );
  
        for (const listener of listeners) {
          await listener(...decodedEventData);
        }
      }
    };
  }
}