import { WalletAdaptor, WalletClient } from '@xrpl-wallet/core'
import { useContext, useEffect } from 'react'

import { walletClientContext } from '../../context'
import { connectContext } from '../../context/ConnectContext'
import { Dialog } from '../Dialog'

export const ConnectModal = () => {
  const { adaptors, status, close } = useContext(connectContext)
  const { walletClient, setWalletClient } = useContext(walletClientContext)

  const connectWallet = async (adaptor: WalletAdaptor) => {
    setWalletClient(new WalletClient(adaptor))
  }

  useEffect(() => {
    const f = async () => {
      if (walletClient && !(await walletClient.getAddress())) {
        if (!(await walletClient.signIn())) {
          setWalletClient(null)
        }
      }
      close()
    }
    f()
  }, [walletClient])

  return status === 'open' ? (
    <Dialog>
      {adaptors.map((adaptor) => (
        <div key={adaptor.name} onClick={() => connectWallet(adaptor)}>
          {adaptor.name}
        </div>
      ))}
    </Dialog>
  ) : null
}
