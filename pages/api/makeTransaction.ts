import { NextApiRequest, NextApiResponse } from "next";

export default function Handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    transaction: "transaction"
  })
}
