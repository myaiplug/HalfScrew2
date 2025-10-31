# Audio Quality Prevention Plan

## Overview
This document outlines the measures taken to fix audio distortion issues and prevent them from occurring in the future.

## Issues Identified

### 1. Integer Overflow in Audio Conversion
**Problem**: Audio samples were not clamped before converting from float (-1.0 to 1.0) to 16-bit integers, causing integer overflow and severe distortion, especially on bass and kicks.

**Solution**: 
- Added `Math.max(-1, Math.min(1, sample))` clamping before multiplying by `0x7FFF`
- Applied to both WAV and MP3 conversion functions

### 2. Aggressive Limiter Threshold
**Problem**: Limiter threshold was set to -1dB, which was too aggressive and caused distortion by hard-limiting the audio signal.

**Solution**:
- Changed limiter threshold from -1dB to -0.1dB
- Applied to both real-time playback and offline rendering
- Provides better headroom and more transparent limiting

### 3. Missing Mono Audio Handling
**Problem**: The bufferToWave function assumed stereo audio, which could cause issues with mono files.

**Solution**:
- Added check for mono audio: `if (!ch1 || ch1.length === 0) ch1 = ch0`
- Duplicates mono channel to both left and right for proper stereo output

### 4. WAV Format Limitations
**Problem**: WAV files are uncompressed and don't benefit from psychoacoustic encoding.

**Solution**:
- Implemented MP3 encoding using lamejs library
- Set bitrate to 320kbps for high quality
- MP3 format provides better quality-to-size ratio and is more widely compatible

## Prevention Measures

### 1. Code Quality Standards

#### Always Clamp Audio Samples
```javascript
// ✅ CORRECT - Always clamp before converting to integers
const sample = Math.max(-1, Math.min(1, floatSample)) * 0x7FFF;

// ❌ INCORRECT - Can cause overflow
const sample = floatSample * 0x7FFF;
```

#### Use Appropriate Limiter Settings
```javascript
// ✅ CORRECT - Gentle limiting with headroom
const limiter = new Tone.Limiter(-0.1);

// ⚠️ CAUTION - Aggressive limiting, may cause distortion
const limiter = new Tone.Limiter(-1);
```

#### Handle Multiple Audio Formats
```javascript
// ✅ CORRECT - Handle mono audio
const ch1 = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : buffer.getChannelData(0);

// ❌ INCORRECT - Assumes stereo
const ch1 = buffer.getChannelData(1);
```

### 2. Testing Checklist

Before deploying audio processing changes:

- [ ] Test with bass-heavy tracks (EDM, Hip-Hop)
- [ ] Test with tracks that have prominent kicks
- [ ] Test with mono audio files
- [ ] Test with stereo audio files
- [ ] Test at various speed settings (50%, 100%, 150%)
- [ ] Test with various pitch shifts (-6st to +6st)
- [ ] Test with EQ enabled and disabled
- [ ] Test with different wet/dry mix settings
- [ ] Listen for clipping, distortion, or artifacts
- [ ] Check for proper volume levels (no excessive gain or attenuation)

### 3. Quality Validation

#### Peak Level Monitoring
Consider adding peak level detection to warn users if the output might clip:
```javascript
function checkPeakLevels(buffer) {
    let maxPeak = 0;
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
            maxPeak = Math.max(maxPeak, Math.abs(channelData[i]));
        }
    }
    return maxPeak;
}
```

#### Audio Analysis Before Export
```javascript
// Check for potential issues before encoding
const peak = checkPeakLevels(buffer);
if (peak > 0.99) {
    console.warn('Audio may be clipping. Peak level:', peak);
}
```

### 4. Documentation Requirements

All audio processing code should include:
- Clear comments explaining the purpose
- Expected input/output ranges
- Any assumptions about the audio format
- References to audio engineering standards used

### 5. Monitoring and Feedback

#### User Feedback Collection
- Monitor issue reports for audio quality complaints
- Add telemetry for download success/failure rates
- Consider adding optional audio quality feedback in the UI

#### Regular Testing
- Schedule monthly audio quality testing with various file types
- Keep a library of test files that cover edge cases
- Document any new issues discovered and their solutions

## Technical Reference

### Audio Engineering Best Practices

1. **Headroom**: Always leave at least 0.1dB to 0.3dB headroom below 0dBFS
2. **Dithering**: Consider adding dithering when converting from higher to lower bit depths
3. **Sample Rate**: Maintain sample rate consistency throughout the processing chain
4. **Bit Depth**: Use at least 16-bit for output, preferably 24-bit for intermediate processing
5. **Limiting**: Use gentle limiting (threshold between -0.1dB and -0.3dB) to prevent clipping

### Known Issues and Workarounds

#### Pitch Shift Artifacts
- **Issue**: Extreme pitch shifts (±12st) may introduce artifacts
- **Mitigation**: Document recommended range (±6st)
- **Future**: Consider implementing alternative pitch shift algorithms for extreme ranges

#### Time Stretch Quality
- **Issue**: Very slow or very fast speeds may affect audio quality
- **Mitigation**: Document recommended range (50%-150%)
- **Future**: Consider implementing more advanced time-stretching algorithms

## Version History

- **v1.1** (2025-10-31): Fixed distortion issues, added MP3 export, improved limiter
- **v1.0** (Initial): Basic WAV export with time-stretch and pitch-shift

## Contact

For audio quality issues or suggestions, please open an issue on GitHub:
https://github.com/myaiplug/HalfScrew2/issues
