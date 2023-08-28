'use client'
import { XummAdaptor, CrossmarkAdaptor, WalletConnectAdaptor } from '@xrpl-wallet/adaptors'
import { useAccount, useTransaction, useWalletClient } from '@xrpl-wallet/react'
import Image from 'next/image'

export default function Home() {
  const { selectWallet, signIn, signOut, walletName, walletConnected } = useWalletClient()
  const address = useAccount()
  const transaction = useTransaction()

  const select = (adaptor: 'xumm' | 'crossmark' | 'walletconnect') => {
    console.log('connecting to', adaptor)
    if (adaptor === 'xumm') {
      const xumm = new XummAdaptor({ apiKey: '7fcb00b9-b846-4ddf-ae02-2a94f18c0b2f' })
      selectWallet(xumm)
    } else if (adaptor === 'crossmark') {
      const crossmark = new CrossmarkAdaptor()
      selectWallet(crossmark)
    } else {
      const walletconnect = new WalletConnectAdaptor({
        projectId: '85ad846d8aa771cd56c2bbbf30f7a183',
        network: 'testnet',
      })
      selectWallet(walletconnect)
    }
  }

  const sendTx = async () => {
    if (!transaction) return
    const tx = await transaction.autofill({
      TransactionType: 'Payment',
      Destination: 'rQQQrUdN1cLdNmxH4dHfKgmX5P4kf3ZrM',
      Amount: '100',
    })
    const result = await transaction.signAndSubmit(tx)
    alert(JSON.stringify(result, null, '  '))
  }
  return (
    <main className='flex min-h-screen flex-col items-center p-24'>
      <div className='relative flex place-items-center mb-16'>
        <Image
          className='relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert'
          src='/next.svg'
          alt='Next.js Logo'
          width={180}
          height={37}
          priority
        />
      </div>
      {!walletConnected && (
        <div className='flex space-x-2'>
          <button className='btn btn-outline btn-primary' onClick={() => select('xumm')}>
            Xumm
          </button>
          <button className='btn btn-outline btn-primary' onClick={() => select('crossmark')}>
            Crossmark
          </button>
          <button className='btn btn-outline btn-primary' onClick={() => select('walletconnect')}>
            WalletConnect
          </button>
        </div>
      )}
      {walletConnected && (
        <>
          <div className='flex space-x-2 mb-8'>
            {address ? (
              <button className='btn btn-outline btn-primary' onClick={signOut}>
                SignOut
              </button>
            ) : (
              <button className='btn btn-primary' onClick={signIn}>
                Connect to {walletName}
              </button>
            )}
          </div>
          {address && (
            <div>
              <div>{address}</div>
              <button className='btn btn-primary' onClick={sendTx}>
                Send Transaction
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
