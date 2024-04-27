import { SignOption, TxJson, WalletAdaptor } from '@xrpl-wallet/core'
import { Wallet, validate } from 'xrpl'

type LocalAdaptorProps = {
  seed: string
}
export class LocalAdaptor extends WalletAdaptor {
  name = 'Local'
  private wallet: Wallet

  constructor({ seed }: LocalAdaptorProps) {
    super()
    this.wallet = Wallet.fromSeed(seed)
  }
  init = async () => {
    //
  }
  isConnected = async () => {
    return true
  }
  signIn = async () => {
    return true
  }
  signOut = async () => {
    return true
  }
  getAddress = async () => {
    return new Promise<string>((resolve) => resolve(this.wallet.address))
  }
  sign = async (txjson: Record<string, any>, _option?: SignOption) => {
    validate(txjson)
    return Promise.resolve(this.wallet.sign(txjson as any))
  }
  signAndSubmit = async (_txjson: TxJson, _option?: SignOption | undefined) => {
    throw new Error('Method not implemented.')
  }
}
