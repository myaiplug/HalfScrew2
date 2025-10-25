# Quick Start Guide - HalfScrew Audio Plugin

Get up and running with HalfScrew in 5 minutes!

## 🎯 What is HalfScrew?

HalfScrew is a web-based audio plugin that lets you:
- **Slow down or speed up** audio without changing pitch
- **Change the pitch** of audio without changing speed
- **Mix processed and original** audio for creative effects
- **Export your creations** as high-quality WAV files

## 🚀 Getting Started

### Step 1: Access HalfScrew

**Option A: Online (Recommended)**
- Visit: [https://myaiplug.github.io/HalfScrew2/](https://myaiplug.github.io/HalfScrew2/)
- No installation required!

**Option B: Run Locally**
```bash
# Clone the repository
git clone https://github.com/myaiplug/HalfScrew2.git
cd HalfScrew2

# Start a local server
python3 -m http.server 8080

# Open in browser
# Visit: http://localhost:8080
```

### Step 2: Unlock Controls

1. Click the **Login** button (demo mode)
2. Click **Login** in the modal (no credentials needed)
3. All controls are now active!

### Step 3: Load Your Audio

1. Click **Choose File** button
2. Select an MP3 or WAV file from your computer
3. Wait for "Ready" status
4. Your audio is loaded and ready to process!

### Step 4: Adjust Effects

#### Time Shift Knob (Left)
- **Click and drag** up/down to adjust
- **Range**: 50% to 150%
- **100% = Normal speed**
- **50% = Half speed** (slower)
- **150% = 1.5x speed** (faster)
- Uses pitch correction to maintain original pitch!

#### Pitch Bend Knob (Right)
- **Click and drag** up/down to adjust
- **Range**: -6 to +6 semitones
- **0 = Original pitch**
- **Positive values** = Higher pitch
- **Negative values** = Lower pitch

#### Wet/Dry Mix Slider
- **Drag left** for more original audio (dry)
- **Drag right** for more processed audio (wet)
- **50% = Equal mix**

### Step 5: Listen

1. Click **Play** button to start playback
2. Adjust controls in real-time to hear changes
3. Watch the waveform visualizer
4. Click **Pause** to stop

### Step 6: Export Your Creation

1. Set controls to desired settings
2. Click **Download** button
3. Wait for processing (may take a few seconds)
4. Save the WAV file to your computer

## 💡 Tips & Tricks

### For Best Results
- Use high-quality source audio (WAV files preferred)
- Keep time shift between 75% and 125% for natural sound
- Subtle pitch changes (±2 semitones) sound more natural
- Experiment with the wet/dry mix for unique effects

### Creative Uses
- **Slow Practice**: Set time to 75% to practice difficult passages
- **Pitch Matching**: Adjust pitch to match your vocal range
- **Sound Design**: Extreme settings create interesting textures
- **DJ Tool**: Quick pitch adjustments for harmonic mixing

### Keyboard Tips
- Use **Shift + drag** on knobs for fine control
- Scroll wheel on knobs for precise adjustments

## 🎵 Example Workflows

### Workflow 1: Learning a Song
1. Load the song
2. Set time shift to 75% (slower)
3. Keep pitch at 0 (original)
4. Practice along with slowed version
5. Gradually increase speed as you improve

### Workflow 2: Change Key
1. Load your audio
2. Keep time shift at 100%
3. Adjust pitch to desired key
   - +2 semitones = up one whole step
   - -3 semitones = down three half steps
4. Export in new key

### Workflow 3: Creative Effect
1. Load audio
2. Set time shift to 50% (very slow)
3. Set pitch to +6 (up an octave)
4. Set wet/dry to 30% (subtle effect)
5. Create dreamy, atmospheric sound

## ⚙️ Technical Requirements

### Browser Support
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

### System Requirements
- Modern computer (2015 or newer)
- 4GB RAM recommended
- Internet connection (for CDN resources)
- Audio output device

### File Formats
- **Supported**: MP3, WAV
- **Recommended**: WAV for best quality
- **Max file size**: Limited by browser memory (typically 100MB+)

## 🐛 Troubleshooting

### Audio Won't Play
- ✅ Check if file is loaded ("Ready" status)
- ✅ Ensure volume is up
- ✅ Try a different browser
- ✅ Check browser console for errors

### Download Doesn't Work
- ✅ Ensure audio is fully loaded
- ✅ Wait for processing to complete
- ✅ Check browser download settings
- ✅ Try with a shorter audio file first

### Controls Are Disabled
- ✅ Click the Login button
- ✅ Complete the login process
- ✅ Refresh the page if needed

### Visualizer Not Showing
- ✅ Make sure audio is playing
- ✅ Check if Tone.js loaded properly
- ✅ Disable ad blockers (may block CDN)

## 📱 Mobile Support

HalfScrew works on mobile devices:
- Use touch to control knobs and sliders
- Portrait mode recommended
- May be slower on older devices
- Upload files from cloud storage

## 🔗 Useful Links

- **GitHub Repository**: https://github.com/myaiplug/HalfScrew2
- **Report Issues**: https://github.com/myaiplug/HalfScrew2/issues
- **Full Documentation**: See README.md
- **Deployment Guide**: See DEPLOYMENT.md

## 🎓 Learn More

### Audio Processing Concepts
- **Time-stretching**: Changes speed without affecting pitch
- **Pitch-shifting**: Changes pitch without affecting speed
- **Wet/Dry Mix**: Blends processed and original signals

### Advanced Topics
- Check out [Tone.js documentation](https://tonejs.github.io/)
- Learn about [Web Audio API](https://developer.mozilla.org/en-US/Web_Audio_API)
- Explore audio production techniques

## 💬 Get Help

Need assistance?
1. Check this guide first
2. Read the troubleshooting section
3. Open an issue on GitHub
4. Join the community discussions

---

**Happy Audio Processing!** 🎵

Made with ❤️ by the HalfScrew team
