import { DefaultEventsMap } from '@socket.io/component-emitter'
import { Socket } from 'socket.io-client'

export const getVideoStreams = (
  myVideo: HTMLVideoElement,
  peer: RTCPeerConnection
) => {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: true })
    .then((stream) => {
      // videoフレームに出力
      myVideo.srcObject = stream
      // trackをpeerにアタッチ
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream)
      })
    })
    .catch((error) => {
      console.error(`error: cannot get local video stream ${error}`)
    })
  console.log('attached local video')
}

const callUser = (
  peer: RTCPeerConnection,
  socket: Socket<DefaultEventsMap, DefaultEventsMap>
) => {
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
}

const answerCall = (
  peer: RTCPeerConnection,
  socket: Socket<DefaultEventsMap, DefaultEventsMap>
) => {
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
}

const acceptCall = (
  peer: RTCPeerConnection,
  socket: Socket<DefaultEventsMap, DefaultEventsMap>
) => {
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
}

const icecandidate = (
  peer: RTCPeerConnection,
  socket: Socket<DefaultEventsMap, DefaultEventsMap>
) => {
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
}

export const makeConnection = (
  roomName: string,
  socket: Socket<DefaultEventsMap, DefaultEventsMap>,
  peer: RTCPeerConnection
) => {
  socket.emit('join', roomName)
  console.log(`joined room: ${roomName}`, socket.id)

  // まずは電話をかける。(sdpなし)
  socket.emit('callUser', { from: socket.id })

  callUser(peer, socket)
  answerCall(peer, socket)
  acceptCall(peer, socket)
  icecandidate(peer, socket)
}

export const showUserVideo = (
  peer: RTCPeerConnection,
  userVideo: HTMLVideoElement
) => {
  peer.ontrack = (e) => {
    userVideo.srcObject = e.streams[0]
  }
}
