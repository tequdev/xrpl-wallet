export type NETWORK = 'mainnet' | 'testnet' | 'devnet' | string

export type TxJson = Record<string, any>

export type SignAndSubmitOption = {
  autofill?: boolean
}

interface IWalletAdaptor {
  connect: () => Promise<boolean>
  getAddress: () => Promise<string | null>
  getNetwork: () => Promise<{ network: NETWORK, server: string } | null>
  sign: (txjson: TxJson) => Promise<{ tx_blob: string; hash: string } | null>
  signAndSubmit: (txjson: TxJson, option?: SignAndSubmitOption) => Promise<{ hash: string } | null>
  submit: (txblob: string) => Promise<{ hash: string } | null>
}

export abstract class WalletAdaptor implements IWalletAdaptor {
  abstract connect: () => Promise<boolean>
  abstract getAddress: () => Promise<string | null>
  abstract getNetwork: () => Promise<{ network: string; server: string } | null>
  abstract sign: (txjson: TxJson) => Promise<{ tx_blob: string; hash: string } | null>
  abstract signAndSubmit: (txjson: TxJson, option?: SignAndSubmitOption) => Promise<{ hash: string } | null>
  abstract submit: (txblob: string) => Promise<{ hash: string } | null>
}
