This project showcases the integration of Three.js and MediaPipe's HandLandmarker to create an interactive cube controlled by hand gestures.

Three.js
The cube is rendered using Three.js, a JavaScript library for creating 3D graphics in the browser. It utilizes WebGLRenderer to create a canvas and renders the cube with the help of BoxGeometry and MeshBasicMaterial. The cube's position and rotation are animated based on hand coordinates.

MediaPipe HandLandmarker
MediaPipe's HandLandmarker is used to detect and track hand landmarks from a webcam video feed. The HandLandmarker model is loaded and initialized to identify hand landmarks in real-time. The coordinates of the wrist point are extracted and used to control the cube's position and rotation.

Usage
Run the project in a web browser.
Click the "Enable Webcam" button to activate the webcam stream.
Hold your hand in front of the webcam to detect hand landmarks.
The cube will be animated based on the movement of your hand.
Closing your wrist will change the color of the cube.
Please note that webcam access is required for this project to function properly.

Dependencies
The project utilizes the following libraries and resources:

Three.js: JavaScript library for 3D graphics - https://threejs.org/
MediaPipe HandLandmarker: Hand tracking machine learning model - https://mediapipe.dev/
Setup and Installation
Clone the project repository.
Open the project files in a code editor.
Start a local server or use a tool like Live Server to run the project.
Access the project through the local server in a web browser.
Please ensure that you have a compatible browser with webcam support to run the project.


https://github.com/venkateshwebdev/magassesment/assets/105224564/f1aea75a-d4c2-4bec-8f08-e2fb1e3e93ee




