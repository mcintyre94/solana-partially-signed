import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Transaction } from "@solana/web3.js";


export default function IndexPage() {
  const [loading, setLoading] = useState(false)
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()

  async function handleClick() {
    setLoading(true)
    const res = await fetch(
      '/api/makeTransaction',
      {
        method: 'post',
        body: JSON.stringify({ account: publicKey.toBase58() }),
      })
    const data = await res.json()
    console.log(data.transaction)
    setLoading(false)

    const transaction = Transaction.from(Buffer.from(data.transaction, 'base64'));
    await sendTransaction(transaction, connection)
  }

  return (
    <>
      <WalletMultiButton />
      <br />
      <button type="button" onClick={handleClick}>Create Transaction</button>
      {loading && <p>Loading...</p>}
    </>
  )
}
