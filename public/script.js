const socket = io('/')
const videoGrid = document.getElementById('video-grid')

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => { 
  console.log('Stream is ready!!')
  addVideoStream(myVideo, stream)

  const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
  })
  myPeer.on('open', id => {
    console.log('Peer is Open (Ready)')
    socket.emit('join-room', ROOM_ID, id)
  })
  myPeer.on('call', call => { 
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      console.log('streem recieved')
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    console.log('user connected recieved')
    connectToNewUser(userId, stream, myPeer)
    
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})



function connectToNewUser(userId, stream, myPeer) { 
  console.log('connectToNewUser()')
  const call = myPeer.call(userId, stream)
  console.log(call)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}



