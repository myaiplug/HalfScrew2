# HalfScrew - The Slow Motion Potion

Professional web-based audio plugin for time-stretching and pitch-shifting. Change speed without affecting pitch, or adjust pitch independently.

## Features

### Audio Processing
- **Time Stretching**: Adjust playback speed from 50% to 150% without affecting pitch
- **Pitch Shifting**: Shift pitch by ±6 semitones independently of speed
- **Wet/Dry Mix**: Blend processed and original audio
- **3-Band EQ**: Control low, mid, and high frequencies
- **LUFS Normalization**: Automatic loudness normalization

### Preset System
- **Save Presets**: Store your favorite knob settings with custom names
- **Load Presets**: Quickly recall saved configurations
- **Delete Presets**: Manage your preset library
- **Auto-Load**: Automatically apply selected preset from dropdown
- **Local Storage**: Presets are saved in browser localStorage

### API Integration
- **API Documentation**: Built-in documentation modal showing all available endpoints
- **Health Check**: Test backend server connection
- **Email Collection**: Save user emails for download tracking
- **User Management**: Admin endpoint to retrieve registered users

### User Interface
- **Light/Dark Theme**: Toggle between purple and orange color schemes
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Visualization**: Animated knob controls with indicators
- **Toast Notifications**: User-friendly feedback messages

## Quick Start

### Online Demo

Visit the live demo: [HalfScrew Audio Plugin](https://myaiplug.github.io/HalfScrew2/)

### Using Presets

1. Click the **Settings** button (top right gear icon)
2. Adjust the Speed, Pitch, and other controls to your liking
3. Click the **Save** button (💾) in the Presets section
4. Enter a name for your preset
5. To load a preset, select it from the dropdown or click the **Load** button (📂)

### Using the API

1. Click the **API** button (bottom left code icon)
2. View available endpoints and their documentation
3. Click **Test Connection** to verify the backend server is running
4. The backend must be running on `localhost:3000` for API features to work

### Running with Backend

```bash
# Install dependencies
npm install

# Start the backend server
npm run server

# Access the application at http://localhost:3000
```

