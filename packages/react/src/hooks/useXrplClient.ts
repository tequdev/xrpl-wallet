import { useContext } from "react"
import { walletClientContext } from "../context"
import { WalletClient } from "@xrpl-wallet/core"

const useXrplClient = (): (typeof WalletClient)['prototype']['xrplClient'] | null => {
  const { walletClient } = useContext(walletClientContext)
  
  if(!walletClient) return null
  
  return walletClient.xrplClient
}

export default useXrplClient
