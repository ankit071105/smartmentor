// Initialize video elements and the whiteboard canvas
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const whiteboard = document.getElementById('whiteboard');
const canvasContext = whiteboard.getContext('2d');
let isDrawing = false;
let isTextMode = false;
let currentPenStyle = { width: 3, color: '#000000' };
let isErasing = false;
let textFont = 'Arial';
let mediaRecorder;
let recordedChunks = [];

// Handle local video stream
async function startVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = stream;
    return stream;
}

// Handle screen sharing
async function startScreenSharing() {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    remoteVideo.srcObject = stream;
}

// Handle whiteboard drawing
whiteboard.addEventListener('mousedown', (e) => {
    if (isTextMode) {
        addText(e.offsetX, e.offsetY);
        return;
    }
    isDrawing = true;
    canvasContext.beginPath();
    canvasContext.moveTo(e.offsetX, e.offsetY);
});

whiteboard.addEventListener('mousemove', (e) => {
    if (isDrawing && !isTextMode) {
        canvasContext.lineTo(e.offsetX, e.offsetY);
        canvasContext.stroke();
    }
});

whiteboard.addEventListener('mouseup', () => {
    isDrawing = false;
});

document.getElementById('clear-board').addEventListener('click', () => {
    canvasContext.clearRect(0, 0, whiteboard.width, whiteboard.height);
});

// Add text to the whiteboard
function addText(x, y) {
    const text = prompt('Enter your text:', 'Text here');
    if (text) {
        canvasContext.font = `20px ${textFont}`;
        canvasContext.fillStyle = '#000000';
        canvasContext.fillText(text, x, y);
    }
}

// File upload handler for PDFs
document.getElementById('file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        const fileReader = new FileReader();
        fileReader.onload = () => {
            const arrayBuffer = fileReader.result;
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const iframe = document.getElementById('pdf-frame');
            iframe.src = url;
            iframe.style.display = 'block';  // Show PDF viewer
        };
        fileReader.readAsArrayBuffer(file);
    }
});

// Start recording functionality
document.getElementById('start-recording-btn').addEventListener('click', () => {
    const stream = localVideo.srcObject;
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = []; // Clear previous chunks

    mediaRecorder.ondataavailable = (event) => {
        recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const videoURL = URL.createObjectURL(blob);
        showDownloadLink(videoURL); // Show download link for the user to save the file
    };

    mediaRecorder.start();
    alert("Recording Started!");
});

// Stop recording functionality
document.getElementById('stop-recording-btn').addEventListener('click', () => {
    if (mediaRecorder) {
        mediaRecorder.stop();
        alert("Recording Stopped!");
    }
});

// Show the download link after recording
function showDownloadLink(videoURL) {
    // Create the download link dynamically
    const downloadLinkContainer = document.createElement('div');
    downloadLinkContainer.innerHTML = `
        <p>Recording completed. You can download your lecture video below:</p>
        <a href="${videoURL}" download="lecture_recording.webm" class="download-link">Download Recording</a>
    `;

    // Append the download link container to the body or another specific container
    document.body.appendChild(downloadLinkContainer);
}

// Start video stream and initialize event listeners
window.onload = () => {
    startVideo();
    document.getElementById('share-screen-btn').addEventListener('click', startScreenSharing);
};

// Handle pen, marker, eraser, and text mode selection
document.getElementById('pen-tool').addEventListener('click', () => {
    currentPenStyle = { width: 3, color: '#000000' }; // Pen tool
    isErasing = false;
    isTextMode = false;
});

document.getElementById('marker-tool').addEventListener('click', () => {
    currentPenStyle = { width: 8, color: '#000000' }; // Marker tool
    isErasing = false;
    isTextMode = false;
});

document.getElementById('eraser-tool').addEventListener('click', () => {
    isErasing = true;
    isTextMode = false;
});

document.getElementById('text-tool').addEventListener('click', () => {
    isTextMode = true;
    isErasing = false;
});

// Font family selection for text
document.getElementById('font-family').addEventListener('change', (e) => {
    textFont = e.target.value;
});

// Drawing with pen or marker tool
whiteboard.addEventListener('mousedown', (e) => {
    if (isErasing) {
        canvasContext.clearRect(e.offsetX, e.offsetY, 20, 20); // Clear small area for erasing
    }
});
