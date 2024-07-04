import { XrplClient } from 'xrpl-accountlib'
import { accountAndLedgerSequence, networkTxFee } from 'xrpl-accountlib/dist/utils'

import { EVENTS, SignOption, TxJson, WalletAdaptor } from './WalletAdaptor'

export class WalletClient<T extends WalletAdaptor = WalletAdaptor> {
  walletName: string
  // @ts-ignore
  xrplClient: XrplClient
  constructor(private readonly adaptor: T) {
    this.walletName = adaptor.name
  }

  // events
  onAccountChange = (listener: (address: string | null) => void) => {
    this.adaptor.on(EVENTS.ACCOUNT_CHANGED, listener)
    return () => {
      this.adaptor.off(EVENTS.ACCOUNT_CHANGED, listener)
    }
  }

  onConnected = (listener: () => void) => {
    this.adaptor.on(EVENTS.CONNECTED, listener)
    return () => {
      this.adaptor.off(EVENTS.CONNECTED, listener)
    }
  }

  onDisconnected = (listener: () => void) => {
    this.adaptor.on(EVENTS.DISCONNECTED, listener)
    return () => {
      this.adaptor.off(EVENTS.DISCONNECTED, listener)
    }
  }

  init = async () => {
    return await this.adaptor.init()
  }

  isConnected = async () => {
    return await this.adaptor.isConnected()
  }

  /**
   * Connect to Wallet
   */
  signIn = async () => {
    return await this.adaptor.signIn()
  }

  /**
   * Disconnect from Wallet
   */
  signOut = async () => {
    return await this.adaptor.signOut()
  }

  /**
   * Get Wallet Address
   */
  getAddress = async () => {
    return await this.adaptor.getAddress()
  }

  /**
   * Sign Transaction
   * option: autofill (default: true)
   */
  sign = async (txjson: TxJson, option?: SignOption) => {
    if (!txjson.LastLedgerSequence) {
      throw new Error('Transaction must contain a LastLedgerSequence value for reliable submission.')
    }
    return await this.adaptor.sign(txjson, option)
  }

  /**
   * Sign and Submit Transaction
   * option: autofill (default: true)
   */
  signAndSubmit = async (txjson: TxJson, option?: SignOption) => {
    return await this.adaptor.signAndSubmit(txjson, option)
  }

  /**
   * Submit Transaction(and Walt for validated)
   */
  submit = async (txblob: string) => {
    const submitResult = await this.xrplClient.send({ command: 'submit', tx_blob: txblob })
    if (submitResult.error) {
      throw new Error(`${submitResult.error} : ${submitResult.error_exception}`)
    }
    const hash = submitResult.tx_json.hash
    const LastLedgerSequence = submitResult.tx_json.LastLedgerSequence
    const txResponse = await new Promise<Record<string, object>>((resolve, reject) => {
      this.xrplClient.on('ledger', async (event) => {
        const ledger_index = event.ledger_index
        const txResponse = await this.xrplClient.send({ command: 'tx', transaction: hash })
        if (!txResponse.error) {
          resolve(txResponse)
        } else if (ledger_index > LastLedgerSequence) {
          reject(
            `The latest ledger sequence ${ledger_index} is greater than the transaction's LastLedgerSequence (${LastLedgerSequence}).\n` +
              `Preliminary result: ${submitResult.engine_result}`,
          )
        }
      })
    })
    return txResponse
  }

  autofill = async (txjson: TxJson) => {
    if (!txjson.Account) {
      txjson.Account = await this.getAddress()
    }
    const { networkInfo, txValues } = await accountAndLedgerSequence(this.xrplClient, txjson.Account)
    const { NetworkID, ...values } = txValues
    if (networkInfo.features.hooks) {
      return {
        ...values,
        ...txjson,
      }
    } else {
      return {
        NetworkID,
        ...values,
        ...txjson,
      }
    }
  }

  getAccountSequence = async () => {
    const result = await this.xrplClient.send({ command: 'account_info', account: await this.getAddress() })
    if (result.error) throw new Error(result.error_message)
    return result.account_data.Sequence as number
  }

  getLedgerSequece = (offset: number = 20) => {
    const {
      ledger: { last: ledger_index },
    } = this.xrplClient.getState()
    return (ledger_index as number) + offset
  }

  getFee = async (tx: Record<string, object>) => {
    const fee = await networkTxFee(this.xrplClient, tx)
    return fee
  }
}
