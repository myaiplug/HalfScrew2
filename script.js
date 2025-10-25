document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = themeToggle.querySelector('i');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        body.setAttribute('data-theme', newTheme === 'light' ? null : 'dark');
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }
    
    // Controls Drawer Toggle
    const controlsToggle = document.getElementById('controls-toggle');
    const controlsDrawer = document.getElementById('controls-drawer');
    let drawerOpen = false;
    
    // Show the controls toggle button after a brief delay
    setTimeout(() => {
        controlsToggle.classList.add('visible');
    }, 500);
    
    controlsToggle.addEventListener('click', () => {
        drawerOpen = !drawerOpen;
        if (drawerOpen) {
            controlsDrawer.classList.add('open');
        } else {
            controlsDrawer.classList.remove('open');
        }
    });
    
    // File handling
    const fileInput = document.getElementById('file-input');
    const loadFileBtn = document.getElementById('load-file-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const timeShiftKnob = document.getElementById('time-shift');
    const timeShiftValue = document.getElementById('time-shift-value');
    const pitchBendKnob = document.getElementById('pitch-bend');
    const pitchBendValue = document.getElementById('pitch-bend-value');
    const audioPlayer = document.getElementById('audio-player');
    
    // Playback controls
    const playPauseBtn = document.getElementById('play-pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const rewindBtn = document.getElementById('rewind-btn');
    const downloadBtn = document.getElementById('download-drawer-btn');
    
    // Cache knob indicators for performance
    const timeShiftIndicator = document.querySelector('#time-shift + .knob-indicator');
    const pitchBendIndicator = document.querySelector('#pitch-bend + .knob-indicator');
    
    // Knob rotation constants
    const KNOB_ROTATION_RANGE = 270;
    const KNOB_CENTER_OFFSET = 135;
    const KNOB_TRANSFORM_ORIGIN = 'center 125px';
    
    let player;
    let pitchShift;
    let isPlaying = false;
    let audioLoaded = false;
    
    // Initialize Tone.js components if available
    if (typeof Tone !== 'undefined') {
        pitchShift = new Tone.PitchShift({
            pitch: 0
        });
        pitchShift.toDestination();
    }
    
    // File input triggers
    loadFileBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File validation
    const validateAudioFile = (file) => {
        const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav'];
        const maxSize = 100 * 1024 * 1024; // 100MB limit
        
        if (!allowedTypes.includes(file.type)) {
            showStatus('Please upload only audio files (MP3 or WAV)', 'error');
            return false;
        }
        
        if (file.size > maxSize) {
            showStatus('File size must be less than 100MB', 'error');
            return false;
        }
        
        return true;
    };
    
    // Load audio file
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!validateAudioFile(file)) {
                e.target.value = '';
                return;
            }
            
            if (typeof Tone === 'undefined') {
                showStatus('Audio processing library not loaded', 'error');
                return;
            }
            
            showStatus('Loading audio...', 'info');
            
            const url = URL.createObjectURL(file);
            
            // Stop any existing playback
            if (player && isPlaying) {
                Tone.Transport.stop();
                isPlaying = false;
                updatePlayIcon();
            }
            
            // Dispose of old player
            if (player) {
                player.dispose();
            }
            
            player = new Tone.Player(url, () => {
                audioLoaded = true;
                enableControls();
                player.sync().start(0);
                showStatus('Audio loaded successfully!', 'success');
                
                // Update UI
                loadFileBtn.textContent = file.name;
            }).connect(pitchShift);
        }
    });
    
    // Enable controls after audio is loaded
    function enableControls() {
        timeShiftKnob.disabled = false;
        pitchBendKnob.disabled = false;
    }
    
    // Update audio parameters
    timeShiftKnob.addEventListener('input', updateAudio);
    pitchBendKnob.addEventListener('input', updateAudio);
    
    function updateAudio() {
        if (!player || !audioLoaded) return;
        
        const playbackRate = parseFloat(timeShiftKnob.value) / 100;
        player.playbackRate = playbackRate;
        
        // Pitch correction for time stretching
        const timeStretchCorrection = -12 * Math.log2(playbackRate);
        const userPitchBend = parseFloat(pitchBendKnob.value);
        const totalPitch = userPitchBend + timeStretchCorrection;
        
        if (pitchShift) {
            pitchShift.pitch = totalPitch;
        }
        
        // Update UI
        timeShiftValue.innerHTML = `${timeShiftKnob.value}<span class="unit">%</span>`;
        pitchBendValue.innerHTML = `${parseFloat(pitchBendKnob.value).toFixed(1)}<span class="unit"> st</span>`;
        
        // Update knob indicators
        updateKnobIndicators();
    }
    
    // Update knob position indicators
    function updateKnobIndicators() {
        if (timeShiftIndicator) {
            const timeShiftPercent = (timeShiftKnob.value - timeShiftKnob.min) / (timeShiftKnob.max - timeShiftKnob.min);
            const timeShiftAngle = (timeShiftPercent * KNOB_ROTATION_RANGE) - KNOB_CENTER_OFFSET;
            timeShiftIndicator.style.transform = `translateX(-50%) rotate(${timeShiftAngle}deg)`;
            timeShiftIndicator.style.transformOrigin = KNOB_TRANSFORM_ORIGIN;
        }
        
        if (pitchBendIndicator) {
            const pitchBendPercent = (pitchBendKnob.value - pitchBendKnob.min) / (pitchBendKnob.max - pitchBendKnob.min);
            const pitchBendAngle = (pitchBendPercent * KNOB_ROTATION_RANGE) - KNOB_CENTER_OFFSET;
            pitchBendIndicator.style.transform = `translateX(-50%) rotate(${pitchBendAngle}deg)`;
            pitchBendIndicator.style.transformOrigin = KNOB_TRANSFORM_ORIGIN;
        }
    }
    
    // Initialize indicators on load
    updateKnobIndicators();
    
    // Play/Pause control
    playPauseBtn.addEventListener('click', () => {
        if (!audioLoaded) {
            showStatus('Please load an audio file first', 'warning');
            return;
        }
        
        if (typeof Tone === 'undefined') return;
        
        if (Tone.context.state !== 'running') {
            Tone.context.resume();
        }
        
        if (!isPlaying) {
            Tone.Transport.start();
            isPlaying = true;
            showStatus('Playing...', 'info');
        } else {
            Tone.Transport.pause();
            isPlaying = false;
            showStatus('Paused', 'info');
        }
        
        updatePlayIcon();
    });
    
    function updatePlayIcon() {
        const icon = playPauseBtn.querySelector('i');
        if (isPlaying) {
            icon.className = 'fas fa-pause';
        } else {
            icon.className = 'fas fa-play';
        }
    }
    
    // Stop control
    stopBtn.addEventListener('click', () => {
        if (!audioLoaded || typeof Tone === 'undefined') return;
        
        Tone.Transport.stop();
        Tone.Transport.position = 0;
        isPlaying = false;
        updatePlayIcon();
        showStatus('Stopped', 'info');
    });
    
    // Rewind control
    rewindBtn.addEventListener('click', () => {
        if (!audioLoaded || typeof Tone === 'undefined') return;
        
        Tone.Transport.position = 0;
        showStatus('Rewound to beginning', 'info');
    });
    
    // Download control
    downloadBtn.addEventListener('click', async () => {
        if (!player || !audioLoaded) {
            showStatus('Please load an audio file first', 'warning');
            return;
        }
        
        showStatus('Processing audio for download...', 'info');
        downloadBtn.disabled = true;
        
        try {
            const buffer = await Tone.Offline(async (offline) => {
                const offlinePlayer = new Tone.Player(player.buffer);
                const playbackRate = parseFloat(timeShiftKnob.value) / 100;
                offlinePlayer.playbackRate = playbackRate;
                
                const timeStretchCorrection = -12 * Math.log2(playbackRate);
                const userPitchBend = parseFloat(pitchBendKnob.value);
                const totalPitch = userPitchBend + timeStretchCorrection;
                
                const offlinePitchShift = new Tone.PitchShift({
                    pitch: totalPitch
                });
                
                offlinePitchShift.toDestination();
                offlinePlayer.connect(offlinePitchShift);
                offlinePlayer.start(0);
            }, player.buffer.duration);
            
            // Convert to WAV
            const wav = bufferToWave(
                buffer.getChannelData(0),
                buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : buffer.getChannelData(0),
                buffer.sampleRate
            );
            
            const blob = new Blob([new DataView(wav)], { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'halfscrew_processed.wav';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showStatus('Download complete!', 'success');
        } catch (error) {
            console.error('Download error:', error);
            showStatus('Error processing audio', 'error');
        } finally {
            downloadBtn.disabled = false;
        }
    });
    
    // Helper: Convert AudioBuffer to WAV
    function bufferToWave(ch0, ch1, sampleRate) {
        const numChannels = 2;
        const numFrames = ch0.length;
        const buffer = new ArrayBuffer(44 + numFrames * numChannels * 2);
        const view = new DataView(buffer);
        
        // RIFF chunk
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
        view.setUint16(32, numChannels * 2, true);
        view.setUint16(34, 16, true);
        
        // Data sub-chunk
        writeString(view, 36, 'data');
        view.setUint32(40, numFrames * numChannels * 2, true);
        
        // Write PCM samples
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
    
    // Status message system
    let statusTimeout;
    function showStatus(message, type = 'info') {
        let statusEl = document.querySelector('.status-message');
        
        if (!statusEl) {
            statusEl = document.createElement('div');
            statusEl.className = 'status-message';
            document.body.appendChild(statusEl);
        }
        
        statusEl.textContent = message;
        statusEl.classList.add('show');
        
        clearTimeout(statusTimeout);
        statusTimeout = setTimeout(() => {
            statusEl.classList.remove('show');
        }, 3000);
    }
});
