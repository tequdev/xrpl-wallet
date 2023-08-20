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

interface IWalletAdaptor {
  name: string
  isConnected: () => Promise<boolean>
  signIn: () => Promise<boolean>
  getAddress: () => Promise<string | null>
  getNetwork: () => Promise<Network | null>
  sign: (txjson: TxJson, option?: SignOption) => Promise<SubmitResponse | null>
  signAndSubmit: (txjson: TxJson, option?: SignOption) => Promise<SubmitWaitResponse | null>
}

export abstract class WalletAdaptor implements IWalletAdaptor {
  abstract name: string
  abstract isConnected: () => Promise<boolean>
  abstract signIn: () => Promise<boolean>
  abstract getAddress: () => Promise<string | null>
  abstract getNetwork: () => Promise<Network | null>
  abstract sign: (txjson: TxJson, option?: SignOption) => Promise<SubmitResponse | null>
  abstract signAndSubmit: (txjson: TxJson, option?: SignOption) => Promise<SubmitWaitResponse | null>
}
