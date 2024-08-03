from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import openai
import os
import logging

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['STATIC_FOLDER'] = 'static'

# Ensure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize OpenAI API key
openai.api_key = 'YOUR API KEY'

# Configure logging
logging.basicConfig(level=logging.DEBUG)

@app.route('/')
def index():
    return send_from_directory(app.config['STATIC_FOLDER'], 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.config['STATIC_FOLDER'], path)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({"error": "No audio file provided"}), 400

        audio_file = request.files['audio']
        filename = secure_filename(audio_file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        audio_file.save(filepath)

        # Use OpenAI's Whisper API to transcribe the audio
        with open(filepath, 'rb') as f:
            response = openai.Audio.transcribe(model="whisper-1", file=f)

        transcription = response['text']
        return jsonify({"transcription": transcription})
    except Exception as e:
        logging.error("Error during transcription: %s", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
