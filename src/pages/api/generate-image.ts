// pages/api/generate-image.js
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
    res.status(500).send('API_KEY not set')
  }
  if (req.method === 'POST') {
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

    let imageName = ''

    try {
      fetch('https://api.runpod.ai/v2/stable-diffusion-v1/runsync', options)
        .then((response) => response.json())
        .then(async (response) => {
          console.log(response)
          // response.output[0].image is a url to an image
          imageName = `${Date.now()}.png`
          const imageUrl = response.output[0].image
          const imagePath = path.join(process.cwd(), 'public/images', imageName)

          // Download the image and save it locally
          const responseImage = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'stream',
          })

          const writer = fs.createWriteStream(imagePath)

          responseImage.data.pipe(writer)

          return new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
          })
        })
        .then(async () => {
          await fileMutex.runExclusive(() => {
            const currentData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
            currentData.images.push({ name: imageName, prompt })
            fs.writeFileSync(DATA_FILE, JSON.stringify(currentData))
          })

          return res.status(200).json({ imageName, prompt })
        })
        .catch((err) => console.error(err))
    } catch (error) {
      return res.status(500).send('Error generating image')
    }
  } else {
    return res.status(405).end() // Method Not Allowed
  }
}
