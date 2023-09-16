'use client'
import { useAccount, useTransaction, useWalletClient, ConnectButton } from '@xrpl-wallet/react'
import Image from 'next/image'

export default function Home() {
  const { signOut, walletConnected } = useWalletClient()
  const address = useAccount()
  const transaction = useTransaction()

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
          <ConnectButton />
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
              <button className='btn btn-ghost'>
                <span className='loading loading-lg' />
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
