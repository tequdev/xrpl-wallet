import { WalletAdaptor, SignOption, TxJson } from '@xrpl-wallet/core'
import sdk from '@crossmarkio/sdk'

export class CrossmarkAdaptor extends WalletAdaptor {
  name = 'CROSSMARK'
  isConnected = async () => {
    const result = await sdk.isConnected()
    return result.response.data.isConnected
  }
  signIn = async () => {
    const result = await sdk.signInAndWait()
    return !!result.response.data.address
  }
  getAddress = async () => {
    const result = await sdk.getAddress()
    console.log(result)
    return result.response.data.address
  };
  getNetwork = async () => {
    const result = await sdk.getNetwork()
    return { network: result.response.data.network.type, server: result.response.data.network.wss }
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
