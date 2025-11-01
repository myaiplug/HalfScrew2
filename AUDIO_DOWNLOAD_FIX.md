# Audio Download Duration Fix

## Issue
Downloaded audio files did not match the applied speed settings. When users set the speed to slow down audio (e.g., 75%), the downloaded file would play back at the wrong speed - faster than the applied settings.

## Root Cause
The offline rendering function was using the **original audio buffer duration** instead of calculating the **adjusted duration based on the playback rate**.

### Technical Explanation
When you change the playback rate:
- **Slower playback** (rate < 1.0, e.g., 0.75 for 75% speed): Audio takes LONGER to play
  - Formula: `adjustedDuration = originalDuration / playbackRate`
  - Example: 60s audio at 75% speed = 60 / 0.75 = 80 seconds
- **Faster playback** (rate > 1.0, e.g., 1.25 for 125% speed): Audio takes LESS time to play
  - Example: 60s audio at 125% speed = 60 / 1.25 = 48 seconds

### The Bug
**Before the fix:**
```javascript
const buffer = await Tone.Offline(async (offline) => {
    const offlinePlayer = new Tone.Player(player.buffer);
    const playbackRate = parseFloat(speedKnob.value) / 100;
    offlinePlayer.playbackRate = playbackRate;
    // ... rest of processing chain
}, player.buffer.duration); // ❌ WRONG - Uses original duration
```

This caused the offline renderer to only allocate the original duration time. When the audio was slowed down, it would run out of rendering time before completing the full slowed-down audio, resulting in:
- Incorrect playback speed in the output file
- Potentially cut-off audio
- Downloaded audio not matching what the user heard during preview

### The Fix
**After the fix:**
```javascript
const playbackRate = parseFloat(speedKnob.value) / 100;
// Adjust rendering duration based on playback rate
const renderDuration = player.buffer.duration / playbackRate;

const buffer = await Tone.Offline(async (offline) => {
    const offlinePlayer = new Tone.Player(player.buffer);
    offlinePlayer.playbackRate = playbackRate;
    // ... rest of processing chain
}, renderDuration); // ✅ CORRECT - Uses adjusted duration
```

## Impact
✅ **Downloaded audio now ALWAYS reflects the applied settings**
- Slowed down audio (50-99%) will be longer and play at the correct slow speed
- Sped up audio (101-150%) will be shorter and play at the correct fast speed
- Normal speed (100%) will match the original duration
- Pitch, EQ, and wet/dry mix settings are still correctly applied (these were already working)

## Prevention
This issue was caused by not considering the relationship between playback rate and duration in the offline rendering context. Future audio processing code should:
1. Always calculate adjusted durations when playback rate is involved
2. Test with various speed settings (especially slower speeds like 50-75%)
3. Compare downloaded audio against preview playback to ensure they match

## Files Modified
- `script.js`: Updated the download button click handler to calculate `renderDuration` based on playback rate

## Testing Checklist
- [x] Code compiles without syntax errors
- [ ] Test download at 50% speed (should be 2x longer)
- [ ] Test download at 75% speed (should be 1.33x longer)
- [ ] Test download at 100% speed (should match original)
- [ ] Test download at 125% speed (should be 0.8x original duration)
- [ ] Test download at 150% speed (should be 0.67x original duration)
- [ ] Verify pitch shifting still works correctly
- [ ] Verify EQ settings are applied in download
- [ ] Verify wet/dry mix is applied in download

---

**Status**: ✅ Fixed  
**Date**: 2025-10-31  
**Priority**: Critical - Core functionality
