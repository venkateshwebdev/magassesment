import {
  HandLandmarker,
  FilesetResolver,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
import * as THREE from "three";

// ---------------------------------------------------------------- THREE JS ---------------------------------------------------------------- //

// canvas for the cube
const canvas = document.querySelector("#bg");
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ alpha: true, canvas });
renderer.setClearColor(0xffffff, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio), 2);
document.body.appendChild(renderer.domElement);

// Create the cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("./spidey.jpeg");

const material = new THREE.MeshBasicMaterial({
  color: "#F8C8DC",
  map: texture,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const clock = new THREE.Clock();
camera.position.set(0, 0, 4.5);

const changeColor = "0x00ffff"; // color of the cube when wrist closed
const originalColor = "0xf8c8dc";

/** listeners for resize events and fullscreen events  */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
window.addEventListener("dblclick", () => {
  if (!document.fullscreenElement) canvas.requestFullscreen();
  else document.exitFullscreen();
});

/** Function that animates the cube, i.e moves the cubes based on the hand coordinates */
const animate = (x, y, z) => {
  const time = clock.getElapsedTime();
  // rotation
  cube.rotation.x = time;
  cube.rotation.y = time / Math.PI;
  // cube positioning
  cube.position.x = -x / 7;
  cube.position.y = -y / 20;
  // change color based on wrist state
  if (z < 0) cube.material.color.setHex(changeColor);
  else cube.material.color.setHex(originalColor);
  // render the updated scene.
  renderer.render(scene, camera);
};

// ---------------------------------------------------------------- MEDIA PIPE ---------------------------------------------------------------- //

let handLandmarker = undefined;
let enableWebcamButton;
let webcamRunning = false;
const loadingScreen = document.getElementById("loadingscreen");

// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 1,
  });
  loadingScreen.classList.remove("invisible");
  loadingScreen.style.display = "none";
};
createHandLandmarker();

const content = document.querySelector(".content");
const cameraLoading = document.querySelector("#camera-init");

const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");

// Check if webcam access is supported.
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start detection.
function enableCam() {
  if (!handLandmarker) {
    console.log("Wait! objectDetector not loaded yet.");
    return;
  }

  if (webcamRunning === true) {
    webcamRunning = false;
  } else {
    webcamRunning = true;
  }

  if (enableWebcamButton) enableWebcamButton.style.display = "none";
  if (enableWebcamButton) content.style.display = "none";

  cameraLoading.style.display = "grid";

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    cameraLoading.style.display = "none";
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

let lastVideoTime = -1;
let results = undefined;

async function predictWebcam() {
  // set the canvas width to video dimensions
  canvasElement.style.width = video.videoWidth;
  canvasElement.style.height = video.videoHeight;
  canvasElement.width = video.videoWidth;
  canvasElement.height = video.videoHeight;

  // Now let's start detecting the stream.
  let startTimeMs = performance.now();
  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;
    results = handLandmarker.detectForVideo(video, startTimeMs);
  }

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

  if (results.landmarks) {
    for (const landmarks of results.landmarks) {
      // get the wrist point coordinates. ( for this case we kept wrist point as origin )
      const X = Math.floor(landmarks[0].x * 100);
      const Y = Math.floor(landmarks[0].y * 100);
      const Z = Math.floor(landmarks[0].z);

      // call the animate function of the cube.
      animate(X - 50, Y - 50, Z);

      // draw vectors for the hand.
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
        color: "#00FF00",
        lineWidth: 5,
      });
      drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
    }
  }
  canvasCtx.restore();

  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}
