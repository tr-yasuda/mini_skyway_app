'use client'

import React from 'react'
import { Container, Text } from '@mantine/core'
import { useSearchParams } from 'next/navigation'
import { io } from 'socket.io-client'

const socket = io('http://localhost:5500')
export default function Calls() {
  const roomName = useSearchParams().get('roomName')
  const peer = React.useMemo(
    () => new RTCPeerConnection({ iceServers: [] }),
    []
  )

  const myVideo: React.LegacyRef<HTMLVideoElement> = React.useRef(null)
  const userVideo: React.LegacyRef<HTMLVideoElement> = React.useRef(null)

  React.useEffect(() => {
    // peer 接続準備

    // クエリなかったらトップページに戻す
    if (!roomName) {
      window.location.href = '/'
    }

    // サーバーに接続したことを確認
    socket.on('connect', () => {
      // サーバーのルームに参加
      socket.emit('join', roomName)
      console.log(`joined room: ${roomName}`, socket.id)
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
      // peer create offer
      peer
        .createOffer()
        .then((session) => {
          // ローカルセッションを peer に読み込ませる。
          console.log('created local sdp')
          return peer.setLocalDescription(session)
        })
        .catch((error) => {
          console.error(`error: cannot set local description ${error}`)
        })
        .then(() => {
          socket.emit('callUser', {
            signal: peer.localDescription,
            from: socket.id
          })
          console.log('sent peer call user.')
        })
        .catch((error) => {
          console.error(`error: cannot create offer ${error}`)
        })

      // 電話してきたユーザーの情報を取得
      socket.on(
        'callUser',
        (data: { signal: RTCSessionDescription; from: string }) => {
          console.log('received call user signal')
          peer
            .setRemoteDescription(data.signal)
            .then(() => {
              console.log('success set remote description')
              peer
                .createAnswer()
                .then((answer) => {
                  socket.emit('answerCall', {
                    signal: answer,
                    from: socket.id
                  })
                  console.log('send answer call')
                })
                .catch((error) => {
                  console.error(`error : cannot send answer ${error}`)
                })
            })
            .catch((error) => {
              console.error(`error : cannot set remote description ${error}`)
            })
        }
      )

      // 電話を受け取ったユーザーからシグナルを受け取る
      socket.on(
        'callAccepted',
        (data: { signal: RTCSessionDescription; from: string }) => {
          console.log('call accepted')
          peer
            .setRemoteDescription(data.signal)
            .then(() => {
              console.log('success set remote description')
            })
            .catch((error) => {
              console.error(`error : cannot set remote description ${error}`)
            })
        }
      )
    })

    peer.ontrack = (e) => {
      ;(userVideo.current as HTMLVideoElement).srcObject = e.streams[0]
    }
  }, [peer, roomName])

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
      </Container>
    </div>
  )
}
