import EventEmitter from "events";

export type NETWORK_TYPE = 'mainnet' | 'testnet' | 'devnet'

export type Network = {
  server: NETWORK_TYPE | string | string[];
}

export type TxJson = Record<string, any>

type SubmitResponse = { tx_blob: string; hash: string }
type SubmitWaitResponse = { tx_json: TxJson }

export type SignOption = {
  autofill?: boolean // default: trued
}

export enum EVENTS {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ACCOUNT_CHANGED = 'account-changed',
  NETWORK_CHANGED = 'network-changed',
}

// events
declare interface xEventsEmitter {
  on(event: EVENTS.CONNECTED, listener: () => void): this;
  on(event: EVENTS.DISCONNECTED, listener: () => void): this;
  on(event: EVENTS.ACCOUNT_CHANGED, listener: (address: string | null) => void): this;
  on(event: EVENTS.NETWORK_CHANGED, listener: (network: Network) => void): this;
  
  off(event: EVENTS.CONNECTED, listener: () => void): this;
  off(event: EVENTS.DISCONNECTED, listener: () => void): this;
  off(event: EVENTS.ACCOUNT_CHANGED, listener: (address: string | null) => void): this;
  off(event: EVENTS.NETWORK_CHANGED, listener: (network: Network) => void): this;
  
  emit(event: EVENTS.CONNECTED): boolean
  emit(event: EVENTS.DISCONNECTED): boolean
  emit(event: EVENTS.ACCOUNT_CHANGED, address: string | null): boolean
  emit(event: EVENTS.NETWORK_CHANGED, network: Network): boolean

  on(event: string, listener: Function): this;
}

class xEventsEmitter extends EventEmitter {
  constructor() {
    super();
  }
}

interface IWalletAdaptor {
  name: string
  isConnected: () => Promise<boolean>
  signIn: () => Promise<boolean>
  signOut: () => Promise<boolean>
  getAddress: () => Promise<string | null>
  getNetwork: () => Promise<Network | null>
  sign: (txjson: TxJson, option?: SignOption) => Promise<SubmitResponse | null>
  signAndSubmit: (txjson: TxJson, option?: SignOption) => Promise<SubmitWaitResponse | null>
}

export abstract class WalletAdaptor extends xEventsEmitter implements IWalletAdaptor {
  abstract name: string
  abstract isConnected: () => Promise<boolean>
  abstract signIn: () => Promise<boolean>
  abstract signOut: () => Promise<boolean>
  abstract getAddress: () => Promise<string | null>
  abstract getNetwork: () => Promise<Network | null>
  abstract sign: (txjson: TxJson, option?: SignOption) => Promise<SubmitResponse | null>
  abstract signAndSubmit: (txjson: TxJson, option?: SignOption) => Promise<SubmitWaitResponse | null>
}
