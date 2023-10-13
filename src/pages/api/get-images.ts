import fs from 'fs'
import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data.json')

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
    return res.status(200).json(data)
  } else {
    return res.status(405).end() // Method Not Allowed
  }
}
