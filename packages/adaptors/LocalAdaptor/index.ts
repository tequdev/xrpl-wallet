import { WalletAdaptor, NETWORK } from '@xrplclient/core'
import { Client, Wallet, validate } from 'xrpl'

type LocalAdaptorProps = {
  seed: string
  network?: NETWORK
}

const servers = {
  mainnet: 'wss://xrpl.ws',
  testnet: 'wss://testnet.xrpl-labs.com',
  devnet: 'wss://s.devnet.rippletest.net:51233',
}

export class LocalAdaptor extends WalletAdaptor {
  private wallet: Wallet
  private network: NETWORK
  private server: string

  private client: Client

  constructor({ seed, network = servers.mainnet }: LocalAdaptorProps) {
    super()
    this.wallet = Wallet.fromSeed(seed)
    this.network = network
    if (network === 'mainnet' || network === 'testnet' || network === 'devnet') {
      this.server = servers[network]
    } else {
      this.server = network
    }
    this.client = new Client(this.server)
  }
  signIn = async () => {
    await this.client.connect()
    return this.client.isConnected()
  }
  getAddress = async () => {
    return new Promise<string>((resolve) => resolve(this.wallet.address))
  };
  getNetwork = async () => {
    return new Promise<{ network: string, server: string }>((resolve) => resolve({ network: this.network, server: this.server }))
  }
  sign = async (txjson: Record<string, any>) => {
    validate(txjson)
    return Promise.resolve(this.wallet.sign(txjson as any))
  }
  signAndSubmit: WalletAdaptor['signAndSubmit'] = async (txjson, option) => {
    let tx_json = txjson
    if (option?.autofill !== false) {
      tx_json = await this.client.autofill(txjson as any)
    }
    const { tx_blob } = await this.sign(tx_json)
    const response = await this.client.submitAndWait(tx_blob)
    return { hash: response.result.hash }
  }
  submit = async (txblob: string) => {
    const response = await this.client.submit(txblob)
    return { hash: response.result.tx_json.hash! }
  }
}
