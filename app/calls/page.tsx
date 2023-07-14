'use client'

import React from 'react'
import { Button, Container, Text } from '@mantine/core'
import { useRouter, useSearchParams } from 'next/navigation'
import { io } from 'socket.io-client'

const socket = io('http://localhost:5500')
export default function Calls() {
  const roomName = useSearchParams().get('roomName')
  const peer = React.useMemo(
    () => new RTCPeerConnection({ iceServers: [] }),
    []
  )
  const router = useRouter()

  const myVideo: React.LegacyRef<HTMLVideoElement> = React.useRef(null)
  const userVideo: React.LegacyRef<HTMLVideoElement> = React.useRef(null)

  React.useEffect(() => {
    // クエリなかったらトップページに戻す
    if (!roomName) {
      router.push('/')
    }
    // メディア情報取得
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // videoフレームに出力
        ;(myVideo.current as HTMLVideoElement).srcObject = stream
        // trackをpeerにアタッチ
        stream.getTracks().forEach((track) => {
          peer.addTrack(track, stream)
        })
      })
      .catch((error) => {
        console.error(`error: cannot get local video stream ${error}`)
      })
    console.log('attached local video')

    // サーバーに接続したことを確認
    socket.on('connect', () => {
      // サーバーのルームに参加
      socket.emit('join', roomName)
      console.log(`joined room: ${roomName}`, socket.id)

      // まずは電話をかける。(sdpなし)
      socket.emit('callUser', { from: socket.id })

      // 電話してきたユーザーの情報を取得
      socket.on('callUser', (data: { from: string }) => {
        console.log('received call user signal', data)
        peer
          .createOffer()
          .then((offer) => {
            return peer.setLocalDescription(offer)
          })
          .catch((error) => {
            console.error(`cannot create offer, ${error}`)
          })
          .then(() => {
            socket.emit('answerCall', {
              signal: peer.localDescription,
              from: socket.id
            })
          })
      })

      socket.on(
        'answerCall',
        (data: { signal: RTCSessionDescription; from: string }) => {
          console.log('received answer call', data)
          peer
            .setRemoteDescription(data.signal)
            .then(() => {
              peer
                .createAnswer()
                .then((answer) => {
                  peer
                    .setLocalDescription(answer)
                    .then(() => {
                      console.log('create answer', answer)
                      socket.emit('acceptCall', {
                        signal: answer,
                        from: socket.id
                      })
                    })
                    .catch((error) => {
                      console.error(`cannot set local description, ${error}`)
                    })
                })
                .catch((error) => {
                  console.error(`cannot create answer ${error}`)
                })
            })
            .catch((error) => {
              console.error(`cannot create answer, ${error}`)
            })
        }
      )

      socket.on(
        'acceptCall',
        (data: { signal: RTCSessionDescriptionInit; from: string }) => {
          console.log('received accept call', data)
          peer
            .setRemoteDescription(data.signal)
            .then(() => {
              console.log('connect successfully')
            })
            .catch((error) => {
              console.error(`cannot set remote description, ${error}`)
            })
        }
      )

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('icecandidate', {
            signal: event.candidate,
            from: socket.id
          })
        }
      }

      socket.on(
        'icecandidate',
        async (data: { signal: RTCIceCandidate; from: string }) => {
          console.log('accept icecandidate', data.signal)
          await peer.addIceCandidate(data.signal)
        }
      )

      peer.ontrack = (e) => {
        ;(userVideo.current as HTMLVideoElement).srcObject = e.streams[0]
      }
    })

    return peer.close()
  }, [peer, roomName, router])

  const handleButton = () => {
    router.push('/')
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
