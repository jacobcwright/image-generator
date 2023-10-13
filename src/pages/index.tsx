import Image from 'next/image'
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Image = {
  name: string
  prompt: string
}

const Home: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false)
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
    setPrompt('')
  }

  const handlePromptChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value)
  }

  return (
    <div className='w-full flex-col items-center justify-center h-full p-8'>
      <h1 className='text-6xl text-center mb-4 font-mono'>
        Unstable Compressor
      </h1>
      <form
        onSubmit={handleSubmit}
        className='w-full flex flex-col gap-4 justify-center items-center'
      >
        <Input
          value={prompt}
          onChange={handlePromptChange}
          placeholder='Describe your image...'
          className='w-1/2 '
        />
        <Button type='submit'>Generate Image</Button>
      </form>
      <div className='mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8'>
        {images.map((img) => (
          <div key={img.name}>
            <div className='relative'>
              <div className='relative h-72 w-full overflow-hidden rounded-lg'>
                <img
                  src={`/images/${img.name}`}
                  alt={img.prompt}
                  className='h-full w-full object-cover object-center'
                />
              </div>
              <div className='relative mt-4'>
                <h3 className='text-sm font-medium text-gray-900'>
                  {img.prompt}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home
