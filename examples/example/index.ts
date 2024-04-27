import { LocalAdaptor } from '@xrpl-wallet/adaptors'
import { WalletClient } from '@xrpl-wallet/core'

const adaptor = new LocalAdaptor({ seed: 'sEd7eh36RfjZMxfN6zJ72wT9bCF3FCV' })
const walletClient = new WalletClient(adaptor)

const main = async () => {
  await walletClient.signIn()
  console.log(await walletClient.getAddress())

  const tx = await walletClient.autofill({
    TransactionType: 'AccountSet',
  })
  const result = await walletClient.sign(tx)
  console.log(result)
  const submitResult = await walletClient.submit(result!.tx_blob)
  console.log(submitResult)
}

main()
