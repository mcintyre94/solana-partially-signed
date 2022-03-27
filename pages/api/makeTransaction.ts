import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import base58 from "bs58";
import { NextApiRequest, NextApiResponse } from "next";

export default async function Handler(req: NextApiRequest, res: NextApiResponse) {
  // The transaction is for SOL from sender -> recipient
  // We additionally send an SPL token from recipient -> sender

  // Load the recipient keypair from their private key in environment variables
  const recipientPrivateKey = process.env.RECIPIENT_PRIVATE_KEY as string
  if (!recipientPrivateKey) {
    res.status(500).json({ error: "Recipient private key not available" })
  }
  const recipientKeypair = Keypair.fromSecretKey(base58.decode(recipientPrivateKey))

  // Load the token address from environment variable
  // This is the token sent from the recipient to the sender of the SOL payment
  const tokenAddress = new PublicKey(process.env.TOKEN_ADDRESS as string)

  // Load the sender public key from the request
  const { account } = JSON.parse(req.body)
  if (!account) {
    res.status(500).json({ error: "No account provided" })
    return
  }
  const senderPublicKey = new PublicKey(account)

  // Create a connection to Solana network
  const connection = new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet))

  // Get the sender and recipient token accounts
  // Sender one may not exist, so we create it (which costs SOL) as the recipient account if it doesn't 
  const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    recipientKeypair, // recipient pays the fee to create it
    tokenAddress, // which token the account is for
    senderPublicKey, // who the token account is for
  )

  const recipientTokenAddress = await getAssociatedTokenAddress(tokenAddress, recipientKeypair.publicKey)

  // Get the details about the token mint
  const tokenMint = await getMint(connection, tokenAddress)

  // Get a recent blockhash to include in the transaction
  const { blockhash } = await (connection.getLatestBlockhash('finalized'))

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    // The sender pays the transaction fee
    feePayer: senderPublicKey,
  })

  // Transfer 0.01 SOL from sender -> recipient
  transaction.add(SystemProgram.transfer({
    fromPubkey: senderPublicKey,
    toPubkey: recipientKeypair.publicKey,
    lamports: 0.01 * LAMPORTS_PER_SOL
  }))

  // Transfer 1 token from recipient -> sender
  transaction.add(createTransferCheckedInstruction(
    recipientTokenAddress, // source
    tokenAddress, // mint
    senderTokenAccount.address, // destination
    recipientKeypair.publicKey, // owner of source account
    1 * (10 ** tokenMint.decimals), // amount to transfer
    tokenMint.decimals, // decimals of token
  ))

  // Partial sign as recipient
  transaction.partialSign(recipientKeypair)

  // Serialize the transaction and convert to base64 to return it
  const serializedTransaction = transaction.serialize({
    // We will need the sender to sign this transaction after it's returned to them
    requireAllSignatures: false
  })
  const base64 = serializedTransaction.toString('base64')

  return res.status(200).json({
    transaction: base64,
  })
}
