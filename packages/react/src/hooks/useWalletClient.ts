import { useContext } from 'react'

import { walletClientContext } from '../context'

const useWalletClient = () => {
  const { walletClient, setWalletClient } = useContext(walletClientContext)

  const signOut = async () => {
    await walletClient?.signOut()
    setWalletClient(null)
  }

  return {
    walletConnected: !!walletClient,
    walletName: walletClient?.walletName,
    signIn: walletClient?.signIn,
    signOut: signOut,
  }
}

export default useWalletClient
