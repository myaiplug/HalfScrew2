document.addEventListener('DOMContentLoaded', () => {
    // Add disabled class to knob wrappers initially
    document.querySelectorAll('.input-knob').forEach(knob => {
        if (knob.disabled) {
            knob.parentElement.classList.add('disabled');
        }
    });

    const timeShiftKnob = document.getElementById('time-shift');
    const timeShiftValue = document.getElementById('time-shift-value');
    const pitchBendKnob = document.getElementById('pitch-bend');
    const pitchBendValue = document.getElementById('pitch-bend-value');
    const wetDryMixSlider = document.getElementById('wet-dry-mix');
    const wetDryMixValue = document.getElementById('wet-dry-mix-value');
    const fileInput = document.getElementById('file-input');
    const playButton = document.getElementById('play-button');
    const downloadButton = document.getElementById('download-button');
    const audioPlayer = document.getElementById('audio-player');

    let player;
    let pitchShift;
    let wetDry;

    // Initialize Tone.js components
    pitchShift = new Tone.PitchShift({
        pitch: 0
    }).toDestination();

    wetDry = new Tone.Gain(0.5).connect(pitchShift);

    const dryGain = new Tone.Gain(0.5).toDestination();

    // UI Updates
    const updateAudio = () => {
        if (!player || !pitchShift) return;

        const playbackRate = parseFloat(timeShiftKnob.value) / 100;
        player.playbackRate = playbackRate;

        // Compensate for pitch change from playback rate to achieve time-stretching
        const timeStretchPitchCorrection = -12 * Math.log2(playbackRate);

        const userPitchBend = parseFloat(pitchBendKnob.value);

        // Combine the two pitch values
        pitchShift.pitch = userPitchBend + timeStretchPitchCorrection;

        timeShiftValue.textContent = timeShiftKnob.value;
        pitchBendValue.textContent = pitchBendKnob.value;
    };

    timeShiftKnob.addEventListener('input', updateAudio);
    pitchBendKnob.addEventListener('input', updateAudio);

    wetDryMixSlider.addEventListener('input', (e) => {
        if (wetDry && dryGain) {
            const mix = parseFloat(e.target.value);
            wetDry.gain.value = mix;
            dryGain.gain.value = 1 - mix;
        }
        wetDryMixValue.textContent = e.target.value;
    });

    // Audio Loading
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            if (player) {
                player.dispose();
            }
            // If a file is already playing, stop it and reset.
            if (Tone.Transport.state !== 'stopped') {
                Tone.Transport.stop();
                Tone.Transport.position = 0;
                playButton.textContent = 'Play';
            }

            player = new Tone.Player(url, () => {
                playButton.disabled = false;
                downloadButton.disabled = false;
                player.sync().start(0);
            });

            player.connect(dryGain);
            player.connect(wetDry);

            audioPlayer.src = url;
        }
    });

    // Transport
    playButton.addEventListener('click', () => {
        if (player && player.loaded) {
            // It's good practice to resume the AudioContext on a user gesture.
            if (Tone.context.state !== 'running') {
                Tone.context.resume();
            }
            if (Tone.Transport.state !== 'started') {
                Tone.Transport.start();
                playButton.textContent = 'Pause';
            } else {
                Tone.Transport.pause();
                playButton.textContent = 'Play';
            }
        }
    });

    // Download
    downloadButton.addEventListener('click', async () => {
        if (!player || !player.loaded) return;

        downloadButton.disabled = true;
        downloadButton.textContent = 'Processing...';

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
                }).connect(offline.destination); // Connect end of wet chain to destination

                const offlineWetGain = new Tone.Gain(parseFloat(wetDryMixSlider.value)).connect(offlinePitchShift);
                const offlineDryGain = new Tone.Gain(1 - parseFloat(wetDryMixSlider.value)).connect(offline.destination); // Connect end of dry chain to destination

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
            downloadButton.textContent = 'Download';
        }
    });

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

    let isLoginMode = true;

    loginButton.addEventListener('click', () => {
        authModal.style.display = 'flex';
    });

    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });

    const switchAuthMode = (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            modalTitle.textContent = 'Login';
            authSubmitButton.textContent = 'Login';
            authSwitchText.innerHTML = 'Don\'t have an account? <a href="#" id="auth-switch-link">Sign Up</a>';
        } else {
            modalTitle.textContent = 'Sign Up';
            authSubmitButton.textContent = 'Sign Up';
            authSwitchText.innerHTML = 'Already have an account? <a href="#" id="auth-switch-link">Login</a>';
        }
        document.getElementById('auth-switch-link').addEventListener('click', switchAuthMode);
    };

    authSwitchLink.addEventListener('click', switchAuthMode);

    const unlockControls = () => {
        timeShiftKnob.disabled = false;
        pitchBendKnob.disabled = false;
        wetDryMixSlider.disabled = false;
        fileInput.disabled = false;
        playButton.disabled = false;
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
});
