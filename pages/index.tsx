import { useState } from "react";

export default function IndexPage() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const res = await fetch('/api/makeTransaction', { method: 'post' })
    const data = await res.json()
    console.log(data.transaction)
    setLoading(false)
  }

  return (
    <>
      <button type="button" onClick={handleClick}>Create Transaction</button>
      {loading && <p>Loading...</p>}
    </>
  )
}
