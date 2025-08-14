from flask import Flask, render_template, jsonify, request
import os
import json
from datetime import datetime

app = Flask(__name__)

# Store version info
VERSION = "1.0.0"

@app.route('/')
def home():
    return render_template('index.html', version=VERSION)

@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'message': 'Speech to text service is running',
        'version': VERSION,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/check_update')
def check_update():
    from update_checker import check_for_updates
    check_for_updates()
    return '', 204

@app.route('/export', methods=['POST'])
def export_text():
    try:
        data = request.get_json()
        text = data.get('text', '')
        filename = f"speech_text_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        
        # Save in user's documents folder
        docs_path = os.path.expanduser('~/Documents/SpeechToText')
        os.makedirs(docs_path, exist_ok=True)
        
        with open(os.path.join(docs_path, filename), 'w', encoding='utf-8') as f:
            f.write(text)
            
        return jsonify({
            'success': True,
            'filename': filename,
            'path': docs_path
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
