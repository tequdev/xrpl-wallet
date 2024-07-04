import Client from '@walletconnect/sign-client'
import { PairingTypes, SessionTypes } from '@walletconnect/types'
import { getAppMetadata, getSdkError } from '@walletconnect/utils'
import { WalletConnectModal } from '@walletconnect/modal'
import { WalletAdaptor, SignOption, TxJson, EVENTS } from '@xrpl-wallet/core'
import { ChainData, devnet, mainnet, testnet } from '@xrpl-walletconnect/core'
import { encode } from 'ripple-binary-codec'

import { DEFAULT_LOGGER, DEFAULT_XRPL_METHODS } from './constants'
import { getOptionalNamespaces, getRequiredNamespaces } from './helpers'

type Props = {
  projectId: string
  relayUrl?: string
  metadata?: {
    name: string
    description: string
    url: string
    icons: string[]
    verifyUrl?: string
  }
  /** default: mainnet */
  networks?: ('mainnet' | 'testnet' | 'devnet' | number)[]
}

export class WalletConnectAdaptor extends WalletAdaptor {
  name = 'WalletConnect'
  private projectId: string
  private modal: WalletConnectModal
  private client: Client
  private pairing: PairingTypes.Struct[] = []
  private session: SessionTypes.Struct | undefined
  private chains: ChainData['id'][]
  private accounts: string[] = []
  private relayUrl?: string
  private metadata: Props['metadata']

  constructor({ projectId, relayUrl, metadata, networks = ['mainnet'] }: Props) {
    super()
    this.projectId = projectId
    this.chains = networks.map((network) => this.parseNetworkToChainId(network))
    this.relayUrl = relayUrl
    this.metadata = metadata
    this.client = new Client()
    this.modal = new WalletConnectModal({
      projectId: this.projectId,
      themeMode: 'light',
      explorerRecommendedWalletIds: [
        // Bifrost Wallet
        '37a686ab6223cd42e2886ed6e5477fce100a4fb565dcd57ed4f81f7c12e93053',
      ],
    })
  }

  private parseNetworkToChainId = (network: string | number) => {
    switch (network) {
      case 'mainnet':
        return mainnet.id // xrpl:0
      case 'testnet':
        return testnet.id // xrpl:1
      case 'devnet':
        return devnet.id // xrpl:2
      default:
        return `xrpl:${network}`
    }
  }

  // createClient = async () => {
  //     prevRelayerValue.current = relayerRegion;
  // }

  private _subscribeToEvents = () => {
    if (typeof this.client === 'undefined') {
      throw new Error('WalletConnect is not initialized')
    }
    this.client.on('session_ping', (args) => {
      console.debug('EVENT', 'session_ping', args)
    })
    this.client.on('session_event', (args) => {
      console.debug('EVENT', 'session_event', args)
    })
    this.client.on('session_update', ({ topic, params }) => {
      console.debug('EVENT', 'session_update', { topic, params })
      const { namespaces } = params
      const _session = this.client.session.get(topic)
      const updatedSession = { ..._session, namespaces }
      this.onSessionConnected(updatedSession)
      this.emit(EVENTS.CONNECTED)
    })
    this.client.on('session_delete', () => {
      console.debug('EVENT', 'session_delete')
      this.reset()
      this.emit(EVENTS.DISCONNECTED)
    })
  }

  private _checkPersistedState = () => {
    if (typeof this.client === 'undefined') {
      throw new Error('WalletConnect is not initialized')
    }
    // populates existing pairings to state
    this.pairing = this.client.pairing.getAll({ active: true })
    console.debug('RESTORED PAIRINGS: ', this.client.pairing.getAll({ active: true }))

    if (typeof this.session !== 'undefined') return
    // populates (the last) existing session to state
    if (this.client.session.length) {
      const lastKeyIndex = this.client.session.keys.length - 1
      const _session = this.client.session.get(this.client.session.keys[lastKeyIndex])
      console.debug('RESTORED SESSION:', _session)
      this.onSessionConnected(_session)
      return _session
    }
  }

  private onSessionConnected = async (_session: SessionTypes.Struct) => {
    const allNamespaceAccounts = Object.values(_session.namespaces)
      .map((namespace) => namespace.accounts)
      .flat()
    const allNamespaceChains = Object.keys(_session.namespaces).flatMap((ns) => _session.namespaces[ns].chains || [])

    this.session = _session
    this.chains = allNamespaceChains
    this.accounts = [...new Set(allNamespaceAccounts)]
    if (this.accounts.length) {
      this.emit(EVENTS.ACCOUNT_CHANGED, await this.getAddress())
    } else {
      this.emit(EVENTS.ACCOUNT_CHANGED, null)
    }
  }

