document.addEventListener('DOMContentLoaded', () => {
    // Add disabled class to knob wrappers initially
    document.querySelectorAll('.input-knob').forEach(knob => {
        if (knob.disabled) {
            knob.parentElement.classList.add('disabled');
        }
    });

    // Add disabled class to file input label
    const fileInputLabel = document.getElementById('file-input-label');
    const fileInput = document.getElementById('file-input');
    if (fileInput.disabled) {
        fileInputLabel.classList.add('disabled');
    }

    const timeShiftKnob = document.getElementById('time-shift');
    const timeShiftValue = document.getElementById('time-shift-value');
    const pitchBendKnob = document.getElementById('pitch-bend');
    const pitchBendValue = document.getElementById('pitch-bend-value');
    const wetDryMixSlider = document.getElementById('wet-dry-mix');
    const wetDryMixValue = document.getElementById('wet-dry-mix-value');
    const playButton = document.getElementById('play-button');
    const downloadButton = document.getElementById('download-button');
    const presetsButton = document.getElementById('presets-button');
    const audioPlayer = document.getElementById('audio-player');
    const statusIndicator = document.getElementById('status-indicator');
    const canvas = document.getElementById('audio-visualizer');
    const canvasCtx = canvas.getContext('2d');

    // EQ Controls
    const eqEnableCheckbox = document.getElementById('eq-enable');
    const lufsNormalizeCheckbox = document.getElementById('lufs-normalize');
    const lowEqKnob = document.getElementById('low-eq');
    const lowEqValue = document.getElementById('low-eq-value');
    const midEqKnob = document.getElementById('mid-eq');
    const midEqValue = document.getElementById('mid-eq-value');
    const highEqKnob = document.getElementById('high-eq');
    const highEqValue = document.getElementById('high-eq-value');

    let player;
    let pitchShift;
    let wetDry;
    let dryGain;
    let lowShelf, midBand, highShelf;
    let limiter;
    
    // Smoothing parameters for knob changes
    const smoothingTime = 0.05; // 50ms smoothing to prevent artifacts

    // Check if Tone.js is available
    if (typeof Tone === 'undefined') {
        console.warn('Tone.js not loaded. Audio processing will be unavailable.');
        // Show a warning to user
        const warning = document.createElement('div');
        warning.style.cssText = 'position: fixed; top: 10px; left: 50%; transform: translateX(-50%); background: #ff9800; color: white; padding: 10px 20px; border-radius: 5px; z-index: 10000;';
        warning.textContent = 'Audio library not loaded. Some features may not work.';
        document.body.appendChild(warning);
        setTimeout(() => warning.remove(), 5000);
    } else {
        // Initialize Tone.js components
        pitchShift = new Tone.PitchShift({
            pitch: 0
        });

    let analyser;
    let animationId;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Update status indicator
    function updateStatus(status) {
        statusIndicator.className = '';
        switch(status) {
            case 'ready':
                statusIndicator.textContent = 'Ready';
                statusIndicator.className = 'status-ready';
                break;
            case 'playing':
                statusIndicator.textContent = 'Playing';
                statusIndicator.className = 'status-playing';
                break;
            case 'processing':
                statusIndicator.textContent = 'Processing...';
                statusIndicator.className = 'status-processing';
                break;
        }
    }


        // EQ nodes
        lowShelf = new Tone.EQ3({
            low: 0,
            mid: 0,
            high: 0,
            lowFrequency: 400,
            highFrequency: 2500
        });

        // Limiter for LUFS normalization
        limiter = new Tone.Limiter(-1);

        // Audio chain: pitchShift -> lowShelf -> limiter -> destination
        pitchShift.connect(lowShelf);
        lowShelf.connect(limiter);
        limiter.toDestination();

        wetDry = new Tone.Gain(0.5).connect(pitchShift);
        dryGain = new Tone.Gain(0.5).toDestination();
    }


    // UI Updates with smoothing

    // Initialize analyser for visualization
    analyser = new Tone.Analyser('waveform', 512);
    pitchShift.connect(analyser);

    // Visualizer function
    function drawVisualizer() {
        if (!analyser) return;
        
        animationId = requestAnimationFrame(drawVisualizer);
        
        const bufferLength = analyser.size;
        const dataArray = analyser.getValue();
        
        canvasCtx.fillStyle = '#f7fafc';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
        
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = '#4a9eff';
        canvasCtx.beginPath();
        
        const sliceWidth = canvas.width / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const v = (dataArray[i] + 1) / 2; // Normalize to 0-1
            const y = v * canvas.height;
            
            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    }

    // Start visualizer
    drawVisualizer();

    // UI Updates

    const updateAudio = () => {
        if (!player || !pitchShift) return;

        const playbackRate = parseFloat(timeShiftKnob.value) / 100;
        player.playbackRate = playbackRate;

        // Compensate for pitch change from playback rate to achieve time-stretching
        const timeStretchPitchCorrection = -12 * Math.log2(playbackRate);
        const userPitchBend = parseFloat(pitchBendKnob.value);

        // Combine the two pitch values with smoothing
        const targetPitch = userPitchBend + timeStretchPitchCorrection;
        if (typeof Tone !== 'undefined' && Tone.context.state === 'running') {
            pitchShift.pitch.linearRampToValueAtTime(targetPitch, Tone.context.currentTime + smoothingTime);
        } else if (pitchShift) {
            pitchShift.pitch = targetPitch;
        }


        timeShiftValue.textContent = timeShiftKnob.value + '%';
        pitchBendValue.textContent = parseFloat(pitchBendKnob.value).toFixed(1) + 'st';
    };

    const updateEQ = () => {
        const lowGain = parseFloat(lowEqKnob.value);
        const midGain = parseFloat(midEqKnob.value);
        const highGain = parseFloat(highEqKnob.value);

        // Update UI text
        lowEqValue.textContent = lowGain.toFixed(1) + ' dB';
        midEqValue.textContent = midGain.toFixed(1) + ' dB';
        highEqValue.textContent = highGain.toFixed(1) + ' dB';

        // Update audio if available
        if (!lowShelf) return;

        if (typeof Tone !== 'undefined' && Tone.context.state === 'running') {
            lowShelf.low.linearRampToValueAtTime(lowGain, Tone.context.currentTime + smoothingTime);
            lowShelf.mid.linearRampToValueAtTime(midGain, Tone.context.currentTime + smoothingTime);
            lowShelf.high.linearRampToValueAtTime(highGain, Tone.context.currentTime + smoothingTime);
        } else {
            lowShelf.low.value = lowGain;
            lowShelf.mid.value = midGain;
            lowShelf.high.value = highGain;
        }

        // Update display values safely
        timeShiftValue.textContent = timeShiftKnob.value;
        const timeUnit = timeShiftValue.querySelector('.unit');
        if (timeUnit) timeUnit.textContent = '%';
        
        pitchBendValue.textContent = pitchBendKnob.value;
        const pitchUnit = pitchBendValue.querySelector('.unit');
        if (pitchUnit) pitchUnit.textContent = 'st';

    };

    timeShiftKnob.addEventListener('input', updateAudio);
    pitchBendKnob.addEventListener('input', updateAudio);

    lowEqKnob.addEventListener('input', updateEQ);
    midEqKnob.addEventListener('input', updateEQ);
    highEqKnob.addEventListener('input', updateEQ);

    wetDryMixSlider.addEventListener('input', (e) => {
        if (wetDry && dryGain) {
            const mix = parseFloat(e.target.value);
            if (typeof Tone !== 'undefined' && Tone.context.state === 'running') {
                wetDry.gain.linearRampToValueAtTime(mix, Tone.context.currentTime + smoothingTime);
                dryGain.gain.linearRampToValueAtTime(1 - mix, Tone.context.currentTime + smoothingTime);
            } else {
                wetDry.gain.value = mix;
                dryGain.gain.value = 1 - mix;
            }
        }
        const percentage = Math.round(e.target.value * 100);
        wetDryMixValue.textContent = percentage;
        const wetUnit = wetDryMixValue.querySelector('.unit');
        if (wetUnit) wetUnit.textContent = '%';
    });

    // Secure audio file validation
    const validateAudioFile = (file) => {
        const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav'];
        const maxSize = 100 * 1024 * 1024; // 100MB limit

        if (!allowedTypes.includes(file.type)) {
            alert('Please upload only audio files (MP3 or WAV)');
            return false;
        }

        if (file.size > maxSize) {
            alert('File size must be less than 100MB');
            return false;
        }

        return true;
    };

    // Audio Loading with validation
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {

            // Validate file
            if (!validateAudioFile(file)) {
                e.target.value = ''; // Clear the input
                return;
            }

            if (typeof Tone === 'undefined') {
                alert('Audio processing library not loaded. Cannot process audio files.');
                return;
            }


            updateStatus('processing');

            const url = URL.createObjectURL(file);
            if (player) {
                player.dispose();
            }
            // If a file is already playing, stop it and reset.
            if (Tone.Transport.state !== 'stopped') {
                Tone.Transport.stop();
                Tone.Transport.position = 0;
                playButton.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
            }

            player = new Tone.Player(url, () => {
                playButton.disabled = false;
                downloadButton.disabled = false;
                player.sync().start(0);

                
                // Apply LUFS normalization if enabled
                if (lufsNormalizeCheckbox.checked) {
                    applyLUFSNormalization();
                }

                updateStatus('ready');

            });

            player.connect(dryGain);
            player.connect(wetDry);
        }
    });

    // LUFS Normalization (Spotify standard is -14 LUFS)
    // Note: This is a simplified approximation. True LUFS measurement requires
    // K-weighting filters and gating. This uses RMS as a basic loudness estimate.
    const MIN_RMS_THRESHOLD = 0.0001; // Prevent division by zero
    const applyLUFSNormalization = () => {
        if (!player || !player.buffer) return;
        
        // Calculate RMS and apply normalization
        const buffer = player.buffer;
        let sumSquares = 0;
        let sampleCount = 0;

        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                sumSquares += channelData[i] * channelData[i];
                sampleCount++;
            }
        }

        const rms = Math.sqrt(sumSquares / sampleCount);
        // Target RMS approximation for -14 LUFS (simplified approach)
        const targetRMS = 0.1;
        const gainAdjustment = targetRMS / (rms + MIN_RMS_THRESHOLD);
        
        // Apply gain to the player (capped at +6dB to prevent clipping)
        player.volume.value = 20 * Math.log10(Math.min(gainAdjustment, 2));
    };

    lufsNormalizeCheckbox.addEventListener('change', () => {
        if (lufsNormalizeCheckbox.checked && player && player.loaded) {
            applyLUFSNormalization();
        } else if (player) {
            player.volume.value = 0;
        }
    });

    // Transport
    playButton.addEventListener('click', () => {
        if (typeof Tone === 'undefined') {
            alert('Audio processing library not loaded.');
            return;
        }
        if (player && player.loaded) {
            // It's good practice to resume the AudioContext on a user gesture.
            if (Tone.context.state !== 'running') {
                Tone.context.resume();
            }
            if (Tone.Transport.state !== 'started') {
                Tone.Transport.start();
                playButton.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
                updateStatus('playing');
            } else {
                Tone.Transport.pause();
                playButton.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
                updateStatus('ready');
            }
        }
    });

    // Download
    downloadButton.addEventListener('click', async () => {
        if (!player || !player.loaded) return;

        downloadButton.disabled = true;
        downloadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Processing...</span>';
        updateStatus('processing');

        try {
            const buffer = await Tone.Offline(async (offline) => {
                // Create nodes in the offline context
                const offlinePlayer = new Tone.Player(player.buffer);
                const playbackRate = parseFloat(timeShiftKnob.value) / 100;
                offlinePlayer.playbackRate = playbackRate;

                const timeStretchPitchCorrection = -12 * Math.log2(playbackRate);
                const userPitchBend = parseFloat(pitchBendKnob.value);
                const totalPitchShift = userPitchBend + timeStretchPitchCorrection;

                const offlinePitchShift = new Tone.PitchShift({
                    pitch: totalPitchShift
                });

                const offlineEQ = new Tone.EQ3({
                    low: parseFloat(lowEqKnob.value),
                    mid: parseFloat(midEqKnob.value),
                    high: parseFloat(highEqKnob.value),
                    lowFrequency: 400,
                    highFrequency: 2500
                });

                const offlineLimiter = new Tone.Limiter(-1);

                // Build chain
                offlinePitchShift.connect(offlineEQ);
                offlineEQ.connect(offlineLimiter);
                offlineLimiter.connect(offline.destination);

                const offlineWetGain = new Tone.Gain(parseFloat(wetDryMixSlider.value)).connect(offlinePitchShift);
                const offlineDryGain = new Tone.Gain(1 - parseFloat(wetDryMixSlider.value)).connect(offline.destination);

                // Connect player to both chains
                offlinePlayer.connect(offlineDryGain);
                offlinePlayer.connect(offlineWetGain);

                // start the player
                offlinePlayer.start(0);

            }, player.buffer.duration);

            const wav = bufferToWave(buffer.getChannelData(0), buffer.getChannelData(1), buffer.sampleRate);
            const blob = new Blob([new DataView(wav)], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'processed_audio.wav';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error processing audio:", error);
            alert("Sorry, there was an error processing the audio.");
        } finally {
            downloadButton.disabled = false;
            downloadButton.innerHTML = '<i class="fas fa-download"></i><span>Download</span>';
            updateStatus('ready');
        }
    });

    // Presets functionality
    const presets = {
        'vocal-enhance': {
            timeShift: 100,
            pitchBend: 0,
            lowEq: -2,
            midEq: 3,
            highEq: 2,
            wetDryMix: 0.7
        },
        'bass-boost': {
            timeShift: 100,
            pitchBend: 0,
            lowEq: 8,
            midEq: -2,
            highEq: 0,
            wetDryMix: 0.5
        },
        'treble-boost': {
            timeShift: 100,
            pitchBend: 0,
            lowEq: -2,
            midEq: 0,
            highEq: 8,
            wetDryMix: 0.5
        },
        'radio-ready': {
            timeShift: 100,
            pitchBend: 0,
            lowEq: 2,
            midEq: 4,
            highEq: 3,
            wetDryMix: 0.8
        },
        'chipmunk': {
            timeShift: 150,
            pitchBend: 8,
            lowEq: -6,
            midEq: 2,
            highEq: 4,
            wetDryMix: 1.0
        },
        'slow-deep': {
            timeShift: 70,
            pitchBend: -6,
            lowEq: 6,
            midEq: 0,
            highEq: -4,
            wetDryMix: 1.0
        },
        'reset': {
            timeShift: 100,
            pitchBend: 0,
            lowEq: 0,
            midEq: 0,
            highEq: 0,
            wetDryMix: 0.5
        }
    };

    const applyPreset = (presetName) => {
        const preset = presets[presetName];
        if (!preset) return;

        timeShiftKnob.value = preset.timeShift;
        pitchBendKnob.value = preset.pitchBend;
        lowEqKnob.value = preset.lowEq;
        midEqKnob.value = preset.midEq;
        highEqKnob.value = preset.highEq;
        wetDryMixSlider.value = preset.wetDryMix;

        updateAudio();
        updateEQ();
        wetDryMixValue.textContent = preset.wetDryMix;
    };

    // Helper function to convert AudioBuffer to WAV
    function bufferToWave(ch0, ch1, sampleRate) {
        const numChannels = 2;
        const numFrames = ch0.length;
        const buffer = new ArrayBuffer(44 + numFrames * numChannels * 2);
        const view = new DataView(buffer);

        // RIFF chunk descriptor
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + numFrames * numChannels * 2, true);
        writeString(view, 8, 'WAVE');
        // FMT sub-chunk
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 4, true);
        view.setUint16(32, numChannels*2, true);
        view.setUint16(34, 16, true);
        // data sub-chunk
        writeString(view, 36, 'data');
        view.setUint32(40, numFrames * numChannels * 2, true);

        // write the PCM samples
        let offset = 44;
        for (let i = 0; i < numFrames; i++) {
            view.setInt16(offset, ch0[i] * 0x7FFF, true);
            offset += 2;
            view.setInt16(offset, ch1[i] * 0x7FFF, true);
            offset += 2;
        }

        return buffer;
    }

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    // Modal Logic
    const loginButton = document.getElementById('login-button');
    const authModal = document.getElementById('auth-modal');
    const modalTitle = document.getElementById('modal-title');
    const authForm = document.getElementById('auth-form');
    const authSubmitButton = document.getElementById('auth-submit-button');
    const authSwitchLink = document.getElementById('auth-switch-link');
    const authSwitchText = document.getElementById('auth-switch-text');

    // EQ Modal
    const eqModal = document.getElementById('eq-modal');
    const eqCloseButton = document.getElementById('eq-close-button');

    // Presets Modal
    const presetsModal = document.getElementById('presets-modal');
    const presetsCloseButton = document.getElementById('presets-close-button');

    let isLoginMode = true;

    loginButton.addEventListener('click', () => {
        authModal.style.display = 'flex';
    });

    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });

    // EQ Modal handlers
    eqEnableCheckbox.addEventListener('change', () => {
        if (eqEnableCheckbox.checked) {
            eqModal.style.display = 'flex';
        }
    });

    eqCloseButton.addEventListener('click', () => {
        eqModal.style.display = 'none';
    });

    eqModal.addEventListener('click', (e) => {
        if (e.target === eqModal) {
            eqModal.style.display = 'none';
        }
    });

    // Presets Modal handlers
    presetsButton.addEventListener('click', () => {
        presetsModal.style.display = 'flex';
    });

    presetsCloseButton.addEventListener('click', () => {
        presetsModal.style.display = 'none';
    });

    presetsModal.addEventListener('click', (e) => {
        if (e.target === presetsModal) {
            presetsModal.style.display = 'none';
        }
    });

    // Apply preset when clicked
    document.querySelectorAll('.preset-button').forEach(button => {
        button.addEventListener('click', () => {
            const presetName = button.getAttribute('data-preset');
            applyPreset(presetName);
            presetsModal.style.display = 'none';
        });
    });

    const switchAuthMode = (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            modalTitle.textContent = 'Login';
            authSubmitButton.textContent = 'Login';
            // Safely create the switch text
            authSwitchText.textContent = "Don't have an account? ";
            const signUpLink = document.createElement('a');
            signUpLink.href = '#';
            signUpLink.id = 'auth-switch-link';
            signUpLink.textContent = 'Sign Up';
            authSwitchText.appendChild(signUpLink);
        } else {
            modalTitle.textContent = 'Sign Up';
            authSubmitButton.textContent = 'Sign Up';
            // Safely create the switch text
            authSwitchText.textContent = 'Already have an account? ';
            const loginLink = document.createElement('a');
            loginLink.href = '#';
            loginLink.id = 'auth-switch-link';
            loginLink.textContent = 'Login';
            authSwitchText.appendChild(loginLink);
        }
        document.getElementById('auth-switch-link').addEventListener('click', switchAuthMode);
    };

    authSwitchLink.addEventListener('click', switchAuthMode);

    const unlockControls = () => {
        timeShiftKnob.disabled = false;
        pitchBendKnob.disabled = false;
        wetDryMixSlider.disabled = false;
        fileInput.disabled = false;
        fileInputLabel.classList.remove('disabled');
        playButton.disabled = false;
        presetsButton.disabled = false;
        eqEnableCheckbox.disabled = false;
        lufsNormalizeCheckbox.disabled = false;
        // The download button is enabled once a file is loaded.

        document.querySelectorAll('.knob-wrapper.disabled').forEach(wrapper => {
            wrapper.classList.remove('disabled');
        });
    };

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Backend logic would go here.
        alert('Login successful! Controls are now unlocked.');
        unlockControls();
        authModal.style.display = 'none';
    });

    // Drawer Toggle Functionality
    // Accessible status message region
    function showStatusMessage(message) {
        let statusRegion = document.getElementById('status-message-region');
        if (!statusRegion) {
            statusRegion = document.createElement('div');
            statusRegion.id = 'status-message-region';
            statusRegion.setAttribute('role', 'status');
            statusRegion.setAttribute('aria-live', 'polite');
            statusRegion.style.position = 'fixed';
            statusRegion.style.bottom = '1rem';
            statusRegion.style.right = '1rem';
            statusRegion.style.background = '#333';
            statusRegion.style.color = '#fff';
            statusRegion.style.padding = '0.75rem 1.25rem';
            statusRegion.style.borderRadius = '0.5rem';
            statusRegion.style.zIndex = '1000';
            statusRegion.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            document.body.appendChild(statusRegion);
        }
        statusRegion.textContent = message;
        statusRegion.style.display = 'block';
        setTimeout(() => {
            statusRegion.style.display = 'none';
        }, 3000);
    }

    const drawerToggles = document.querySelectorAll('.drawer-toggle');
    drawerToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const position = toggle.classList.contains('drawer-toggle-left') ? 'left' :
                           toggle.classList.contains('drawer-toggle-right') ? 'right' : 'top';
            showStatusMessage(`${position.charAt(0).toUpperCase() + position.slice(1)} drawer toggle clicked! (Drawer functionality to be implemented)`);
        });
    });
});
