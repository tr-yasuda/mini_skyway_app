'use client'

import { Button, Container, TextInput } from '@mantine/core'
import React from 'react'
import { Footer } from '@/app/Footer'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [roomName, setRoomName] = React.useState('')
  const handleConnectButton = () => {
    router.push(`/calls?roomName=${roomName}`)
  }

  return (
    <main>
      <Container>
        <TextInput
          placeholder={'e.g.) 通話用ルーム'}
          label={'Room Name'}
          withAsterisk
          error={roomName.length === 0 ? 'ルーム名を入力してください' : ''}
          value={roomName}
          onChange={(event) => setRoomName(event.currentTarget.value)}
          rightSection={
            <Button
              variant="gradient"
              gradient={{ from: 'indigo', to: 'cyan' }}
              disabled={roomName.length === 0}
              onClick={handleConnectButton}
            >
              参加
            </Button>
          }
        />
      </Container>
      <Footer />
    </main>
  )
}
