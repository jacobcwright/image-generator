import fs from 'fs/promises'
import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data.json')

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  try {
    const data = JSON.parse(await fs.readFile(DATA_FILE, 'utf8'))
    return res.status(200).json(data)
  } catch (error) {
    console.error(`Error reading file: ${error}`)
    return res.status(500).json({ error: 'Error reading data' })
  }
}
