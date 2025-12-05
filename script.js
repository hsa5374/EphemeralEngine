document.addEventListener('DOMContentLoaded', function() {
    // State management
    const state = {
        currentMode: 'text',
        currentInput: '',
        currentAlgorithm: null,
        isProcessing: false,
        audioChunks: [],
        mediaRecorder: null,
        audioBlob: null,
        recordingInterval: null,
        recordingSeconds: 0,
        decayInterval: null,
        integrity: 100,
        drawingData: null
    };

    // DOM Elements
    const modeButtons = document.querySelectorAll('.mode-btn');
    const inputAreas = document.querySelectorAll('.input-area');
    const textInput = document.getElementById('textInput');
    const charCount = document.getElementById('charCount');
    const submitTextBtn = document.getElementById('submitText');
    const submitDrawingBtn = document.getElementById('submitDrawing');
    const submitVoiceBtn = document.getElementById('submitVoice');
    const displayArea = document.getElementById('displayArea');
    const processType = document.getElementById('processType');
    const processDescription = document.getElementById('processDescription');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const recordBtn = document.getElementById('recordBtn');
    const recordingTimer = document.getElementById('recordingTimer');
    const voiceStatus = document.getElementById('voiceStatus');
    const visualizer = document.getElementById('visualizer');
    const audioPlayback = document.getElementById('audioPlayback');
    const algorithmButtons = document.querySelectorAll('.algo-btn');
    const drawCanvas = document.getElementById('drawCanvas');
    const clearCanvasBtn = document.getElementById('clearCanvas');
    const brushBtn = document.getElementById('brushBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const colorPicker = document.getElementById('colorPicker');
    const brushSize = document.getElementById('brushSize');

    // Drawing context setup
    const ctx = drawCanvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentTool = 'brush';

    // Initialize visualizer bars
    for (let i = 0; i < 40; i++) {
        const bar = document.createElement('div');
        bar.className = 'visual-bar';
        bar.style.height = `${Math.random() * 30 + 10}px`;
        visualizer.appendChild(bar);
    }

    // Mode switching
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.dataset.mode;
            
            // Update active button
            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active input area
            inputAreas.forEach(area => {
                area.classList.remove('active');
                if (area.classList.contains(`${mode}-input`)) {
                    area.classList.add('active');
                }
            });
            
            state.currentMode = mode;
        });
    });

    // Character counter for text
    textInput.addEventListener('input', () => {
        const count = textInput.value.length;
        charCount.textContent = count;
        state.currentInput = textInput.value;
    });

    // Drawing functionality
    drawCanvas.addEventListener('mousedown', startDrawing);
    drawCanvas.addEventListener('mousemove', draw);
    drawCanvas.addEventListener('mouseup', stopDrawing);
    drawCanvas.addEventListener('mouseout', stopDrawing);

    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = getMousePos(e);
    }

    function draw(e) {
        if (!isDrawing) return;
        
        const [x, y] = getMousePos(e);
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        
        if (currentTool === 'eraser') {
            ctx.strokeStyle = '#000000';
        } else {
            ctx.strokeStyle = colorPicker.value;
        }
        
        ctx.lineWidth = brushSize.value;
        ctx.stroke();
        
        [lastX, lastY] = [x, y];
    }

    function stopDrawing() {
        isDrawing = false;
        state.drawingData = drawCanvas.toDataURL();
    }

    function getMousePos(e) {
        const rect = drawCanvas.getBoundingClientRect();
        return [
            e.clientX - rect.left,
            e.clientY - rect.top
        ];
    }

    // Drawing tools
    brushBtn.addEventListener('click', () => {
        currentTool = 'brush';
        brushBtn.classList.add('active');
        eraserBtn.classList.remove('active');
    });

    eraserBtn.addEventListener('click', () => {
        currentTool = 'eraser';
        eraserBtn.classList.add('active');
        brushBtn.classList.remove('active');
    });

    clearCanvasBtn.addEventListener('click', () => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
        state.drawingData = null;
    });

    // Voice recording
    recordBtn.addEventListener('mousedown', startRecording);
    recordBtn.addEventListener('mouseup', stopRecording);
    recordBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startRecording();
    });
    recordBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        stopRecording();
    });

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            state.mediaRecorder = new MediaRecorder(stream);
            state.audioChunks = [];
            
            state.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    state.audioChunks.push(event.data);
                }
            };
            
            state.mediaRecorder.onstop = () => {
                state.audioBlob = new Blob(state.audioChunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(state.audioBlob);
                audioPlayback.src = audioUrl;
                submitVoiceBtn.disabled = false;
                voiceStatus.innerHTML = '<i class="fas fa-check-circle"></i> Recording saved';
                voiceStatus.style.color = '#7fb685';
            };
            
            state.mediaRecorder.start();
            recordBtn.classList.add('recording');
            voiceStatus.innerHTML = '<i class="fas fa-circle"></i> Recording...';
            voiceStatus.style.color = '#ff6b35';
            
            // Start timer
            state.recordingSeconds = 0;
            state.recordingInterval = setInterval(() => {
                state.recordingSeconds++;
                const minutes = Math.floor(state.recordingSeconds / 60).toString().padStart(2, '0');
                const seconds = (state.recordingSeconds % 60).toString().padStart(2, '0');
                recordingTimer.textContent = `${minutes}:${seconds}`;
                
                // Update visualizer
                const bars = document.querySelectorAll('.visual-bar');
                bars.forEach(bar => {
                    bar.style.height = `${Math.random() * 70 + 10}px`;
                });
            }, 1000);
            
            // Play record sound
            document.getElementById('recordSound').play();
            
        } catch (err) {
            console.error('Error accessing microphone:', err);
            voiceStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Microphone access denied';
            voiceStatus.style.color = '#ff6b35';
        }
    }

    function stopRecording() {
        if (state.mediaRecorder && state.mediaRecorder.state === 'recording') {
            state.mediaRecorder.stop();
            recordBtn.classList.remove('recording');
            clearInterval(state.recordingInterval);
            
            // Stop all tracks
            state.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }

    // Submit handlers
    submitTextBtn.addEventListener('click', () => {
        if (textInput.value.trim()) {
            state.currentInput = textInput.value;
            startForgettingProcess('text', textInput.value);
        }
    });

    submitDrawingBtn.addEventListener('click', () => {
        if (state.drawingData) {
            startForgettingProcess('draw', state.drawingData);
        }
    });

    submitVoiceBtn.addEventListener('click', () => {
        if (state.audioBlob) {
            startForgettingProcess('voice', state.audioBlob);
        }
    });

    // Algorithm selection
    algorithmButtons.forEach(button => {
        button.addEventListener('click', () => {
            const algorithm = button.dataset.algo;
            state.currentAlgorithm = algorithm;
            
            // Visual feedback
            algorithmButtons.forEach(btn => btn.style.opacity = '0.5');
            button.style.opacity = '1';
            
            // Update process display
            processType.textContent = getAlgorithmName(algorithm);
            processDescription.textContent = getAlgorithmDescription(algorithm);
        });
    });

    // Main forgetting process
    function startForgettingProcess(type, content) {
        if (state.isProcessing) return;
        
        state.isProcessing = true;
        state.integrity = 100;
        
        // Disable inputs
        [submitTextBtn, submitDrawingBtn, submitVoiceBtn].forEach(btn => btn.disabled = true);
        modeButtons.forEach(btn => btn.disabled = true);
        algorithmButtons.forEach(btn => btn.disabled = true);
        
        // Choose algorithm if not forced
        if (!state.currentAlgorithm) {
            const algorithms = ['oral', 'sand', 'burn', 'corrupt', 'autodelete', 'hallucinate'];
            state.currentAlgorithm = algorithms[Math.floor(Math.random() * algorithms.length)];
        }
        
        // Update process display
        processType.textContent = getAlgorithmName(state.currentAlgorithm);
        processDescription.textContent = getAlgorithmDescription(state.currentAlgorithm);
        
        // Clear display area and show content
        displayArea.innerHTML = '';
        
        if (type === 'text') {
            const textDisplay = document.createElement('div');
            textDisplay.className = 'text-display';
            textDisplay.textContent = content;
            textDisplay.style.fontSize = '1.2rem';
            textDisplay.style.lineHeight = '1.6';
            textDisplay.style.padding = '1.5rem';
            displayArea.appendChild(textDisplay);
            state.displayElement = textDisplay;
        } 
        else if (type === 'draw') {
            const imgDisplay = document.createElement('img');
            imgDisplay.src = content;
            imgDisplay.style.maxWidth = '100%';
            imgDisplay.style.display = 'block';
            imgDisplay.style.margin = '0 auto';
            displayArea.appendChild(imgDisplay);
            state.displayElement = imgDisplay;
        }
        else if (type === 'voice') {
            const audioDisplay = document.createElement('audio');
            audioDisplay.controls = true;
            audioDisplay.src = URL.createObjectURL(content);
            audioDisplay.style.width = '100%';
            displayArea.appendChild(audioDisplay);
            state.displayElement = audioDisplay;
            audioDisplay.play();
        }
        
        // Start the forgetting process
        startDecayAnimation(type);
    }

    function startDecayAnimation(type) {
        const algorithm = state.currentAlgorithm;
        
        // Start progress bar
        progressBar.innerHTML = '<div class="progress-bar-inner" style="width: 100%"></div>';
        const progressInner = progressBar.querySelector('.progress-bar-inner');
        
        state.decayInterval = setInterval(() => {
            state.integrity -= 2;
            progressInner.style.width = `${state.integrity}%`;
            progressText.textContent = `Integrity: ${state.integrity}%`;
            
            if (state.integrity <= 0) {
                clearInterval(state.decayInterval);
                finishForgetting();
                return;
            }
            
            // Apply decay effects based on algorithm and integrity
            applyDecayEffect(algorithm, type, state.integrity);
            
        }, 100);
    }

    function applyDecayEffect(algorithm, type, integrity) {
        const element = state.displayElement;
        
        switch(algorithm) {
            case 'oral':
                if (type === 'text') {
                    mutateText(element, integrity);
                }
                break;
                
            case 'sand':
                if (type === 'draw') {
                    erodeImage(element, integrity);
                } else if (type === 'text') {
                    erodeText(element, integrity);
                }
                document.getElementById('windSound').play().catch(() => {});
                break;
                
            case 'burn':
                element.classList.add('burning');
                element.style.opacity = `${integrity / 100}`;
                document.getElementById('fireSound').play().catch(() => {});
                break;
                
            case 'corrupt':
                corruptElement(element, type, integrity);
                document.getElementById('glitchSound').play().catch(() => {});
                break;
                
            case 'autodelete':
                // Just let the timer run down
                break;
                
            case 'hallucinate':
                if (type === 'text') {
                    hallucinateText(element, integrity);
                }
                break;
        }
    }

    // Decay algorithms
    function mutateText(element, integrity) {
        const originalText = element.textContent;
        const chars = originalText.split('');
        
        // Mutation rate increases as integrity decreases
        const mutationRate = (100 - integrity) / 200;
        
        for (let i = 0; i < chars.length; i++) {
            if (Math.random() < mutationRate) {
                // Mutate character
                if (chars[i] !== ' ' && chars[i] !== '\n') {
                    // Replace with random character or similar character
                    if (Math.random() > 0.7) {
                        chars[i] = getSimilarChar(chars[i]);
                    } else if (Math.random() > 0.5) {
                        chars[i] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                    }
                }
            }
        }
        
        element.textContent = chars.join('');
    }

    function getSimilarChar(char) {
        const similarChars = {
            'a': ['á', 'à', 'â', 'ä', 'ã'],
            'e': ['é', 'è', 'ê', 'ë'],
            'i': ['í', 'ì', 'î', 'ï'],
            'o': ['ó', 'ò', 'ô', 'ö', 'õ'],
            'u': ['ú', 'ù', 'û', 'ü'],
            'c': ['ç', 'ć', 'č'],
            'n': ['ñ', 'ń'],
            's': ['ś', 'š'],
            'z': ['ż', 'ž'],
            ' ': [' ', '  ', '   ']
        };
        
        const lowerChar = char.toLowerCase();
        if (similarChars[lowerChar]) {
            return similarChars[lowerChar][Math.floor(Math.random() * similarChars[lowerChar].length)];
        }
        return char;
    }

    function erodeText(element, integrity) {
        const originalText = element.textContent;
        const erosionRate = (100 - integrity) / 100;
        
        // Replace characters with spaces or remove them
        let newText = '';
        for (let i = 0; i < originalText.length; i++) {
            if (Math.random() < erosionRate * 0.3) {
                if (Math.random() < 0.5) {
                    newText += ' ';
                } else {
                    // Skip character (remove it)
                }
            } else {
                newText += originalText[i];
            }
        }
        
        element.textContent = newText;
        
        // Fade out
        element.style.opacity = `${0.3 + (integrity / 100) * 0.7}`;
    }

    function erodeImage(img, integrity) {
        // Simulate erosion by reducing opacity and adding noise
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Add noise (simulate sand particles)
        const noiseAmount = (100 - integrity) * 2;
        for (let i = 0; i < data.length; i += 4) {
            if (Math.random() * 100 < noiseAmount) {
                const noise = Math.random() * 100 - 50;
                data[i] = Math.max(0, Math.min(255, data[i] + noise));
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
            }
            
            // Reduce opacity
            data[i + 3] = data[i + 3] * (integrity / 100);
        }
        
        ctx.putImageData(imageData, 0, 0);
        img.src = canvas.toDataURL();
    }

    function corruptElement(element, type, integrity) {
        if (type === 'text') {
            // Add glitch effect
            if (Math.random() < 0.3) {
                element.classList.add('glitch-text');
                setTimeout(() => {
                    element.classList.remove('glitch-text');
                }, 200);
            }
            
            // Replace characters with corruption symbols
            if (integrity < 50 && Math.random() < 0.1) {
                const originalText = element.textContent;
                const corruptChars = ['�', '█', '▓', '▒', '░', '≈', '≡', '≋'];
                const chars = originalText.split('');
                
                for (let i = 0; i < chars.length; i++) {
                    if (Math.random() < 0.05) {
                        chars[i] = corruptChars[Math.floor(Math.random() * corruptChars.length)];
                    }
                }
                
                element.textContent = chars.join('');
            }
        } else if (type === 'draw' && element.tagName === 'IMG') {
            // Corrupt image data
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = element;
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Corrupt random pixels
            const corruptionLevel = (100 - integrity) / 2;
            for (let i = 0; i < data.length; i += 4) {
                if (Math.random() * 100 < corruptionLevel) {
                    data[i] = Math.floor(Math.random() * 256);     // Red
                    data[i + 1] = Math.floor(Math.random() * 256); // Green
                    data[i + 2] = Math.floor(Math.random() * 256); // Blue
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            img.src = canvas.toDataURL();
        }
    }

    function hallucinateText(element, integrity) {
        if (integrity < 70) {
            const hallucinations = [
                "I can no longer recall what we spoke of, but I sense it was beautiful.",
                "The memory is fading... leaving only the impression of emotion.",
                "What was this about? Something important, I think.",
                "The words are gone but the meaning lingers like a scent.",
                "This communication has joined the chorus of forgotten things.",
                "I remember that we connected, but not the substance.",
                "The specific has given way to the general; the message to the feeling."
            ];
            
            if (Math.random() < 0.1) {
                const hallucination = hallucinations[Math.floor(Math.random() * hallucinations.length)];
                
                if (integrity < 30) {
                    element.textContent = hallucination;
                } else {
                    // Append hallucination
                    element.textContent += `\n\n[${hallucination}]`;
                }
            }
        }
    }

    function finishForgetting() {
        state.isProcessing = false;
        
        // Reset progress bar
        progressBar.innerHTML = '';
        progressText.textContent = 'Integrity: 0%';
        
        // Show final state
        const element = state.displayElement;
        
        switch(state.currentAlgorithm) {
            case 'autodelete':
                displayArea.innerHTML = `
                    <div class="initial-message">
                        <div class="message-icon">
                            <i class="fas fa-hourglass-end"></i>
                        </div>
                        <h3>Forgotten</h3>
                        <p>This communication has completed its lifecycle.</p>
                    </div>
                `;
                break;
                
            default:
                if (element && element.textContent) {
                    element.style.opacity = '0.3';
                    element.style.color = '#666';
                }
                
                // Add final message
                const finalMsg = document.createElement('div');
                finalMsg.style.marginTop = '2rem';
                finalMsg.style.padding = '1rem';
                finalMsg.style.borderTop = '1px solid rgba(212, 165, 116, 0.3)';
                finalMsg.style.fontStyle = 'italic';
                finalMsg.style.color = 'var(--color-text-dim)';
                finalMsg.innerHTML = `<i class="fas fa-monument"></i> This memory has been processed by the Ephemeral Engine.`;
                
                displayArea.appendChild(finalMsg);
        }
        
        // Log to archive (in a real implementation, this would send to a server)
        logToArchive(state.currentAlgorithm);
        
        // Re-enable inputs after delay
        setTimeout(() => {
            [submitTextBtn, submitDrawingBtn, submitVoiceBtn].forEach(btn => btn.disabled = false);
            modeButtons.forEach(btn => btn.disabled = false);
            algorithmButtons.forEach(btn => btn.disabled = false);
            
            // Reset algorithm selection
            state.currentAlgorithm = null;
            algorithmButtons.forEach(btn => btn.style.opacity = '1');
            
            processType.textContent = 'None';
            processDescription.textContent = 'Select a mode and submit a message to begin the forgetting.';
        }, 2000);
    }

    function logToArchive(algorithm) {
        // In a real implementation, this would send data to a server
        // For now, we'll just log to console and localStorage
        const archiveEntry = {
            algorithm: algorithm,
            timestamp: new Date().toISOString(),
            mode: state.currentMode
        };
        
        console.log('Archive entry:', archiveEntry);
        
        // Save to localStorage for the archive page
        let archive = JSON.parse(localStorage.getItem('ephemeralArchive') || '[]');
        archive.push(archiveEntry);
        if (archive.length > 50) archive = archive.slice(-50); // Keep only last 50
        localStorage.setItem('ephemeralArchive', JSON.stringify(archive));
    }

    function getAlgorithmName(algo) {
        const names = {
            'oral': 'Oral Tradition',
            'sand': 'Sand Drawing',
            'burn': 'Burned Letter',
            'corrupt': 'Corrupted File',
            'autodelete': 'Auto-Delete',
            'hallucinate': 'AI Hallucination'
        };
        return names[algo] || 'Unknown';
    }

    function getAlgorithmDescription(algo) {
        const desc = {
            'oral': 'Memory mutates and drifts with each retelling, like oral traditions.',
            'sand': 'Gradual erosion washes away the message, grain by grain.',
            'burn': 'Information consumed by fire, leaving only ash and memory.',
            'corrupt': 'Data decay introduces errors until meaning is unrecoverable.',
            'autodelete': 'A timed, deliberate erasure after the message has served its purpose.',
            'hallucinate': 'The system generates new, tangential meanings as the original fades.'
        };
        return desc[algo] || 'A process of deliberate forgetting.';
    }

    // Initialize
    console.log('Ephemeral Engine initialized. Ready to forget.');
});