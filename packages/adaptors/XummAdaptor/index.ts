import { EVENTS, SignOption, TxJson, WalletAdaptor } from '@xrpl-wallet/core'
import { XummPkce } from 'xumm-oauth2-pkce'

type XummlAdaptorProps = {
  apiKey: string
}
export class XummAdaptor extends WalletAdaptor {
  name = 'Xumm'
  private apiKey: string
  // @ts-ignore
  private xummPkce: XummPkce

  constructor({ apiKey }: XummlAdaptorProps) {
    super()
    this.apiKey = apiKey
  }
  init = async () => {
    if (!this.xummPkce) {
      this.xummPkce = new XummPkce(this.apiKey)
      this.xummPkce.on('success', async () => {
        this.emit(EVENTS.CONNECTED)
        const s = await this.xummPkce.state()
        this.emit(EVENTS.ACCOUNT_CHANGED, s?.me.account || null)
      })
      this.xummPkce.on('retrieved', async () => {
        this.emit(EVENTS.CONNECTED)
        const s = await this.xummPkce.state()
        this.emit(EVENTS.ACCOUNT_CHANGED, s?.me.account || null)
      })
      this.xummPkce.on('loggedout', () => {
        this.emit(EVENTS.DISCONNECTED)
        this.emit(EVENTS.ACCOUNT_CHANGED, null)
      })

      await new Promise<void>((resolve) => {
        this.xummPkce.on('retrieved', resolve)
        this.xummPkce.on('success', resolve)
        this.xummPkce.on('error', (_data) => resolve())
        this.xummPkce.on('loggedout', resolve)
      })
    }
  }

  isConnected = async () => {
    return !!(await this.getAddress())
  }
  signIn = async () => {
    try {
      const result = await this.xummPkce.authorize()
      if (result && !(result instanceof Error)) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
  signOut = async () => {
    try {
      await this.xummPkce.logout()
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }
  getAddress = async () => {
    const s = await this.xummPkce.state()
    return s?.me.account || null
  }
  sign = async (txjson: Record<string, any>, _option?: SignOption) => {
    const sdk = (await this.xummPkce.state())?.sdk
    const result = await sdk?.payload?.createAndSubscribe({ txjson: txjson as any, options: { submit: false } })
    if (!result) return null
    const hash = result.payload.response.txid!
    const tx_blob = result.payload.response.hex!
    return { tx_blob, hash }
  }
  signAndSubmit = async (txjson: TxJson, _option?: SignOption | undefined) => {
    const sdk = (await this.xummPkce.state())?.sdk
    const result = await sdk?.payload?.createAndSubscribe({ txjson: txjson as any, options: { submit: true } })
    if (!result) return null
    return { tx_json: result.payload.payload.request_json as Record<string, any> }
  }
}
