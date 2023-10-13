import { Mutex } from 'async-mutex'
import fs from 'fs'
import path from 'path'
import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

const DATA_FILE = path.join(process.cwd(), 'data.json')
const fileMutex = new Mutex()

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const API_KEY = process.env.API_KEY || ''
  if (!API_KEY) {
    return res.status(500).send('API_KEY not set')
  }

  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const { prompt } = req.body
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: API_KEY,
    },
    body: JSON.stringify({
      input: {
        prompt: prompt,
        width: 512,
        height: 512,
        guidance_scale: 7.5,
        num_inference_steps: 50,
        num_outputs: 1,
        prompt_strength: 1,
        scheduler: 'KLMS',
      },
    }),
  }

  try {
    const response = await fetch(
      'https://api.runpod.ai/v2/stable-diffusion-v1/runsync',
      options
    )
    const data = await response.json()

    const imageName = `${Date.now()}.png`
    const imageUrl = data.output[0].image
    const imagePath = path.join(process.cwd(), 'public/images', imageName)

    const responseImage = await axios({
      url: imageUrl,
      method: 'GET',
      responseType: 'stream',
    })

    const writer = fs.createWriteStream(imagePath)
    responseImage.data.pipe(writer)

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })

    await fileMutex.runExclusive(() => {
      const currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
      currentData.images.push({ name: imageName, prompt })
      fs.writeFileSync(DATA_FILE, JSON.stringify(currentData))
    })

    return res.status(200).json({ imageName, prompt })
  } catch (error) {
    console.error(error)
    return res.status(500).send('Error generating image')
  }
}
