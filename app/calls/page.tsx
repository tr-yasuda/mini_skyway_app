'use client'

import React from 'react'
import { Button, Container, Text } from '@mantine/core'
import { useSearchParams } from 'next/navigation'
import { io } from 'socket.io-client'
import {
  getVideoStreams,
  makeConnection,
  showUserVideo
} from '@/app/api/skyway'

const socket = io('http://localhost:5500')

export default function Calls() {
  const roomName = useSearchParams().get('roomName')

  const myVideo: React.LegacyRef<HTMLVideoElement> = React.useRef(null)
  const userVideo: React.LegacyRef<HTMLVideoElement> = React.useRef(null)

  React.useEffect(() => {
    // クエリなかったらトップページに戻す
    if (!roomName) {
      window.location.href = '/'
    }
    const peer = new RTCPeerConnection({ iceServers: [] })

    socket.on('connect', () => {
      getVideoStreams(myVideo.current as HTMLVideoElement, peer)

      if (roomName) makeConnection(roomName, socket, peer)

      showUserVideo(peer, userVideo.current as HTMLVideoElement)
    })
  }, [roomName])

  const handleButton = () => {
    window.location.href = '/'
  }

  return (
    <div>
      <Container>
        <Text fz={'xl'} className={'mb-2'}>
          {roomName}
        </Text>
        <div>
          <video
            className={'w-1/2 h-80 bg-black'}
            playsInline
            muted
            autoPlay
            controls
            ref={myVideo}
          />
          <video
            className={'w-1/2 h-80 bg-black'}
            playsInline
            autoPlay
            controls
            ref={userVideo}
          />
        </div>
        <Button
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan' }}
          onClick={handleButton}
        >
          退出
        </Button>
      </Container>
    </div>
  )
}
