const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

const peers = {};
let myVideoStream;

// Demande d'autorisation sur le Webcam et le Micro
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      })
    })

    socket.on("user-conected", (userId) => {
      connectToNewUSer(userId, stream);
    });

    // input value
    let msg = $("input");

    // when press enter send message
    $("html").keydown((e) => {
      if (e.which == 13 && msg.val().length !== 0) {
        socket.emit("message", msg.val());
        msg.val("");
      }
    });

    socket.on("createMessage", (message) => {
      $(".messages").append(
        `<li class="message"><b>user</b><br/>${message}</li>`
      );
      scrollToBottom();
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUSer = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  call.on("close", () => {
    video.remove();
  })

  peers[userId] = call;
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const scrollToBottom = () => {
  var d = $(".main__chat__window");
  d.scrollTop(d.prop("scrollHeight"));
};

// Mute video
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = '<i class="fas fa-microphone"></i> <span>Mute</span>';
  document.querySelector(".main__mute__button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html =
    '<i class="unmute fas fa-microphone-slash"></i> <span>Unmute</span>';
  document.querySelector(".main__mute__button").innerHTML = html;
};

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setPlayVideo = () => {
  const html =
    '<i class="stop fas fa-video-slash"></i> <span>Play video</span>';
  document.querySelector(".main__video__button").innerHTML = html;
};

const setStopVideo = () => {
  const html = '<i class="fas fa-video"></i> <span>Stop video</span>';
  document.querySelector(".main__video__button").innerHTML = html;
};