  init = async () => {
    const client = await Client.init({
      projectId: this.projectId,
      logger: DEFAULT_LOGGER,
      relayUrl: this.relayUrl,
      metadata: getAppMetadata() || this.metadata,
    })
    this.client = client
    this._subscribeToEvents()
    this._checkPersistedState()
  }

  reset = () => {
    this.session = undefined
    this.accounts = []
    this.chains = this.chains
    this.relayUrl
    // this.relayUrl = relayUrl;
  }

  isConnected = async () => {
    return !!this.client.session.length
  }

  signIn = async () => {
    if (typeof this.client === 'undefined') {
      throw new Error('WalletConnect is not initialized')
    }
    console.debug('connect, pairing topic is:', this.pairing[0]?.topic)
    try {
      const requiredNamespaces = getRequiredNamespaces(this.chains)
      const optionalNamespaces = getOptionalNamespaces(this.chains)
      console.debug('requiredNamespaces config for connect:', requiredNamespaces)

      const { uri, approval } = await this.client.connect({
        pairingTopic: this.pairing[0]?.topic,
        requiredNamespaces,
        optionalNamespaces,
      })

      // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
      if (uri) {
        // Create a flat array of all requested chains across namespaces.
        const standaloneChains = Object.values(requiredNamespaces)
          .map((namespace) => namespace.chains)
          .flat() as string[]

        this.modal.openModal({ uri, standaloneChains })
      }

      const session = await new Promise<SessionTypes.Struct>((resolve, reject) => {
        approval()
          .then((s) => resolve(s))
          .catch((e) => reject(e))
        this.modal.subscribeModal((state) => state.open === false && reject())
      })
      console.debug('Established session:', session)
      await this.onSessionConnected(session)
      // Update known pairings after session is connected.
      this.pairing = this.client.pairing.getAll({ active: true })
      this.emit(EVENTS.CONNECTED)
      return true
    } catch (e) {
      console.error(e)
      this.emit(EVENTS.DISCONNECTED)
      return false
      // ignore rejection
    } finally {
      // close modal in case it was open
      this.modal.closeModal()
    }
  }

  signOut = async () => {
    if (typeof this.client === 'undefined') {
      throw new Error('WalletConnect is not initialized')
    }
    if (typeof this.session === 'undefined') {
      throw new Error('Session is not connected')
    }
    try {
      await this.client.disconnect({
        topic: this.session.topic,
        reason: getSdkError('USER_DISCONNECTED'),
      })
      this.emit(EVENTS.DISCONNECTED)
      return true
    } catch (error) {
      console.error('SignClient.disconnect failed:', error)
      return false
    } finally {
      // Reset app state after disconnect.
      this.reset()
    }
  }

  getAddress = async () => {
    if (!this.accounts.length) return null
    return this.accounts[0].split(':')[2]
  }

  sign = async (txjson: Record<string, any>, option?: SignOption) => {
    let chainId = this.chains[0] // TODO: which is the default chain?
    if (typeof txjson.NetworkID === 'number') {
      chainId = this.parseNetworkToChainId(txjson.NetworkID)
      if (txjson.NetworkID < 1024) {
        delete txjson.NetworkID
      }
    }
    const result = await this.client!.request<{ tx_json: Record<string, any> }>({
      chainId,
      topic: this.session!.topic,
      request: {
        method: DEFAULT_XRPL_METHODS.XRPL_SIGN_TRANSACTION,
        params: {
          tx_json: txjson,
          autofill: option?.autofill,
          submit: false,
        },
      },
    })
    const hash = result.tx_json.hash
    const tx_blob = encode(result.tx_json)
    return { tx_blob, hash }
  }

  signAndSubmit = async (txjson: TxJson, option?: SignOption) => {
    let chainId = this.chains[0] // TODO: which is the default chain?
    if (typeof txjson.NetworkID === 'number') {
      chainId = this.parseNetworkToChainId(txjson.NetworkID)
      if (txjson.NetworkID < 1024) {
        delete txjson.NetworkID
      }
    }
    const result = await this.client!.request<{ tx_json: Record<string, any> }>({
      chainId,
      topic: this.session!.topic,
      request: {
        method: DEFAULT_XRPL_METHODS.XRPL_SIGN_TRANSACTION,
        params: {
          tx_json: txjson,
          autofill: option?.autofill,
          submit: true,
        },
      },
    })
    return { tx_json: result.tx_json }
  }
}
