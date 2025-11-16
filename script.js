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
    // Modals
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
    const eqBtn = document.getElementById('eq-btn');
    const eqModal = document.getElementById('eq-modal');
    const eqClose = document.getElementById('eq-close');
    const eqBypassBtn = document.getElementById('eq-bypass-btn');
    
    // Toolbar controls
    const fileInput = document.getElementById('file-input');
    const loadBtn = document.getElementById('load-btn');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const rewindBtn = document.getElementById('rewind-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const toolbarDownloadBtn = document.getElementById('toolbar-download-btn');
    
    // Legacy controls (still in settings modal)
    const playButton = document.getElementById('play-button');
    const downloadButton = document.getElementById('download-button');
    
    // Settings controls
    const wetDryMixSlider = document.getElementById('wet-dry-mix');
    const wetDryValue = document.getElementById('wet-dry-value');
    const eqEnableCheckbox = document.getElementById('eq-enable');
    const eqBypassBtn = document.getElementById('eq-bypass');
    const lufsNormalizeCheckbox = document.getElementById('lufs-normalize');
    
    // EQ controls
    const lowEqKnob = document.getElementById('low-eq');
    const midEqKnob = document.getElementById('mid-eq');
    const highEqKnob = document.getElementById('high-eq');
    const highEqValue = document.getElementById('high-eq-value');
    const lowDbValue = document.getElementById('low-db');
    const midDbValue = document.getElementById('mid-db');
    const highDbValue = document.getElementById('high-db');
    const lowVisualizer = document.getElementById('low-visualizer');
    const midVisualizer = document.getElementById('mid-visualizer');
    const highVisualizer = document.getElementById('high-visualizer');
    
    // Cassette icon
    const cassetteIcon = document.getElementById('cassette-icon');
    
    // Side Panel controls
    const sidePanelToggle = document.getElementById('side-panel-toggle');
    const sideEffectsPanel = document.getElementById('side-effects-panel');
    const sidePanelClose = document.getElementById('side-panel-close');
    
    // Effect controls
    const reverbMix = document.getElementById('reverb-mix');
    const reverbValue = document.getElementById('reverb-value');
    const reverbDecay = document.getElementById('reverb-decay');
    const reverbDecayValue = document.getElementById('reverb-decay-value');
    
    const delayMix = document.getElementById('delay-mix');
    const delayValue = document.getElementById('delay-value');
    const delayTime = document.getElementById('delay-time');
    const delayTimeValue = document.getElementById('delay-time-value');
    const delayFeedback = document.getElementById('delay-feedback');
    const delayFeedbackValue = document.getElementById('delay-feedback-value');
    
    const phaserMix = document.getElementById('phaser-mix');
    const phaserValue = document.getElementById('phaser-value');
    const phaserFreq = document.getElementById('phaser-freq');
    const phaserFreqValue = document.getElementById('phaser-freq-value');
    const phaserDepth = document.getElementById('phaser-depth');
    const phaserDepthValue = document.getElementById('phaser-depth-value');
    
    const chorusMix = document.getElementById('chorus-mix');
    const chorusValue = document.getElementById('chorus-value');
    const chorusFreq = document.getElementById('chorus-freq');
    const chorusFreqValue = document.getElementById('chorus-freq-value');
    const chorusDepth = document.getElementById('chorus-depth');
    const chorusDepthValue = document.getElementById('chorus-depth-value');
    
    const stereoWidth = document.getElementById('stereo-width');
    const stereoWidthValue = document.getElementById('stereo-width-value');
    
    // DJ Chop effect controls (may not exist in HTML)
    const chopCrossfader = document.getElementById('chop-crossfader');
    const crossfaderValue = document.getElementById('crossfader-value');
    const chopRateControl = document.getElementById('chop-rate');
    const chopRateValue = document.getElementById('chop-rate-value');
    const turntable = document.getElementById('turntable');
    const turntableArm = document.getElementById('turntable-arm');
    const turntableStatus = document.getElementById('turntable-status');
    
    // State
    let isPlaying = false;
    let isRepeatOn = false;
    let isEqBypassed = false;
    let isSidePanelOpen = false;
    
    // DJ Chop effect state
    let chopIntensity = 0;
    let chopRate = 8;
    let chopInterval = null;
    let chopPhase = 0;
    let turntableRotation = 0;
    
    // Visualizer state
    let lowEnergy = 0;
    let midEnergy = 0;
    let highEnergy = 0;
    let analyser = null;
    let animationFrameId = null;
    
    // Clipping detection state
    let isLowClipping = false;
    let isMidClipping = false;
    let isHighClipping = false;
    
    // Constants
    const FFT_NORMALIZATION_OFFSET = 100;
    const FFT_NORMALIZATION_DIVISOR = 1 / FFT_NORMALIZATION_OFFSET;
    const CLIPPING_THRESHOLD = 95;
    const CLIPPING_FLASH_DURATION = 500;
    const LOW_FREQ_RANGE_FACTOR = 0.05; // ~20-400 Hz range
    const MID_FREQ_RANGE_FACTOR = 0.2;  // ~400-2500 Hz range
    
    // Chop effect constants
    const TURNTABLE_ROTATION_LIGHT = 10; // degrees for light chop
    const TURNTABLE_ROTATION_HEAVY = 20; // degrees for heavy chop
    
    // Clipping timeout IDs for cleanup
    let lowClippingTimeout = null;
    let midClippingTimeout = null;
    let highClippingTimeout = null;

    // Initialize buttons
    if (playButton) playButton.disabled = true;
    if (downloadButton) downloadButton.disabled = true;
    
    // Initialize turntable arm transform origin (set once)
    if (turntableArm) {
        turntableArm.style.transformOrigin = '100px 100px';
    }

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
    let chopGain; // For chop effect volume control
    
    // Effect units
    let reverb;
    let reverbWet;
    let delay;
    let delayWet;
    let phaser;
    let phaserWet;
    let chorus;
    let chorusWet;
    let stereoWidener;
    
    const smoothingTime = 0.15; // Increased for smoother knob movement and artifact prevention

    // Check if Tone.js is available
    if (typeof Tone === 'undefined') {
        console.warn('Tone.js not loaded. Audio processing will be unavailable.');
        showNotification('Audio library not loaded. Some features may not work.', 'warning');
    } else {
        // Initialize Tone.js components with pro-quality settings
        // High-quality pitch shifting with window size optimization
        pitchShift = new Tone.PitchShift({ 
            pitch: 0,
            windowSize: 0.1, // Smaller window for better transient response
            delayTime: 0, // Minimize latency
            feedback: 0 // No feedback for cleaner sound
        });
        
        // Enhanced EQ with better frequency separation
        lowShelf = new Tone.EQ3({
            low: 0,
            mid: 0,
            high: 0,
            lowFrequency: 400,
            highFrequency: 2500
        });
        
        // Initialize effects with improved quality settings for "chopped and screwed" sound
        reverb = new Tone.Reverb({
            decay: 1.5,
            preDelay: 0.01
        }).toDestination();
        reverbWet = new Tone.Gain(0);
        
        // Tape-style delay for classic chopped & screwed feel
        delay = new Tone.FeedbackDelay({
            delayTime: 0.25,
            feedback: 0.3,
            maxDelay: 1
        }).toDestination();
        delayWet = new Tone.Gain(0);
        
        // Sweeping phaser for movement
        phaser = new Tone.Phaser({
            frequency: 0.5,
            octaves: 3,
            baseFrequency: 350
        }).toDestination();
        phaserWet = new Tone.Gain(0);
        
        // Chorus for depth and width
        chorus = new Tone.Chorus({
            frequency: 1.5,
            delayTime: 3.5,
            depth: 0.7,
            spread: 180
        }).toDestination();
        chorus.start();
        chorusWet = new Tone.Gain(0);
        
        // Stereo widening for spaciousness
        stereoWidener = new Tone.StereoWidener(0).toDestination();
        
        // Professional limiter with gentle threshold to preserve dynamics
        limiter = new Tone.Limiter(-0.5); // More headroom for better quality
        
        // Initialize chop gain for DJ chop effect
        chopGain = new Tone.Gain(1);
        
        // Enhanced audio chain with effects
        pitchShift.connect(lowShelf);
        lowShelf.connect(chopGain); // Insert chop gain before limiter
        chopGain.connect(limiter);
        limiter.toDestination();
        
        // Connect effects in parallel
        limiter.connect(reverbWet);
        reverbWet.connect(reverb);
        
        limiter.connect(delayWet);
        delayWet.connect(delay);
        
        limiter.connect(phaserWet);
        phaserWet.connect(phaser);
        
        limiter.connect(chorusWet);
        chorusWet.connect(chorus);
        
        limiter.connect(stereoWidener);
        
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
    // EQ Modal
    eqBtn.addEventListener('click', () => {
        eqModal.style.display = 'flex';
        if (!analyser && player) {
            setupAnalyser();
        }
        if (!animationFrameId) {
            updateVisualizer();
        }
    });
    
    eqClose.addEventListener('click', () => {
        eqModal.style.display = 'none';
        // Clean up clipping timeouts when modal closes
        if (lowClippingTimeout) {
            clearTimeout(lowClippingTimeout);
            lowClippingTimeout = null;
            isLowClipping = false;
        }
        if (midClippingTimeout) {
            clearTimeout(midClippingTimeout);
            midClippingTimeout = null;
            isMidClipping = false;
        }
        if (highClippingTimeout) {
            clearTimeout(highClippingTimeout);
            highClippingTimeout = null;
            isHighClipping = false;
        }
    });
    
    eqModal.addEventListener('click', (e) => {
        if (e.target === eqModal) {
            eqModal.style.display = 'none';
            // Clean up clipping timeouts when modal closes
            if (lowClippingTimeout) {
                clearTimeout(lowClippingTimeout);
                lowClippingTimeout = null;
                isLowClipping = false;
            }
            if (midClippingTimeout) {
                clearTimeout(midClippingTimeout);
                midClippingTimeout = null;
                isMidClipping = false;
            }
            if (highClippingTimeout) {
                clearTimeout(highClippingTimeout);
                highClippingTimeout = null;
                isHighClipping = false;
            }
        }
    });

    // EQ Bypass Button
    eqBypassBtn.addEventListener('click', () => {
        isEqBypassed = !isEqBypassed;
        eqBypassBtn.classList.toggle('active', isEqBypassed);
        
        if (lowShelf) {
            if (isEqBypassed) {
                // Bypass EQ by setting all bands to 0
                if (typeof Tone !== 'undefined' && Tone.context.state === 'running') {
                    lowShelf.low.linearRampToValueAtTime(0, Tone.context.currentTime + smoothingTime);
                    lowShelf.mid.linearRampToValueAtTime(0, Tone.context.currentTime + smoothingTime);
                    lowShelf.high.linearRampToValueAtTime(0, Tone.context.currentTime + smoothingTime);
                } else {
                    lowShelf.low.value = 0;
                    lowShelf.mid.value = 0;
                    lowShelf.high.value = 0;
                }
            } else {
                // Restore EQ values
                updateEQ();
            }
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

        lowDbValue.textContent = lowGain.toFixed(1) + ' dB';
        midDbValue.textContent = midGain.toFixed(1) + ' dB';
        highDbValue.textContent = highGain.toFixed(1) + ' dB';

        if (!lowShelf) return;
        
        // Don't update if bypassed
        if (eqBypassed) return;
        if (!lowShelf || isEqBypassed) return;

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
    // Chop Effect Controls (only if elements exist)
    if (chopCrossfader && crossfaderValue) {
        chopCrossfader.addEventListener('input', (e) => {
            chopIntensity = parseFloat(e.target.value);
            crossfaderValue.textContent = Math.round(chopIntensity) + '%';
            
            // Update turntable visual state
            updateTurntableStatus();
            
            // Start or stop chop effect
            if (chopIntensity > 0 && isPlaying) {
                startChopEffect();
            } else {
                stopChopEffect();
            }
        });
    }

    if (chopRateControl && chopRateValue) {
        chopRateControl.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            // Map slider values to musical note divisions - now using a function for distinct mappings
            function getRateMapping(val) {
                switch (val) {
                case 4:  return { rate: 4, label: '1/4' };      // Quarter notes
                case 5:  return { rate: 6, label: '1/8T' };     // Eighth note triplets
                case 6:  return { rate: 8, label: '1/8' };      // Eighth notes
                case 9:  return { rate: 12, label: '1/16T' };   // Sixteenth note triplets
                case 12: return { rate: 16, label: '1/16' };    // Sixteenth notes
                default: return { rate: 8, label: '1/8' };      // Default to eighth notes
            }
        }
        
        const mapping = getRateMapping(value);
        chopRate = mapping.rate;
        chopRateValue.textContent = mapping.label;
        
        // Restart chop effect with new rate if active
        if (chopInterval && isPlaying) {
            startChopEffect();
        }
        });
    }

    function updateTurntableStatus() {
        if (!turntableStatus) return;
        
        if (chopIntensity === 0) {
            turntableStatus.textContent = 'READY';
            turntable?.classList.remove('chopping', 'spinning');
        } else if (chopIntensity < 50) {
            turntableStatus.textContent = 'LIGHT CHOP';
            turntable?.classList.remove('spinning');
            turntable?.classList.add('chopping');
        } else {
            turntableStatus.textContent = 'FULL CHOP';
            turntable?.classList.add('chopping');
        }
    }

    function startChopEffect() {
        if (chopInterval) {
            clearInterval(chopInterval);
        }
        
        if (chopIntensity === 0 || !isPlaying || !chopGain) return;
        
        // Calculate chop interval based on tempo and rate
        // Assuming 120 BPM base tempo, adjust as needed
        const bpm = 120;
        const beatDuration = 60 / bpm; // seconds per beat
        const chopDuration = (beatDuration * 4) / chopRate; // Duration for each chop cycle
        
        chopInterval = setInterval(() => {
            if (!chopGain || !isPlaying) {
                stopChopEffect();
                return;
            }
            
            chopPhase = (chopPhase + 1) % 2;
            const intensity = chopIntensity / 100;
            
            if (typeof Tone !== 'undefined' && Tone.context.state === 'running') {
                if (chopPhase === 0) {
                    // Chop on - reduce volume for the "chop" effect
                    // Create a more dramatic chop by reducing volume significantly
                    const targetGain = 1 - (intensity * 0.85);
                    chopGain.gain.cancelScheduledValues(Tone.context.currentTime);
                    chopGain.gain.setValueAtTime(chopGain.gain.value, Tone.context.currentTime);
                    chopGain.gain.linearRampToValueAtTime(targetGain, Tone.context.currentTime + 0.005);
                } else {
                    // Chop off - restore volume with quick attack for rhythmic effect
                    chopGain.gain.cancelScheduledValues(Tone.context.currentTime);
                    chopGain.gain.setValueAtTime(chopGain.gain.value, Tone.context.currentTime);
                    chopGain.gain.linearRampToValueAtTime(1, Tone.context.currentTime + 0.005);
                }
            }
            
            // Update turntable rotation with more dramatic movement
            const rotationAmount = intensity > 0.5 ? TURNTABLE_ROTATION_HEAVY : TURNTABLE_ROTATION_LIGHT;
            turntableRotation = (turntableRotation + (chopPhase === 0 ? rotationAmount : -rotationAmount)) % 360;
            if (turntableArm) {
                turntableArm.style.transform = `rotate(${turntableRotation}deg)`;
            }
        }, (chopDuration * 1000) / 2); // Divide by 2 for on/off cycle
    }

    function stopChopEffect() {
        if (chopInterval) {
            clearInterval(chopInterval);
            chopInterval = null;
        }
        
        // Reset gain to normal
        if (chopGain) {
            if (typeof Tone !== 'undefined' && Tone.context.state === 'running') {
                chopGain.gain.linearRampToValueAtTime(1, Tone.context.currentTime + smoothingTime);
            } else {
                chopGain.gain.value = 1;
            }
        }
        
        chopPhase = 0;
    }

    // Setup audio analyser for visualizer
    function setupAnalyser() {
        if (!player || typeof Tone === 'undefined' || !limiter) return;
        
        analyser = new Tone.Analyser('fft', 1024);
        limiter.connect(analyser);
    }

    // Update visualizer with smooth lerp
    function updateVisualizer() {
        if (!analyser || eqModal.style.display === 'none') {
            animationFrameId = null;
            return;
        }

        const values = analyser.getValue();
        const fftSize = values.length;
        
        // Frequency ranges (approximate)
        // Low: 20-400 Hz
        // Mid: 400-2500 Hz  
        // High: 2500+ Hz
        const lowRange = Math.floor(fftSize * LOW_FREQ_RANGE_FACTOR);
        const midRange = Math.floor(fftSize * MID_FREQ_RANGE_FACTOR);
        
        // Calculate average energy for each band
        let lowSum = 0, midSum = 0, highSum = 0;
        
        for (let i = 0; i < lowRange; i++) {
            lowSum += Math.abs(values[i] + FFT_NORMALIZATION_OFFSET) * FFT_NORMALIZATION_DIVISOR;
        }
        for (let i = lowRange; i < midRange; i++) {
            midSum += Math.abs(values[i] + FFT_NORMALIZATION_OFFSET) * FFT_NORMALIZATION_DIVISOR;
        }
        for (let i = midRange; i < fftSize; i++) {
            highSum += Math.abs(values[i] + FFT_NORMALIZATION_OFFSET) * FFT_NORMALIZATION_DIVISOR;
        }
        
        const targetLow = Math.min((lowSum / lowRange) * 100, 100);
        const targetMid = Math.min((midSum / (midRange - lowRange)) * 100, 100);
        const targetHigh = Math.min((highSum / (fftSize - midRange)) * 100, 100);
        
        // Smooth lerp (analog feel)
        const lerpFactor = 0.15;
        lowEnergy += (targetLow - lowEnergy) * lerpFactor;
        midEnergy += (targetMid - midEnergy) * lerpFactor;
        highEnergy += (targetHigh - highEnergy) * lerpFactor;
        
        // Update visualizer bars using CSS custom properties
        if (lowVisualizer) {
            lowVisualizer.style.setProperty('--after-height', lowEnergy + '%');
            
            // Check for clipping with flag and timeout ID to prevent timer accumulation
            if (lowEnergy > CLIPPING_THRESHOLD && !isLowClipping) {
                isLowClipping = true;
                lowVisualizer.classList.add('clipping');
                if (lowClippingTimeout) clearTimeout(lowClippingTimeout);
                lowClippingTimeout = setTimeout(() => {
                    lowVisualizer.classList.remove('clipping');
                    isLowClipping = false;
                    lowClippingTimeout = null;
                }, CLIPPING_FLASH_DURATION);
            }
        }
        
        if (midVisualizer) {
            midVisualizer.style.setProperty('--after-height', midEnergy + '%');
            if (midEnergy > CLIPPING_THRESHOLD && !isMidClipping) {
                isMidClipping = true;
                midVisualizer.classList.add('clipping');
                if (midClippingTimeout) clearTimeout(midClippingTimeout);
                midClippingTimeout = setTimeout(() => {
                    midVisualizer.classList.remove('clipping');
                    isMidClipping = false;
                    midClippingTimeout = null;
                }, CLIPPING_FLASH_DURATION);
            }
        }
        
        if (highVisualizer) {
            highVisualizer.style.setProperty('--after-height', highEnergy + '%');
            if (highEnergy > CLIPPING_THRESHOLD && !isHighClipping) {
                isHighClipping = true;
                highVisualizer.classList.add('clipping');
                if (highClippingTimeout) clearTimeout(highClippingTimeout);
                highClippingTimeout = setTimeout(() => {
                    highVisualizer.classList.remove('clipping');
                    isHighClipping = false;
                    highClippingTimeout = null;
                }, CLIPPING_FLASH_DURATION);
            }
        }
        
        animationFrameId = requestAnimationFrame(updateVisualizer);
    }

    // Audio Update Function (keeping existing logic)
    function updateAudio() {
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

    // Toolbar: Load Button
    loadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // Monitor function for repeat functionality
    function checkTransportEnd() {
        if (player && player.buffer && player.state === 'started' && Tone.Transport.state === 'started') {
            // Use Tone.Transport.seconds for proper numeric comparison
            if (Tone.Transport.seconds >= player.buffer.duration) {
                if (isRepeatOn) {
                    Tone.Transport.position = 0;
                } else {
                    Tone.Transport.stop();
                    isPlaying = false;
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
                    if (playButton) playButton.innerHTML = '<i class="fas fa-play"></i> Play';
                }
            }
            if (isPlaying) {
                requestAnimationFrame(checkTransportEnd);
            }
        }
    }

    // Toolbar: Play/Pause Button
    playPauseBtn.addEventListener('click', () => {
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
                isPlaying = true;
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
                if (playButton) playButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
                checkTransportEnd(); // Start monitoring for repeat
                
                // Start chop effect if crossfader is not at 0
                if (chopIntensity > 0) {
                    startChopEffect();
                }
            } else {
                Tone.Transport.pause();
                isPlaying = false;
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
                if (playButton) playButton.innerHTML = '<i class="fas fa-play"></i> Play';
                
                // Stop chop effect when pausing
                stopChopEffect();
            }
        }
    });

    // Toolbar: Stop Button
    stopBtn.addEventListener('click', () => {
        if (typeof Tone === 'undefined') return;
        
        if (Tone.Transport.state !== 'stopped') {
            Tone.Transport.stop();
            Tone.Transport.position = 0;
            isPlaying = false;
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
            if (playButton) playButton.innerHTML = '<i class="fas fa-play"></i> Play';
            
            // Stop chop effect
            stopChopEffect();
        }
    });

    // Toolbar: Rewind Button
    rewindBtn.addEventListener('click', () => {
        if (typeof Tone === 'undefined') return;
        
        Tone.Transport.position = 0;
        showNotification('Rewound to start', 'info');
    });

    // Toolbar: Repeat Button
    repeatBtn.addEventListener('click', () => {
        isRepeatOn = !isRepeatOn;
        repeatBtn.setAttribute('data-repeat', isRepeatOn ? 'on' : 'off');
        showNotification(`Repeat ${isRepeatOn ? 'enabled' : 'disabled'}`, 'info');
    });

    // Toolbar: Download Button
    toolbarDownloadBtn.addEventListener('click', () => {
        if (downloadButton) {
            downloadButton.click();
        }
    });

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
            // Enable toolbar buttons
            playPauseBtn.disabled = false;
            stopBtn.disabled = false;
            rewindBtn.disabled = false;
            toolbarDownloadBtn.disabled = false;
            
            // Enable legacy buttons
            if (playButton) playButton.disabled = false;
            if (downloadButton) downloadButton.disabled = false;
            
            player.sync().start(0);
            
            // Setup repeat functionality
            player.loop = false;
            player.onstop = () => {
                // Handle manual stop
                isPlaying = false;
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i><span>Play</span>';
                if (playButton) playButton.innerHTML = '<i class="fas fa-play"></i> Play';
            };
            
            if (lufsNormalizeCheckbox.checked) {
                applyLUFSNormalization();
            }
            
            // Setup analyser for visualizer
            setupAnalyser();
            
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
                    isPlaying = true;
                    
                    // Start chop effect if crossfader is not at 0
                    if (chopIntensity > 0) {
                        startChopEffect();
                    }
                } else {
                    Tone.Transport.pause();
                    playButton.innerHTML = '<i class="fas fa-play"></i> Play';
                    isPlaying = false;
                    
                    // Stop chop effect when pausing
                    stopChopEffect();
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
                const playbackRate = parseFloat(speedKnob.value) / 100;
                // Adjust rendering duration based on playback rate
                // Slower playback (rate < 1) produces longer audio, faster playback (rate > 1) produces shorter audio
                const renderDuration = player.buffer.duration / playbackRate;
                
                const buffer = await Tone.Offline(async (offline) => {
                    const offlinePlayer = new Tone.Player(player.buffer);
                    offlinePlayer.playbackRate = playbackRate;

                    const timeStretchPitchCorrection = -12 * Math.log2(playbackRate);
                    const userPitchBend = parseFloat(pitchKnob.value);
                    const totalPitchShift = userPitchBend + timeStretchPitchCorrection;

                    // High-quality offline processing with same settings as real-time
                    const offlinePitchShift = new Tone.PitchShift({ 
                        pitch: totalPitchShift,
                        windowSize: 0.1,
                        delayTime: 0,
                        feedback: 0
                    });
                    const offlineEQ = new Tone.EQ3({
                        low: parseFloat(lowEqKnob.value),
                        mid: parseFloat(midEqKnob.value),
                        high: parseFloat(highEqKnob.value),
                        lowFrequency: 400,
                        highFrequency: 2500
                    });
                    // Professional limiter with better headroom
                    const offlineLimiter = new Tone.Limiter(-0.5);

                    // Create offline effects with current settings
                    const offlineReverb = new Tone.Reverb({
                        decay: reverb ? reverb.decay : 1.5,
                        preDelay: 0.01
                    }).connect(offline.destination);
                    const offlineReverbWet = new Tone.Gain(reverbWet ? reverbWet.gain.value : 0);

                    const offlineDelay = new Tone.FeedbackDelay({
                        delayTime: delay ? delay.delayTime.value : 0.25,
                        feedback: delay ? delay.feedback.value : 0.3,
                        maxDelay: 1
                    }).connect(offline.destination);
                    const offlineDelayWet = new Tone.Gain(delayWet ? delayWet.gain.value : 0);

                    const offlinePhaser = new Tone.Phaser({
                        frequency: phaser ? phaser.frequency.value : 0.5,
                        octaves: phaser ? phaser.octaves : 3,
                        baseFrequency: 350
                    }).connect(offline.destination);
                    const offlinePhaserWet = new Tone.Gain(phaserWet ? phaserWet.gain.value : 0);

                    const offlineChorus = new Tone.Chorus({
                        frequency: chorus ? chorus.frequency.value : 1.5,
                        delayTime: 3.5,
                        depth: 0.7, // Use default value as Tone.js Chorus depth property is not directly accessible
                        spread: 180
                    }).connect(offline.destination);
                    offlineChorus.start();
                    const offlineChorusWet = new Tone.Gain(chorusWet ? chorusWet.gain.value : 0);

                    const offlineStereoWidener = new Tone.StereoWidener(
                        stereoWidener ? stereoWidener.width.value : 0
                    ).connect(offline.destination);

                    // Build audio chain
                    offlinePitchShift.connect(offlineEQ);
                    offlineEQ.connect(offlineLimiter);
                    offlineLimiter.connect(offline.destination);

                    // Connect effects in parallel
                    offlineLimiter.connect(offlineReverbWet);
                    offlineReverbWet.connect(offlineReverb);

                    offlineLimiter.connect(offlineDelayWet);
                    offlineDelayWet.connect(offlineDelay);

                    offlineLimiter.connect(offlinePhaserWet);
                    offlinePhaserWet.connect(offlinePhaser);

                    offlineLimiter.connect(offlineChorusWet);
                    offlineChorusWet.connect(offlineChorus);

                    offlineLimiter.connect(offlineStereoWidener);

                    const offlineWetGain = new Tone.Gain(parseFloat(wetDryMixSlider.value)).connect(offlinePitchShift);
                    const offlineDryGain = new Tone.Gain(1 - parseFloat(wetDryMixSlider.value)).connect(offline.destination);

                    offlinePlayer.connect(offlineDryGain);
                    offlinePlayer.connect(offlineWetGain);
                    offlinePlayer.start(0);
                }, player.buffer.duration / playbackRate);

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

    // Side Panel Toggle
    if (sidePanelToggle) {
        sidePanelToggle.addEventListener('click', () => {
            isSidePanelOpen = !isSidePanelOpen;
            sideEffectsPanel.classList.toggle('open', isSidePanelOpen);
            sidePanelToggle.classList.toggle('active', isSidePanelOpen);
        });
    }

    if (sidePanelClose) {
        sidePanelClose.addEventListener('click', () => {
            isSidePanelOpen = false;
            sideEffectsPanel.classList.remove('open');
            sidePanelToggle.classList.remove('active');
        });
    }

    // Effect Controls - Reverb
    if (reverbMix && reverbWet) {
        reverbMix.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) / 100;
            reverbValue.textContent = Math.round(value * 100) + '%';
            if (typeof Tone !== 'undefined' && Tone.context.state === 'running') {
                reverbWet.gain.linearRampToValueAtTime(value, Tone.context.currentTime + smoothingTime);
            } else if (reverbWet) {
                reverbWet.gain.value = value;
            }
        });
    }

    if (reverbDecay && reverb) {
        reverbDecay.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            reverbDecayValue.textContent = value.toFixed(1) + 's';
            if (reverb) {
                reverb.decay = value;
            }
        });
    }

    // Effect Controls - Delay
    if (delayMix && delayWet) {
        delayMix.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) / 100;
            delayValue.textContent = Math.round(value * 100) + '%';
            if (typeof Tone !== 'undefined' && Tone.context.state === 'running') {
                delayWet.gain.linearRampToValueAtTime(value, Tone.context.currentTime + smoothingTime);
            } else if (delayWet) {
                delayWet.gain.value = value;
            }
        });
    }

    if (delayTime && delay) {
        delayTime.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            delayTimeValue.textContent = value.toFixed(2) + 's';
            if (delay) {
                delay.delayTime.value = value;
            }
        });
    }

    if (delayFeedback && delay) {
        delayFeedback.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            delayFeedbackValue.textContent = value.toFixed(2);
            if (delay) {
                delay.feedback.value = value;
            }
        });
    }

    // Effect Controls - Phaser
    if (phaserMix && phaserWet) {
        phaserMix.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) / 100;
            phaserValue.textContent = Math.round(value * 100) + '%';
            if (typeof Tone !== 'undefined' && Tone.context.state === 'running') {
                phaserWet.gain.linearRampToValueAtTime(value, Tone.context.currentTime + smoothingTime);
            } else if (phaserWet) {
                phaserWet.gain.value = value;
            }
        });
    }

    if (phaserFreq && phaser) {
        phaserFreq.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            phaserFreqValue.textContent = value.toFixed(1) + ' Hz';
            if (phaser) {
                phaser.frequency.value = value;
            }
        });
    }

    if (phaserDepth && phaser) {
        const MAX_PHASER_OCTAVES = 5; // Maximum octaves for phaser depth
        phaserDepth.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            phaserDepthValue.textContent = value.toFixed(2);
            // Phaser depth is controlled by octaves in Tone.js
            if (phaser) {
                phaser.octaves = value * MAX_PHASER_OCTAVES; // Scale 0-1 to 0-5 octaves
            }
        });
    }

    // Effect Controls - Chorus
    if (chorusMix && chorusWet) {
        chorusMix.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) / 100;
            chorusValue.textContent = Math.round(value * 100) + '%';
            if (typeof Tone !== 'undefined' && Tone.context.state === 'running') {
                chorusWet.gain.linearRampToValueAtTime(value, Tone.context.currentTime + smoothingTime);
            } else if (chorusWet) {
                chorusWet.gain.value = value;
            }
        });
    }

    if (chorusFreq && chorus) {
        chorusFreq.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            chorusFreqValue.textContent = value.toFixed(1) + ' Hz';
            if (chorus) {
                chorus.frequency.value = value;
            }
        });
    }

    if (chorusDepth && chorus) {
        chorusDepth.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            chorusDepthValue.textContent = value.toFixed(2);
            if (chorus) {
                chorus.depth = value;
            }
        });
    }

    // Effect Controls - Stereo Width
    if (stereoWidth && stereoWidener) {
        stereoWidth.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) / 100;
            stereoWidthValue.textContent = Math.round(value * 100) + '%';
            // Stereo widener: Map 0-100% slider to -1 to +1 range
            // 0% = -1 (inverted stereo), 50% = 0 (normal), 100% = +1 (wide)
            const width = value * 2 - 1;
            if (typeof Tone !== 'undefined' && Tone.context.state === 'running') {
                stereoWidener.width.linearRampToValueAtTime(width, Tone.context.currentTime + smoothingTime);
            } else if (stereoWidener) {
                stereoWidener.width.value = width;
            }
        });
    }
});
