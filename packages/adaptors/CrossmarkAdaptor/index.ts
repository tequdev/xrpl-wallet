import sdk from '@crossmarkio/sdk'
import typings from '@crossmarkio/typings'
import { WalletAdaptor, SignOption, TxJson, EVENTS } from '@xrpl-wallet/core'

const CrossmarkEVENTS = typings.extension.Extension.EVENTS
const COMMANDS = typings.extension.Extension.COMMANDS

export class CrossmarkAdaptor extends WalletAdaptor {
  name = 'CROSSMARK'
  constructor() {
    super()
    sdk.on(CrossmarkEVENTS.SIGNOUT, () => this.emit(EVENTS.DISCONNECTED))
    sdk.on(CrossmarkEVENTS.USER_CHANGE, (_user) => {
      const address = sdk.getAddress() || null
      this.emit(EVENTS.ACCOUNT_CHANGED, address)
    })
  }
  init = async () => {
    //
  }
  isConnected = async () => {
    return sdk.isConnected() || false
  }
  signIn = async () => {
    const result = await sdk.signInAndWait()
    if (!result.response.data.address) return false
    this.emit(EVENTS.CONNECTED)
    return true
  }
  signOut = async () => {
    try {
      // TODO: sdk.signOutAndWait()
      sdk.session.handleSignOut()
      this.emit(EVENTS.DISCONNECTED)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }
  getAddress = async () => {
    const response = await sdk.api.awaitRequest({
      command: COMMANDS.ADDRESS,
    })
    return (response.response.data as any).address || null
  }
  sign = async (txjson: Record<string, any>, _option?: SignOption) => {
    const result = await sdk.signAndWait(txjson)
    const data = result.response.data
    // TODO: add hash
    return { tx_blob: data.txBlob, hash: '' }
  }
  signAndSubmit = async (txjson: TxJson, _option?: SignOption) => {
    const result = await sdk.signAndSubmitAndWait(txjson)
    return { tx_json: result.response.data.resp.result as Record<string, any> }
  }
}
