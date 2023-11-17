import { EVENTS, SignOption, TxJson, WalletAdaptor } from '@xrpl-wallet/core'
import { Xumm } from 'xumm'

type XummlAdaptorProps = {
  apiKey: string
  apiSecret?: string
}
export class XummAdaptor extends WalletAdaptor {
  name = 'Xumm'
  private apiKey: string
  private apiSecret?: string
  // @ts-ignore
  private xumm: Xumm

  constructor({ apiKey, apiSecret }: XummlAdaptorProps) {
    super()
    this.apiKey = apiKey
    this.apiSecret = apiSecret
  }
  init = async () => {
    if (!this.xumm) {
      this.xumm = new Xumm(this.apiKey, this.apiSecret)
      this.xumm.on('success', async () => {
        this.emit(EVENTS.CONNECTED)
        this.emit(EVENTS.ACCOUNT_CHANGED, (await this.xumm.user.account) || null)
        const server = (await this.xumm.user.networkEndpoint)!
        this.emit(EVENTS.NETWORK_CHANGED, { server })
      })
      this.xumm.on('retrieved', async () => {
        this.emit(EVENTS.CONNECTED)
        this.emit(EVENTS.ACCOUNT_CHANGED, (await this.xumm.user.account) || null)
        const server = (await this.xumm.user.networkEndpoint)!
        this.emit(EVENTS.NETWORK_CHANGED, { server })
      })
      this.xumm.on('loggedout', () => {
        this.emit(EVENTS.DISCONNECTED)
        this.emit(EVENTS.ACCOUNT_CHANGED, null)
      })
      this.xumm.on('logout', () => {
        this.emit(EVENTS.DISCONNECTED)
        this.emit(EVENTS.ACCOUNT_CHANGED, null)
      })
    }
    await this.xumm.environment.ready
  }

  isConnected = async () => {
    return !!(await this.getAddress())
  }
  signIn = async () => {
    try {
      const result = await this.xumm.authorize()
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
      await this.xumm.logout()
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }
  getAddress = async () => {
    await this.xumm.environment.ready
    return new Promise<string | null>((r) => {
      this.xumm.user.account.then((a) => r(a || null))
      setTimeout(() => r(null), 300)
    })
  }
  getNetwork = async () => {
    const server = (await this.xumm.user.networkEndpoint)!
    return { server }
  }
  sign = async (txjson: Record<string, any>, _option?: SignOption) => {
    const result = await this.xumm.payload?.createAndSubscribe({ txjson: txjson as any, options: { submit: false } })
    if (!result) return null
    const hash = result.payload.response.txid!
    const tx_blob = result.payload.response.hex!
    return { tx_blob, hash }
  }
  signAndSubmit = async (txjson: TxJson, _option?: SignOption | undefined) => {
    const result = await this.xumm.payload?.createAndSubscribe({ txjson: txjson as any, options: { submit: true } })
    if (!result) return null
    return { tx_json: result.payload.payload.request_json as Record<string, any> }
  }
}
