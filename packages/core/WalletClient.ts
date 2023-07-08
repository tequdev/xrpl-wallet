import { SignAndSubmitOption, TxJson, WalletAdaptor } from "./WalletAdaptor"

export class WalletClient<T extends WalletAdaptor> {
  constructor(private readonly adaptor: T) { }
  connect() {
    return this.adaptor.connect()
  }
  getAddress() {
    return this.adaptor.getAddress()
  }
  getNetwork() {
    return this.adaptor.getNetwork()
  }
  sign(txjson: TxJson) {
    return this.adaptor.sign(txjson)
  }
  signAndSubmit(txjson: TxJson, option?: SignAndSubmitOption) {
    return this.adaptor.signAndSubmit(txjson, option)
  }
  submit(txblob: string) {
    return this.adaptor.submit(txblob)
  }
}
