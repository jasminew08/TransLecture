let isRecording = false;
let mediaRecorder;
let audioChunks = [];

document.getElementById('recordButton').addEventListener('click', async () => {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

async function startRecording() {
    isRecording = true;
    document.getElementById('recordButton').textContent = 'Stop Recording';
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        audioChunks = [];
        sendData(audioBlob);
    };

    mediaRecorder.start();
}

function stopRecording() {
    isRecording = false;
    document.getElementById('recordButton').textContent = 'Start Recording';
    mediaRecorder.stop();
}

function sendData(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');  // Specify the filename

    fetch('/transcribe', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('transcriptionText').textContent = data.transcription || data.error;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('transcriptionText').textContent = 'An error occurred during transcription.';
    });
}
