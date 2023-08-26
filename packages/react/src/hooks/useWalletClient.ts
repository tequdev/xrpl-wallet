import { walletClientContext } from '../context'

import { useContext } from "react"

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
