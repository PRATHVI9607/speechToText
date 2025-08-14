document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startButton');
    const resetButton = document.getElementById('resetButton');
    const copyButton = document.getElementById('copyButton');
    const output = document.getElementById('output');
    const musicBox = document.querySelector('.music-box');
    const statusText = document.querySelector('.status-text');
    const waves = document.querySelectorAll('.wave');
    const btnText = startButton.querySelector('.btn-text');

    let isRecording = false;
    let recognition = null;
    let transcriptHistory = '';

    // Initialize speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        startButton.disabled = true;
        statusText.textContent = 'Speech recognition not supported. Please use Chrome.';
        return;
    }

    // Use the standard SpeechRecognition or the webkit prefix
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isRecording = true;
        startButton.classList.add('recording');
        btnText.textContent = 'Stop Speaking';
        musicBox.classList.add('recording');
        statusText.textContent = 'Listening to your voice...';
        animateWaves(true);
    };

    recognition.onend = () => {
        isRecording = false;
        startButton.classList.remove('recording');
        btnText.textContent = 'Start Speaking';
        musicBox.classList.remove('recording');
        statusText.textContent = 'Ready to listen...';
        animateWaves(false);
    };

    // Function to format speech with punctuation
    function formatSpeech(text) {
        // Convert spoken punctuation to symbols
        const punctuationMap = {
            'full stop': '.',
            'period': '.',
            'comma': ',',
            'question mark': '?',
            'exclamation mark': '!',
            'exclamation point': '!',
            'new line': '\n',
            'new paragraph': '\n\n'
        };

        let formattedText = text;
        Object.entries(punctuationMap).forEach(([spoken, symbol]) => {
            const regex = new RegExp(` ${spoken}`, 'gi');
            formattedText = formattedText.replace(regex, symbol);
        });

        // Capitalize first letter of sentences
        formattedText = formattedText.replace(/(^\w|\.\s+\w|\?\s+\w|\!\s+\w)/g, 
            letter => letter.toUpperCase());

        return formattedText;
    }

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            let transcript = event.results[i][0].transcript;
            
            // Format transcript with punctuation
            transcript = formatSpeech(transcript);

            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        if (finalTranscript) {
            transcriptHistory += finalTranscript;
        }

        // Get cursor position
        const selection = window.getSelection();
        const cursorPosition = selection.rangeCount > 0 ? selection.getRangeStart() : 0;

        // Update content while preserving cursor position
        const fullText = transcriptHistory + interimTranscript;
        if (fullText.trim()) {
            output.textContent = fullText;
        }

        // Restore cursor position if user was editing
        if (document.activeElement === output) {
            const range = document.createRange();
            range.setStart(output.firstChild, cursorPosition);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        const averageVolume = Array.from(event.results[event.resultIndex][0].values())
            .reduce((sum, value) => sum + Math.abs(value), 0) / event.results[event.resultIndex][0].length;
        
        animateWavesWithVolume(averageVolume);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isRecording = false;
        startButton.classList.remove('recording');
        btnText.textContent = 'Start Speaking';
        musicBox.classList.remove('recording');
        animateWaves(false);

        switch (event.error) {
            case 'not-allowed':
            case 'permission-denied':
                statusText.textContent = 'Microphone access denied. Please allow access and try again.';
                break;
            case 'no-speech':
                statusText.textContent = 'No speech detected. Please try again.';
                break;
            case 'audio-capture':
                statusText.textContent = 'No microphone found. Please connect a microphone.';
                break;
            case 'network':
                statusText.textContent = 'Network error. Please check your connection.';
                break;
            default:
                statusText.textContent = `Error: ${event.error}. Please try again.`
        }
    };

    // Handle recording with proper permission checks
    startButton.addEventListener('click', async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop());
                recognition.start();
                statusText.textContent = 'Starting...';
            } catch (err) {
                console.error('Microphone permission error:', err);
                statusText.textContent = 'Please allow microphone access';
                startButton.classList.remove('recording');
            }
        } else {
            recognition.stop();
        }
    });

    resetButton.addEventListener('click', () => {
        transcriptHistory = '';
        output.textContent = 'Your words will appear here...';
        resetButton.classList.add('active');
        setTimeout(() => resetButton.classList.remove('active'), 200);
    });

    copyButton.addEventListener('click', () => {
        const text = output.textContent;
        if (text === 'Your words will appear here...') return;

        navigator.clipboard.writeText(text)
            .then(() => {
                const originalContent = copyButton.innerHTML;
                copyButton.innerHTML = '<span class="btn-icon"></span> Copied!';
                copyButton.style.background = 'var(--success-color)';
                copyButton.style.color = 'white';
                copyButton.style.transform = 'scale(1.1)';
                
                setTimeout(() => {
                    copyButton.style.transform = 'scale(1)';
                }, 200);

                setTimeout(() => {
                    copyButton.innerHTML = originalContent;
                    copyButton.style.background = '';
                    copyButton.style.color = '';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy text:', err);
                copyButton.innerHTML = '<span class="btn-icon"></span> Failed';
                setTimeout(() => copyButton.innerHTML = originalContent, 2000);
            });
    });

    function animateWaves(isActive) {
        waves.forEach((wave, index) => {
            if (isActive) {
                wave.style.animation = `wave 1s ease infinite ${index * 0.1}s`;
            } else {
                wave.style.animation = 'none';
                wave.style.height = '20px';
            }
        });
    }

    function animateWavesWithVolume(volume) {
        if (isRecording) {
            waves.forEach((wave, index) => {
                const height = 20 + (volume * 60);
                const delay = index * 0.1;
                wave.style.height = `${Math.min(height, 80)}px`;
                wave.style.backgroundColor = `hsl(${200 + (volume * 40)}, 70%, 60%)`;
                wave.style.transition = `height 0.2s ease ${delay}s, background-color 0.2s ease ${delay}s`;
            });
        }
    }

    // Add hover effects
    [startButton, resetButton, copyButton].forEach(button => {
        button.addEventListener('mouseover', () => {
            button.style.transform = 'translateY(-2px)';
        });

        button.addEventListener('mouseout', () => {
            button.style.transform = 'translateY(0)';
        });
    });
});
