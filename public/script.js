const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
  //443
})
let myVideoStream;
const myVideo = document.createElement('video')
myVideo.muted = true;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream)
  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
   // connectToNewUser(userId, stream)
    setTimeout(connectToNewUser,1000,userId,stream)
  })
  // input value
  let text = $("input");
  // when press enter send message
  $('html').keydown(function (e) {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', {msg:text.val(),user:window.localStorage.getItem('user')});
      text.val('')
    }
  });
  socket.on("createMessage", val => {
    $(".main__chat_window ul").append(`<li class="message"><b>${val.user}</b><br/>${val.msg}</li>`);
    scrollToBottom();
  })


  socket.on('participant_list',(user_id,user)=>{
    //console.log("yes");
    // console.log(user);
    // console.log(user_id);
    $(".main__people_window ul").append(`<li class=${user_id}>${user}</li>`);
    scrollToBottom()
  })



})

socket.on('user-disconnected', userId => {
  console.log("user_disconnected")
  if (peers[userId]) peers[userId].close();
  $('.'+userId).remove();
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id,window.localStorage.getItem('user'))
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
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



const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}


////button properties

const onOffChat=()=>{
  if($('.main__left').css("flex")[0]=='1'||$('.main__people').css("flex")[2]=='2')
  onChat();
  else offChat();
  return ;
}

const onChat=()=>{
  $('.main__right').show();
  $('.main__people').hide();
  $('.main__people').css('flex','0.1 1 0%')
  $('.main__left').css('flex','0.8 1 0%')
}


const offChat=()=>{
  $('.main__right').hide();
  $('.main__left').css('flex','1.0 1 0%')
}

$('.main__people').hide();

const onOffParticipant=()=>{
  if($('.main__left').css("flex")[0]=='1'||$('.main__people').css("flex")[2]=='1')
  onParticipant();
  else offParticipant();
  return ;
}

const onParticipant=()=>{
  $('.main__right').hide();
  $('.main__people').show();
  $('.main__people').css('flex','0.2 1 0%')
  $('.main__left').css('flex','0.8 1 0%')
}


const offParticipant=()=>{
  $('.main__people').hide();
  $('.main__people').css('flex','0.1 1 0%')
  $('.main__left').css('flex','1.0 1 0%')
}


let person="";
while(person==""||person==null)
 person = prompt("Please enter your name", "user");
window.localStorage.setItem("user",person);


const leaveRoom=()=>{
  console.log("left room");
  socket.emit("disconnected",{});
  location.reload();
}