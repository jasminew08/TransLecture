document.addEventListener("DOMContentLoaded", function() {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const audioPlayback = document.getElementById('audioPlayback');

    let mediaRecorder;
    let audioChunks = [];

    startBtn.addEventListener('click', async () => {
        startBtn.disabled = true;
        stopBtn.disabled = false;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioPlayback.src = audioUrl;
                audioChunks = [];
                console.log(audioUrl);
            };
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    });

    stopBtn.addEventListener('click', () => {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        mediaRecorder.stop();
    });
});

function transcribe(){
    const openai = new OpenAI("sk-proj-7Ujr57nDMAHc3trQhqPCT3BlbkFJXhVrazzqxoKOZwjScixO");

    async function main() {
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(),
        model: "whisper-1",
      });

      console.log(transcription.text);
    }
    main();
}
