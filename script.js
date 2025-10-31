document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Updated for new HTML structure
    const speedKnob = document.getElementById('speed-knob');
    const speedValue = document.getElementById('speed-value');
    const pitchKnob = document.getElementById('pitch-knob');
    const pitchValue = document.getElementById('pitch-value');
    const speedIndicator = speedKnob?.parentElement.querySelector('.knob-indicator');
    const pitchIndicator = pitchKnob?.parentElement.querySelector('.knob-indicator');
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Settings modal
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const settingsClose = document.getElementById('settings-close');
    
    // Audio controls
    const fileInput = document.getElementById('file-input');
    const playButton = document.getElementById('play-button');
    const downloadButton = document.getElementById('download-button');
    
    // Settings controls
    const wetDryMixSlider = document.getElementById('wet-dry-mix');
    const wetDryValue = document.getElementById('wet-dry-value');
    const eqEnableCheckbox = document.getElementById('eq-enable');
    const lufsNormalizeCheckbox = document.getElementById('lufs-normalize');
    const eqControlsDiv = document.getElementById('eq-controls');
    const lowEqKnob = document.getElementById('low-eq');
    const lowEqValue = document.getElementById('low-eq-value');
    const midEqKnob = document.getElementById('mid-eq');
    const midEqValue = document.getElementById('mid-eq-value');
    const highEqKnob = document.getElementById('high-eq');
    const highEqValue = document.getElementById('high-eq-value');
    
    // Cassette icon
    const cassetteIcon = document.getElementById('cassette-icon');

    // Initialize buttons
    if (playButton) playButton.disabled = true;
    if (downloadButton) downloadButton.disabled = true;

    // Audio engine variables (keeping existing Tone.js setup)
    let player;
    let pitchShift;
    let wetDry;
    let dryGain;
    let lowShelf;
    let limiter;
    
    const smoothingTime = 0.05;

    // Check if Tone.js is available
    if (typeof Tone === 'undefined') {
        console.warn('Tone.js not loaded. Audio processing will be unavailable.');
        showNotification('Audio library not loaded. Some features may not work.', 'warning');
    } else {
        // Initialize Tone.js components
        pitchShift = new Tone.PitchShift({ pitch: 0 });
        
        lowShelf = new Tone.EQ3({
            low: 0,
            mid: 0,
            high: 0,
            lowFrequency: 400,
            highFrequency: 2500
        });
        
        // Use less aggressive limiter threshold to prevent distortion
        limiter = new Tone.Limiter(-0.1);
        
        // Audio chain
        pitchShift.connect(lowShelf);
        lowShelf.connect(limiter);
        limiter.toDestination();
        
        wetDry = new Tone.Gain(0.5).connect(pitchShift);
        dryGain = new Tone.Gain(0.5).toDestination();
    }

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', newTheme);
        
        // Update icon
        const icon = themeToggle.querySelector('i');
        if (newTheme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        
        // Save preference
        localStorage.setItem('theme', newTheme);
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    const icon = themeToggle.querySelector('i');
    if (savedTheme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    // Settings Modal
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'flex';
    });
    
    settingsClose.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });
    
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });

    // EQ Enable Checkbox
    eqEnableCheckbox.addEventListener('change', () => {
        if (eqEnableCheckbox.checked) {
            eqControlsDiv.style.display = 'block';
        } else {
            eqControlsDiv.style.display = 'none';
        }
    });

    // Knob visualization update
    function updateKnobIndicator(knob, indicator) {
        if (!knob || !indicator) return;
        
        const min = parseFloat(knob.min);
        const max = parseFloat(knob.max);
        const value = parseFloat(knob.value);
        const percentage = (value - min) / (max - min);
        
        // Rotate from -135deg to +135deg (270 degrees total range)
        const rotation = -135 + (percentage * 270);
        indicator.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
    }

    // Speed Knob
    speedKnob.addEventListener('input', () => {
        const value = speedKnob.value;
        speedValue.textContent = value + '%';
        updateKnobIndicator(speedKnob, speedIndicator);
        updateAudio();
    });
    
    // Pitch Knob
    pitchKnob.addEventListener('input', () => {
        const value = parseFloat(pitchKnob.value).toFixed(1);
        pitchValue.textContent = value + ' st';
        updateKnobIndicator(pitchKnob, pitchIndicator);
        updateAudio();
    });

    // Initialize knob indicators
    updateKnobIndicator(speedKnob, speedIndicator);
    updateKnobIndicator(pitchKnob, pitchIndicator);

    // Wet/Dry Mix
    wetDryMixSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        wetDryValue.textContent = Math.round(value * 100) + '%';
        
        if (wetDry && dryGain && typeof Tone !== 'undefined' && Tone.context.state === 'running') {
            wetDry.gain.linearRampToValueAtTime(value, Tone.context.currentTime + smoothingTime);
            dryGain.gain.linearRampToValueAtTime(1 - value, Tone.context.currentTime + smoothingTime);
        } else if (wetDry && dryGain) {
            wetDry.gain.value = value;
            dryGain.gain.value = 1 - value;
        }
    });

    // EQ Controls
    lowEqKnob.addEventListener('input', updateEQ);
    midEqKnob.addEventListener('input', updateEQ);
    highEqKnob.addEventListener('input', updateEQ);

    function updateEQ() {
        const lowGain = parseFloat(lowEqKnob.value);
        const midGain = parseFloat(midEqKnob.value);
        const highGain = parseFloat(highEqKnob.value);

        lowEqValue.textContent = lowGain.toFixed(1) + ' dB';
        midEqValue.textContent = midGain.toFixed(1) + ' dB';
        highEqValue.textContent = highGain.toFixed(1) + ' dB';

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
    }

    // Audio Update Function (keeping existing logic)
    function updateAudio() {
        if (!player || !pitchShift) return;

        const playbackRate = parseFloat(speedKnob.value) / 100;
        player.playbackRate = playbackRate;

        // Compensate for pitch change from playback rate
        const timeStretchPitchCorrection = -12 * Math.log2(playbackRate);
        const userPitchBend = parseFloat(pitchKnob.value);
        const targetPitch = userPitchBend + timeStretchPitchCorrection;

        if (typeof Tone !== 'undefined' && Tone.context.state === 'running') {
            pitchShift.pitch.linearRampToValueAtTime(targetPitch, Tone.context.currentTime + smoothingTime);
        } else if (pitchShift) {
            pitchShift.pitch = targetPitch;
        }
    }

    // File Input
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file
        if (!validateAudioFile(file)) {
            e.target.value = '';
            return;
        }

        if (typeof Tone === 'undefined') {
            showNotification('Audio processing library not loaded.', 'error');
            return;
        }

        // Add cassette animation
        if (cassetteIcon) {
            cassetteIcon.style.animation = 'spin 1s ease-in-out';
            setTimeout(() => {
                cassetteIcon.style.animation = '';
            }, 1000);
        }

        const url = URL.createObjectURL(file);
        if (player) {
            player.dispose();
        }
        
        if (Tone.Transport.state !== 'stopped') {
            Tone.Transport.stop();
            Tone.Transport.position = 0;
            if (playButton) {
                playButton.innerHTML = '<i class="fas fa-play"></i> Play';
            }
        }

        player = new Tone.Player(url, () => {
            if (playButton) playButton.disabled = false;
            if (downloadButton) downloadButton.disabled = false;
            player.sync().start(0);
            
            if (lufsNormalizeCheckbox.checked) {
                applyLUFSNormalization();
            }
            
            showNotification('Audio file loaded successfully!', 'success');
        });

        player.connect(dryGain);
        player.connect(wetDry);
    });

    // Play Button
    if (playButton) {
        playButton.addEventListener('click', () => {
            if (typeof Tone === 'undefined') {
                showNotification('Audio processing library not loaded.', 'error');
                return;
            }
            
            if (player && player.loaded) {
                if (Tone.context.state !== 'running') {
                    Tone.context.resume();
                }
                
                if (Tone.Transport.state !== 'started') {
                    Tone.Transport.start();
                    playButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
                } else {
                    Tone.Transport.pause();
                    playButton.innerHTML = '<i class="fas fa-play"></i> Play';
                }
            }
        });
    }

    // Download Button - Fixed for audio quality issues
    let processedAudioBlob = null;
    
    if (downloadButton) {
        downloadButton.addEventListener('click', async () => {
            if (!player || !player.loaded) return;

            downloadButton.disabled = true;
            downloadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            try {
                const buffer = await Tone.Offline(async (offline) => {
                    const offlinePlayer = new Tone.Player(player.buffer);
                    const playbackRate = parseFloat(speedKnob.value) / 100;
                    offlinePlayer.playbackRate = playbackRate;

                    const timeStretchPitchCorrection = -12 * Math.log2(playbackRate);
                    const userPitchBend = parseFloat(pitchKnob.value);
                    const totalPitchShift = userPitchBend + timeStretchPitchCorrection;

                    const offlinePitchShift = new Tone.PitchShift({ pitch: totalPitchShift });
                    const offlineEQ = new Tone.EQ3({
                        low: parseFloat(lowEqKnob.value),
                        mid: parseFloat(midEqKnob.value),
                        high: parseFloat(highEqKnob.value),
                        lowFrequency: 400,
                        highFrequency: 2500
                    });
                    // Use less aggressive limiter threshold to prevent distortion
                    const offlineLimiter = new Tone.Limiter(-0.1);

                    offlinePitchShift.connect(offlineEQ);
                    offlineEQ.connect(offlineLimiter);
                    offlineLimiter.connect(offline.destination);

                    const offlineWetGain = new Tone.Gain(parseFloat(wetDryMixSlider.value)).connect(offlinePitchShift);
                    const offlineDryGain = new Tone.Gain(1 - parseFloat(wetDryMixSlider.value)).connect(offline.destination);

                    offlinePlayer.connect(offlineDryGain);
                    offlinePlayer.connect(offlineWetGain);
                    offlinePlayer.start(0);
                }, player.buffer.duration);

                // Use MP3 encoding for better quality and smaller file size
                const ch0 = buffer.getChannelData(0);
                const ch1 = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : ch0;
                const mp3 = bufferToMp3(ch0, ch1, buffer.sampleRate);
                processedAudioBlob = new Blob([mp3], { type: 'audio/mpeg' });
                
                // Direct download
                const url = URL.createObjectURL(processedAudioBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'halfscrew_processed.mp3';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showNotification('Download started! Audio quality has been improved.', 'success');
            } catch (error) {
                console.error("Error processing audio:", error);
                showNotification('Error processing audio', 'error');
            } finally {
                downloadButton.disabled = false;
                downloadButton.innerHTML = '<i class="fas fa-download"></i> Download';
            }
        });
    }

    // Helper Functions
    function validateAudioFile(file) {
        const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav'];
        const maxSize = 100 * 1024 * 1024; // 100MB

        if (!allowedTypes.includes(file.type)) {
            showNotification('Please upload only audio files (MP3 or WAV)', 'error');
            return false;
        }

        if (file.size > maxSize) {
            showNotification('File size must be less than 100MB', 'error');
            return false;
        }

        return true;
    }

    const MIN_RMS_THRESHOLD = 0.0001;
    function applyLUFSNormalization() {
        if (!player || !player.buffer) return;
        
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
        const targetRMS = 0.1;
        const gainAdjustment = targetRMS / (rms + MIN_RMS_THRESHOLD);
        player.volume.value = 20 * Math.log10(Math.min(gainAdjustment, 2));
    }

    lufsNormalizeCheckbox.addEventListener('change', () => {
        if (lufsNormalizeCheckbox.checked && player && player.loaded) {
            applyLUFSNormalization();
        } else if (player) {
            player.volume.value = 0;
        }
    });

    function bufferToWave(ch0, ch1, sampleRate) {
        // Handle mono audio by duplicating to stereo if needed
        if (!ch1 || ch1.length === 0) {
            ch1 = ch0;
        }
        
        const numChannels = 2;
        const numFrames = ch0.length;
        const buffer = new ArrayBuffer(44 + numFrames * numChannels * 2);
        const view = new DataView(buffer);

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + numFrames * numChannels * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 4, true);
        view.setUint16(32, numChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, numFrames * numChannels * 2, true);

        let offset = 44;
        for (let i = 0; i < numFrames; i++) {
            // Clamp values to prevent integer overflow and distortion
            const sample0 = Math.max(-1, Math.min(1, ch0[i])) * 0x7FFF;
            const sample1 = Math.max(-1, Math.min(1, ch1[i])) * 0x7FFF;
            
            view.setInt16(offset, sample0, true);
            offset += 2;
            view.setInt16(offset, sample1, true);
            offset += 2;
        }

        return buffer;
    }

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    // Convert audio buffer to MP3 format
    function bufferToMp3(ch0, ch1, sampleRate) {
        // Handle mono audio by duplicating to stereo if needed
        if (!ch1 || ch1.length === 0) {
            ch1 = ch0;
        }

        // Check if lamejs is available
        if (typeof lamejs === 'undefined') {
            console.error('lamejs library not loaded, falling back to WAV');
            return bufferToWave(ch0, ch1, sampleRate);
        }

        const mp3encoder = new lamejs.Mp3Encoder(2, sampleRate, 320); // 320 kbps for high quality
        const mp3Data = [];
        
        const sampleBlockSize = 1152; // LAME encoding block size
        const numFrames = ch0.length;
        
        // Convert float samples to 16-bit integers with proper clamping
        for (let i = 0; i < numFrames; i += sampleBlockSize) {
            const left = new Int16Array(sampleBlockSize);
            const right = new Int16Array(sampleBlockSize);
            
            for (let j = 0; j < sampleBlockSize && i + j < numFrames; j++) {
                // Clamp values to prevent distortion
                const sample0 = Math.max(-1, Math.min(1, ch0[i + j]));
                const sample1 = Math.max(-1, Math.min(1, ch1[i + j]));
                
                left[j] = sample0 * 0x7FFF;
                right[j] = sample1 * 0x7FFF;
            }
            
            const mp3buf = mp3encoder.encodeBuffer(left, right);
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }
        }
        
        // Finalize the MP3
        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
        
        // Combine all MP3 chunks
        const totalLength = mp3Data.reduce((acc, chunk) => acc + chunk.length, 0);
        const mp3Buffer = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of mp3Data) {
            mp3Buffer.set(chunk, offset);
            offset += chunk.length;
        }
        
        return mp3Buffer.buffer;
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            font-weight: 600;
            animation: slideDown 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});
