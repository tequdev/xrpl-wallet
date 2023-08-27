import { useContext } from 'react'

import { walletClientContext } from '../context'

const useWalletClient = () => {
  const { walletClient, selectWallet } = useContext(walletClientContext)

  return {
    walletConnected: !!walletClient,
    walletName: walletClient?.walletName,
    signIn: walletClient?.signIn,
    signOut: walletClient?.signOut,
    selectWallet,
  }
}

export default useWalletClient
