document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements - Updated for new HTML structure
    const speedKnob = document.getElementById('speed-knob');
    const speedValue = document.getElementById('speed-value');
    const pitchKnob = document.getElementById('pitch-knob');
    const pitchValue = document.getElementById('pitch-value');
    const speedIndicator = speedKnob?.parentElement.querySelector('.knob-indicator');
    const pitchIndicator = pitchKnob?.parentElement.querySelector('.knob-indicator');
    
    // Logo elements
    const cornerLogo = document.getElementById('corner-logo');
    const cornerLogoImg = document.getElementById('corner-logo-img');
    const centerLogo = document.getElementById('center-logo');
    const centerLogoImg = document.getElementById('center-logo-img');
    const modalLogoImg = document.getElementById('modal-logo-img');
    
    // Menu and modals
    const settingsBtn = document.getElementById('settings-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const themeToggleMenu = document.getElementById('theme-toggle-menu');
    const aboutMenu = document.getElementById('about-menu');
    const preorderMenu = document.getElementById('preorder-menu');
    const settingsModal = document.getElementById('settings-modal');
    const settingsClose = document.getElementById('settings-close');
    const marketingModal = document.getElementById('marketing-modal');
    const marketingClose = document.getElementById('marketing-close');
    const aboutModal = document.getElementById('about-modal');
    const aboutClose = document.getElementById('about-close');
    const joinBetaBtn = document.getElementById('join-beta');
    
    const body = document.body;
    
    // Audio controls
    const fileInput = document.getElementById('file-input');
    const playButton = document.getElementById('play-button');
    const downloadButton = document.getElementById('download-button');
    
    // Settings controls
    const wetDryMixSlider = document.getElementById('wet-dry-mix');
    const wetDryValue = document.getElementById('wet-dry-value');
    const eqEnableCheckbox = document.getElementById('eq-enable');
    const eqBypassBtn = document.getElementById('eq-bypass');
    const lufsNormalizeCheckbox = document.getElementById('lufs-normalize');
    const eqControlsDiv = document.getElementById('eq-controls');
    const lowEqKnob = document.getElementById('low-eq');
    const lowEqValue = document.getElementById('low-eq-value');
    const midEqKnob = document.getElementById('mid-eq');
    const midEqValue = document.getElementById('mid-eq-value');
    const highEqKnob = document.getElementById('high-eq');
    const highEqValue = document.getElementById('high-eq-value');

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
    let eqBypassed = false;
    
    // Knob smoothing parameters (easily tunable)
    const KNOB_SMOOTHING_CONFIG = {
        minRampTime: 0.1,        // Minimum ramp time in seconds
        maxRatePerMs: 0.5,       // Maximum rate of change per millisecond
        interpolationTime: 0.1   // Interpolation time for value changes
    };
    
    const smoothingTime = KNOB_SMOOTHING_CONFIG.interpolationTime;
    
    // Knob smoothing state
    let speedSmoothing = { lastValue: 100, lastTime: Date.now(), targetValue: 100 };
    let pitchSmoothing = { lastValue: 0, lastTime: Date.now(), targetValue: 0 };
    
    // Logo paths (easily replaceable)
    const LOGO_PATHS = {
        corner: {
            light: 'lightcl.png',
            dark: 'darkcl.png'
        },
        center: {
            light: 'light.png',
            dark: 'dark.png'
        }
    };
    
    // Initialize logo system
    function updateLogos() {
        const theme = body.getAttribute('data-theme') || 'light';
        const cornerPath = LOGO_PATHS.corner[theme];
        const centerPath = LOGO_PATHS.center[theme];
        
        // Set corner logo with fallback
        if (cornerLogoImg) {
            cornerLogoImg.src = cornerPath;
            cornerLogoImg.onerror = () => {
                // Fallback to SVG icon if PNG not found
                cornerLogo.innerHTML = `
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="10" width="40" height="28" rx="4" stroke="currentColor" stroke-width="2.5" fill="none"/>
                        <circle cx="14" cy="24" r="5" stroke="currentColor" stroke-width="2" fill="none"/>
                        <circle cx="34" cy="24" r="5" stroke="currentColor" stroke-width="2" fill="none"/>
                        <path d="M14 29 Q24 26 34 29" stroke="currentColor" stroke-width="2" fill="none"/>
                        <circle cx="24" cy="8" r="2" fill="var(--accent-color)"/>
                    </svg>
                `;
            };
        }
        
        // Set center logo with fallback
        if (centerLogoImg) {
            centerLogoImg.src = centerPath;
            centerLogoImg.onerror = () => {
                // Fallback to SVG cassette if PNG not found
                centerLogo.innerHTML = `
                    <svg width="140" height="93" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="cassetteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:var(--cassette-color-1);stop-opacity:1" />
                                <stop offset="100%" style="stop-color:var(--cassette-color-2);stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <rect x="10" y="15" width="100" height="50" rx="4" fill="url(#cassetteGrad)" opacity="0.9"/>
                        <rect x="15" y="20" width="90" height="40" rx="3" fill="var(--bg-color)" opacity="0.2"/>
                        <circle cx="35" cy="40" r="10" stroke="var(--bg-color)" stroke-width="2" fill="none"/>
                        <circle cx="85" cy="40" r="10" stroke="var(--bg-color)" stroke-width="2" fill="none"/>
                        <circle cx="35" cy="40" r="5" fill="var(--bg-color)" opacity="0.4"/>
                        <circle cx="85" cy="40" r="5" fill="var(--bg-color)" opacity="0.4"/>
                        <path d="M45 40 Q60 35 75 40" stroke="var(--bg-color)" stroke-width="1.5" fill="none" opacity="0.6"/>
                        <rect x="50" y="25" width="20" height="8" rx="2" fill="var(--bg-color)" opacity="0.3"/>
                    </svg>
                `;
            };
        }
        
        // Set modal logo
        if (modalLogoImg) {
            modalLogoImg.src = centerPath;
        }
    }
    
    updateLogos();

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

    // Dropdown Menu Toggle
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.style.display = 'none';
        }
    });
    
    // Theme Toggle from menu
    function toggleTheme() {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', newTheme);
        
        // Update menu icon
        const icon = themeToggleMenu.querySelector('i');
        if (newTheme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        
        // Save preference and update logos
        localStorage.setItem('theme', newTheme);
        updateLogos();
    }
    
    themeToggleMenu.addEventListener('click', () => {
        toggleTheme();
        dropdownMenu.style.display = 'none';
    });
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.setAttribute('data-theme', savedTheme);
    const themeIcon = themeToggleMenu.querySelector('i');
    if (savedTheme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
    
    // About Menu
    aboutMenu.addEventListener('click', () => {
        aboutModal.style.display = 'flex';
        dropdownMenu.style.display = 'none';
    });
    
    aboutClose.addEventListener('click', () => {
        aboutModal.style.display = 'none';
    });
    
    aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
    });
    
    // Pre-Order Menu (opens marketing modal)
    preorderMenu.addEventListener('click', () => {
        marketingModal.style.display = 'flex';
        dropdownMenu.style.display = 'none';
    });
    
    // Center Logo Click - Opens Marketing Modal
    if (centerLogo) {
        centerLogo.addEventListener('click', () => {
            marketingModal.style.display = 'flex';
        });
    }
    
    // Marketing Modal
    marketingClose.addEventListener('click', () => {
        marketingModal.style.display = 'none';
    });
    
    marketingModal.addEventListener('click', (e) => {
        if (e.target === marketingModal) {
            marketingModal.style.display = 'none';
        }
    });
    
    // Join Beta Button
    if (joinBetaBtn) {
        joinBetaBtn.addEventListener('click', () => {
            showNotification('Beta program coming soon! Stay tuned.', 'info');
        });
    }

    // Settings Modal
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
            eqBypassBtn.disabled = false;
        } else {
            eqControlsDiv.style.display = 'none';
            eqBypassBtn.disabled = true;
            eqBypassed = false;
            eqBypassBtn.classList.remove('bypassed');
        }
    });
    
    // EQ Bypass Button - Immediately toggles EQ processing
    eqBypassBtn.addEventListener('click', () => {
        eqBypassed = !eqBypassed;
        
        if (eqBypassed) {
            eqBypassBtn.classList.add('bypassed');
            eqBypassBtn.innerHTML = '<i class="fas fa-power-off"></i> Bypassed';
            
            // Immediately set EQ to neutral
            if (lowShelf) {
                lowShelf.low.value = 0;
                lowShelf.mid.value = 0;
                lowShelf.high.value = 0;
            }
        } else {
            eqBypassBtn.classList.remove('bypassed');
            eqBypassBtn.innerHTML = '<i class="fas fa-power-off"></i> Bypass';
            
            // Restore EQ settings
            updateEQ();
        }
        
        showNotification(eqBypassed ? 'EQ Bypassed' : 'EQ Active', 'info');
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

    // Knob smoothing helper function
    function smoothKnobValue(currentValue, newValue, smoothingState, min, max) {
        const now = Date.now();
        const deltaTime = now - smoothingState.lastTime;
        
        // Calculate max allowed change based on time elapsed
        const maxChange = KNOB_SMOOTHING_CONFIG.maxRatePerMs * deltaTime;
        const valueRange = max - min;
        const maxDelta = (maxChange / 1000) * valueRange;
        
        // Clamp the change
        let delta = newValue - smoothingState.lastValue;
        if (Math.abs(delta) > maxDelta) {
            delta = Math.sign(delta) * maxDelta;
        }
        
        const smoothedValue = smoothingState.lastValue + delta;
        
        // Prevent zero/NaN values
        const safeValue = isNaN(smoothedValue) ? currentValue : smoothedValue;
        const clampedValue = Math.max(min, Math.min(max, safeValue));
        
        smoothingState.lastValue = clampedValue;
        smoothingState.lastTime = now;
        smoothingState.targetValue = newValue;
        
        return clampedValue;
    }
    
    // Speed Knob with smoothing
    speedKnob.addEventListener('input', () => {
        const rawValue = parseFloat(speedKnob.value);
        const smoothedValue = smoothKnobValue(
            speedSmoothing.lastValue,
            rawValue,
            speedSmoothing,
            50,
            200
        );
        
        speedValue.textContent = Math.round(smoothedValue) + '%';
        updateKnobIndicator(speedKnob, speedIndicator);
        updateAudioSmoothed();
    });
    
    // Pitch Knob with smoothing
    pitchKnob.addEventListener('input', () => {
        const rawValue = parseFloat(pitchKnob.value);
        const smoothedValue = smoothKnobValue(
            pitchSmoothing.lastValue,
            rawValue,
            pitchSmoothing,
            -12,
            12
        );
        
        pitchValue.textContent = smoothedValue.toFixed(1) + ' st';
        updateKnobIndicator(pitchKnob, pitchIndicator);
        updateAudioSmoothed();
    });
    
    // Add dragging class for cursor feedback
    [speedKnob, pitchKnob].forEach(knob => {
        const wrapper = knob.parentElement;
        
        knob.addEventListener('mousedown', () => {
            wrapper.classList.add('dragging');
        });
        
        knob.addEventListener('touchstart', () => {
            wrapper.classList.add('dragging');
        });
        
        document.addEventListener('mouseup', () => {
            wrapper.classList.remove('dragging');
        });
        
        document.addEventListener('touchend', () => {
            wrapper.classList.remove('dragging');
        });
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
        
        // Don't update if bypassed
        if (eqBypassed) return;

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

    // Audio Update Function with smoothing (prevents clicks/pops)
    function updateAudioSmoothed() {
        if (!player || !pitchShift) return;

        const playbackRate = speedSmoothing.lastValue / 100;
        
        // Prevent zero playback rate
        const safePlaybackRate = Math.max(0.1, Math.min(4, playbackRate));
        player.playbackRate = safePlaybackRate;

        // Compensate for pitch change from playback rate
        const timeStretchPitchCorrection = -12 * Math.log2(safePlaybackRate);
        const userPitchBend = pitchSmoothing.lastValue;
        const targetPitch = userPitchBend + timeStretchPitchCorrection;
        
        // Prevent NaN values
        const safePitch = isNaN(targetPitch) ? 0 : targetPitch;

        if (typeof Tone !== 'undefined' && Tone.context.state === 'running') {
            pitchShift.pitch.linearRampToValueAtTime(safePitch, Tone.context.currentTime + smoothingTime);
        } else if (pitchShift) {
            pitchShift.pitch = safePitch;
        }
    }
    
    // Legacy update function for compatibility
    function updateAudio() {
        updateAudioSmoothed();
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

        // Add center logo animation
        if (centerLogo) {
            centerLogo.style.animation = 'logoSpin 1s ease-in-out';
            setTimeout(() => {
                centerLogo.style.animation = '';
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
                
                showNotification('Download started!', 'success');
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
            console.error('lamejs library not loaded. Please ensure the lamejs script is included. Falling back to WAV format.');
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
