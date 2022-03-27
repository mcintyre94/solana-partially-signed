# Example of sending an SPL token in a partially signed Solana transaction

This repo contains a trivial example of creating a transaction where one party sends SOL to the other, and receives an SPL token in response.

It includes a UI at `/` and an API at `/api/makeTransaction.ts`. The UI contains a Solana wallet connect button, and another button which calls the API and then sends the returned transaction to the connected wallet.

## Environment Variables

- `RECIPIENT_PRIVATE_KEY` is the private key of the Solana account that is to be paid SOL and is to send an SPL token in return
- `TOKEN_ADDRESS` is the address of the SPL token that is to be sent. The recipient must own this token or the transactions will fail

The API takes as input a JSON body:

```
{
  "account": "some public key"
}

And returns a base64 serialized transaction:

```

{
"transaction":"AgAAAAAAAAAAAAAAAAAAAAAAAA..."
}

The transaction includes 2 instructions:

- Send 0.01 SOL from the browser connected account to the recipient
- Send 1 token from the recipient to the browser connected account

The transaction is returned partially signed by the recipient account.

The API fulfils the POST request in the specification for Solana Pay transaction requests

## Wallet support

- Currently Phantom does not support partially signed transactions
- I've tested with Solflare which works correctly
- Other wallet adapters can be added in `pages/_app.tsx`
