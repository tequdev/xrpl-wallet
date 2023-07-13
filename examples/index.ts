import { WalletClient } from '@xrpl-wallet/core'
import { LocalAdaptor } from '@xrpl-wallet/adapters'

const adaptor = new LocalAdaptor({ seed: 'sEd7eh36RfjZMxfN6zJ72wT9bCF3FCV', network: 'testnet' })
const walletClient = new WalletClient(adaptor)

const main = async () => {
  await walletClient.signIn()
  console.log(await walletClient.getAddress())
  console.log(await walletClient.getNetwork())
  const result = await walletClient.signAndSubmit({
    TransactionType: 'AccountSet',
    Account: await walletClient.getAddress()
  })
  console.log(result?.hash)
}

main()
