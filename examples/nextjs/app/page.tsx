'use client'
import Image from 'next/image'
import { XummAdaptor, CrossmarkAdaptor } from '@xrpl-wallet/adaptors'
import { useAccount, useTransaction, useWalletClient } from '@xrpl-wallet/react'

export default function Home() {
  const { selectWallet, signIn: signInWallet, signOut: signOutWallet, walletName, walletConnected } = useWalletClient()
  const address = useAccount()
  const txn = useTransaction()

  const select = (adaptor: 'xumm' | 'crossmark') => {
    console.log('connecting to', adaptor)
    if (adaptor === 'xumm') {
      const xumm = new XummAdaptor({ apiKey: 'api-key'})
      selectWallet(xumm)
    } else {
      const crossmark = new CrossmarkAdaptor()
      selectWallet(crossmark)
    }
  }

  const signIn = async () => {
    await signInWallet!()
  }
  const signOut = async () => {
    await signOutWallet!()
  }
  const sendTx = async () => {
    const tx = await txn!.autofill({ TransactionType: 'AccountSet' })
    const result = await txn!.signAndSubmit(tx)
    alert(JSON.stringify(result, null, '  '))
  }
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="relative flex place-items-center mb-16">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>
      {!walletConnected &&
        <div className='flex space-x-2'>
          <button className='btn btn-outline btn-primary' onClick={() => select('xumm')}>Xumm</button>
          <button className='btn btn-outline btn-primary' onClick={() => select('crossmark')}>Crossmark</button>
        </div>
      }
      {walletConnected &&
        <>
          <div className='flex space-x-2 mb-8'>
            {address ?
              <button className='btn btn-outline btn-primary' onClick={signOut}>SignOut</button>
              :
              <button className='btn btn-primary' onClick={signIn}>Connect to {walletName}</button>
            }
          </div>
          {address &&
            <div>
              <div>{address}</div>
              <button className='btn btn-primary' onClick={sendTx}>Send Transaction</button>
            </div>
          }
        </>
      }

    </main>
  )
}
