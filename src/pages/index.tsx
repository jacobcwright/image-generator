import Image from 'next/image'
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'

type Image = {
  name: string
  prompt: string
}

const Home: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('')
  const [images, setImages] = useState<Image[]>([])

  useEffect(() => {
    async function fetchImages() {
      const response = await fetch('/api/get-images')
      const data = await response.json()
      setImages(data.images)
    }
    fetchImages()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    }).then(async (res) => {
      const data = await res.json()
      setImages((prevImages) => [...prevImages, data])
    })
  }

  const handlePromptChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value)
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={prompt}
          onChange={handlePromptChange}
          placeholder='Enter a prompt'
        />
        <button type='submit'>Generate Image</button>
      </form>
      <div>
        {images?.map((img) => (
          <div key={img.name}>
            <Image
              src={`/images/${img.name}`}
              alt={img.prompt}
              height={256}
              width={256}
            />
            <p>{img.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
