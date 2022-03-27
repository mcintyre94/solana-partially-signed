import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from '@solana/wallet-adapter-react'


export default function IndexPage() {
  const [loading, setLoading] = useState(false)
  const { publicKey, sendTransaction } = useWallet()

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
