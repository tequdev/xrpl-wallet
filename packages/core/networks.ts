import { defaultEndpoints } from 'xrpl-client'

export const networkEndpoints = {
  mainnet: defaultEndpoints,
  testnet: ['wss://testnet.xrpl-labs.com', 'wss://alt.devnet.rippletest.net:51233'],
  devnet: ['wss://s.altnet.rippletest.net:51233'],
}
