import EventEmitter from 'events'

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
}

// events
declare interface xEventsEmitter {
  on(event: EVENTS.CONNECTED, listener: () => void): this
  on(event: EVENTS.DISCONNECTED, listener: () => void): this
  on(event: EVENTS.ACCOUNT_CHANGED, listener: (address: string | null) => void): this

  off(event: EVENTS.CONNECTED, listener: () => void): this
  off(event: EVENTS.DISCONNECTED, listener: () => void): this
  off(event: EVENTS.ACCOUNT_CHANGED, listener: (address: string | null) => void): this

  emit(event: EVENTS.CONNECTED): boolean
  emit(event: EVENTS.DISCONNECTED): boolean
  emit(event: EVENTS.ACCOUNT_CHANGED, address: string | null): boolean

  on(event: string, listener: Function): this
}

class xEventsEmitter extends EventEmitter {
  constructor() {
    super()
  }
}

interface IWalletAdaptor {
  name: string
  init: () => Promise<void>
  isConnected: () => Promise<boolean>
  signIn: () => Promise<boolean>
  signOut: () => Promise<boolean>
  getAddress: () => Promise<string | null>
  sign: (txjson: TxJson, option?: SignOption) => Promise<SubmitResponse | null>
  signAndSubmit: (txjson: TxJson, option?: SignOption) => Promise<SubmitWaitResponse | null>
}

export abstract class WalletAdaptor extends xEventsEmitter implements IWalletAdaptor {
  abstract name: string
  abstract init: () => Promise<void>
  abstract isConnected: () => Promise<boolean>
  abstract signIn: () => Promise<boolean>
  abstract signOut: () => Promise<boolean>
  abstract getAddress: () => Promise<string | null>
  abstract sign: (txjson: TxJson, option?: SignOption) => Promise<SubmitResponse | null>
  abstract signAndSubmit: (txjson: TxJson, option?: SignOption) => Promise<SubmitWaitResponse | null>
}
