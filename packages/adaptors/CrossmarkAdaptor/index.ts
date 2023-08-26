import { WalletAdaptor, SignOption, TxJson, EVENTS, Network } from '@xrpl-wallet/core'
import sdk from '@crossmarkio/sdk'
import { EVENTS as CrossmarkEVENTS } from '@crossmarkio/sdk/dist/src/typings/extension'

export class CrossmarkAdaptor extends WalletAdaptor {
  name = 'CROSSMARK'
  constructor() {
    super()
    sdk.on(CrossmarkEVENTS.CONNECT, () => this.emit(EVENTS.CONNECTED))
    sdk.on(CrossmarkEVENTS.DISCONNECT, () => this.emit(EVENTS.DISCONNECTED))
    sdk.on(CrossmarkEVENTS.SIGNOUT, () => this.emit(EVENTS.DISCONNECTED))
    sdk.on(CrossmarkEVENTS.ACCOUNTS_CHANGED, (address: string | null) => this.emit(EVENTS.ACCOUNT_CHANGED, address)    )
    sdk.on(CrossmarkEVENTS.NETWORK_CHANGE, (network: Network) => this.emit(EVENTS.NETWORK_CHANGED, network))
  }
  isConnected = async () => {
    return sdk.isConnected()
  }
  signIn = async () => {
    const result = await sdk.signInAndWait()
    return !!result.response.data.address
  }
  signOut = async () => {
    try {
      // TODO: sdk.signOutAndWait()
      sdk.session.handleSignOut()
      this.emit(EVENTS.DISCONNECTED)
      return true
    }catch(e) {
      console.error(e)
      return false
    }
  }
  getAddress = async () => {
    return sdk.getAddress() || null
  };
  getNetwork = async () => {
    const result = sdk.getNetwork()
    if(!result) return null
    return { network: result.type, server: result.wss}
  }
  sign = async (txjson: Record<string, any>, option?: SignOption) => {
    const result = await sdk.signAndWait(txjson)
    const data = result.response.data
    // TODO: add hash
    return { tx_blob: data.txBlob, hash: '' }
  }
  signAndSubmit = async (txjson: TxJson, option?: SignOption) => {
    const result = await sdk.signAndSubmitAndWait(txjson)
    return { tx_json: result.response.data.resp.result as Record<string, any> }
  }
}
