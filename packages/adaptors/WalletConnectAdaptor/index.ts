import Client from '@walletconnect/sign-client'
import { PairingTypes, SessionTypes } from '@walletconnect/types'
import { getAppMetadata, getSdkError } from '@walletconnect/utils'
import { Web3Modal } from '@web3modal/standalone'
import { WalletAdaptor, SignOption, TxJson, EVENTS } from '@xrpl-wallet/core'
import { ChainData, devnet, mainnet, testnet } from '@xrpl-walletconnect/core'
import { encode } from 'ripple-binary-codec'

import { DEFAULT_LOGGER, DEFAULT_XRPL_METHODS } from './constants'
import { getOptionalNamespaces, getRequiredNamespaces } from './helpers'

type Props = {
  projectId: string
  relayUrl: string
  metadata: {
    name: string
    description: string
    url: string
    icons: string[]
    verifyUrl?: string
  }
  network: 'mainnet' | 'testnet' | 'devnet' | number
}

export class WalletConnectAdaptor extends WalletAdaptor {
  name = 'WalletConnect'
  private projectId: string
  private web3Modal: Web3Modal
  private client: Client = new Client()
  private pairing: PairingTypes.Struct[] = []
  private session: SessionTypes.Struct | undefined
  private chain: ChainData['id']
  private accounts: string[] = []
  private relayUrl: string

  constructor({ projectId, relayUrl, metadata, network }: Props) {
    super()
    this.projectId = projectId
    this.chain =
      network === 'mainnet'
        ? mainnet.id
        : network === 'testnet'
        ? testnet.id
        : network === 'devnet'
        ? devnet.id
        : `xrpl:${network}`
    this.relayUrl = relayUrl
    this.web3Modal = new Web3Modal({
      projectId: this.projectId,
      themeMode: 'light',
      walletConnectVersion: 2,
      explorerRecommendedWalletIds: [
        // Bifrost Wallet
        '37a686ab6223cd42e2886ed6e5477fce100a4fb565dcd57ed4f81f7c12e93053',
      ],
    })
    Client.init({
      logger: DEFAULT_LOGGER,
      relayUrl: relayUrl,
      projectId,
      metadata: getAppMetadata() || metadata,
    }).then((_client) => {
      this.client = _client
      this._subscribeToEvents()
      this._checkPersistedState()
    })
  }

  // createClient = async () => {
  //     prevRelayerValue.current = relayerRegion;
  // }

  private _subscribeToEvents = () => {
    if (typeof this.client === 'undefined') {
      throw new Error('WalletConnect is not initialized')
    }
    this.client.on('session_ping', (args) => {
      console.log('EVENT', 'session_ping', args)
    })
    this.client.on('session_event', (args) => {
      console.log('EVENT', 'session_event', args)
    })
    this.client.on('session_update', ({ topic, params }) => {
      console.log('EVENT', 'session_update', { topic, params })
      const { namespaces } = params
      const _session = this.client.session.get(topic)
      const updatedSession = { ..._session, namespaces }
      this.onSessionConnected(updatedSession)
      this.emit(EVENTS.CONNECTED)
    })

    this.client.on('session_delete', () => {
      console.log('EVENT', 'session_delete')
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
    console.log('RESTORED PAIRINGS: ', this.client.pairing.getAll({ active: true }))

    if (typeof this.session !== 'undefined') return
    // populates (the last) existing session to state
    if (this.client.session.length) {
      const lastKeyIndex = this.client.session.keys.length - 1
      const _session = this.client.session.get(this.client.session.keys[lastKeyIndex])
      console.log('RESTORED SESSION:', _session)
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
    this.chain = allNamespaceChains[0]
    this.accounts = [...new Set(allNamespaceAccounts)]
    if (this.accounts.length) {
      this.emit(EVENTS.ACCOUNT_CHANGED, await this.getAddress())
    } else {
      this.emit(EVENTS.ACCOUNT_CHANGED, null)
    }
    const network = await this.getNetwork()
    if (network) this.emit(EVENTS.NETWORK_CHANGED, network)
  }

  reset = () => {
    this.session = undefined
    this.accounts = []
    this.chain = this.chain
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
    console.log('connect, pairing topic is:', this.pairing[0]?.topic)
    try {
      const requiredNamespaces = getRequiredNamespaces([this.chain])
      const optionalNamespaces = getOptionalNamespaces([this.chain])
      console.log('requiredNamespaces config for connect:', requiredNamespaces)

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

        this.web3Modal.openModal({ uri, standaloneChains })
      }

      const session = await approval()
      console.log('Established session:', session)
      await this.onSessionConnected(session)
      // Update known pairings after session is connected.
      this.pairing = this.client.pairing.getAll({ active: true })
      this.emit(EVENTS.CONNECTED)
      const network = await this.getNetwork()
      if (network) {
        this.emit(EVENTS.NETWORK_CHANGED, network)
      }
      return true
    } catch (e) {
      console.error(e)
      this.emit(EVENTS.DISCONNECTED)
      return false
      // ignore rejection
    } finally {
      // close modal in case it was open
      this.web3Modal.closeModal()
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

  getNetwork = async () => {
    const networkId = this.chain.split(':')[1]
    if (networkId === '0') return { server: 'mainnet' }
    if (networkId === '1') return { server: 'testnet' }
    if (networkId === '2') return { server: 'devnet' }
    return null
  }

  sign = async (txjson: Record<string, any>, option?: SignOption) => {
    const result = await this.client!.request<{ tx_json: Record<string, any> }>({
      chainId: this.chain,
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
    const result = await this.client!.request<{ tx_json: Record<string, any> }>({
      chainId: this.chain,
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
