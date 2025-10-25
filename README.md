# HalfScrew Audio Plugin

A premium audio time-stretching and pitch-shifting plugin for the web. HalfScrew allows you to manipulate audio in real-time with professional-grade controls and a beautiful neomorphic interface.

![HalfScrew Interface](https://github.com/user-attachments/assets/392f95b3-95f2-43d6-a5c6-5eed15be92ee)

## Features

- **Time Shift**: Adjust playback speed from 50% to 150% without affecting pitch
- **Pitch Bend**: Shift pitch up or down by ±6 semitones
- **Wet/Dry Mix**: Blend between processed and original audio
- **Real-time Audio Visualization**: See your audio waveform in action
- **Premium Neomorphic UI**: Beautiful, modern interface with smooth animations
- **Audio Export**: Download your processed audio as WAV files

## Quick Start

### Online Demo

Visit the live demo: [HalfScrew Audio Plugin](https://myaiplug.github.io/HalfScrew2/)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/myaiplug/HalfScrew2.git
cd HalfScrew2
```

2. Start a local web server:
```bash
# Using Python
python3 -m http.server 8080

# Or using Node.js
npx http-server -p 8080
```

3. Open your browser and navigate to `http://localhost:8080`

## How to Use

1. **Login**: Click the "Login" button to unlock all controls (demo mode)
2. **Load Audio**: Click "Choose File" to upload an MP3 or WAV file
3. **Adjust Controls**:
   - **Time Shift Knob**: Rotate to adjust playback speed (100% = normal)
   - **Pitch Bend Knob**: Rotate to shift pitch up or down
   - **Wet/Dry Slider**: Slide to mix processed and original audio
4. **Play**: Click the "Play" button to hear your audio with effects applied
5. **Download**: Click "Download" to export the processed audio

## Technology Stack

- **Tone.js**: Professional audio processing library
- **Web Audio API**: Browser-native audio processing
- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Modern neomorphic design with gradients and shadows
- **Font Awesome**: Professional icon set

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Audio Processing

HalfScrew uses advanced audio processing techniques:
- Independent time-stretching preserves pitch when changing speed
- High-quality pitch shifting using granular synthesis
- Real-time audio analysis and visualization
- Offline rendering for high-quality exports

## Development

### Project Structure

```
HalfScrew2/
├── index.html          # Main HTML file
├── style.css           # Neomorphic styling
├── script.js           # Audio processing logic
├── lib/
│   └── input-knobs.js  # Custom knob controls
└── README.md           # Documentation
```

### Customization

You can customize the appearance by modifying the CSS variables in `style.css`:

```css
/* Example: Change the color scheme */
body {
    background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

## Deployment

### GitHub Pages

This project is automatically deployed to GitHub Pages when changes are pushed to the main branch.

To deploy manually:
```bash
git checkout main
git push origin main
```

### Custom Hosting

Simply upload all files to any static web hosting service:
- Netlify
- Vercel
- AWS S3
- Any static file server

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

- Built with [Tone.js](https://tonejs.github.io/)
- Icons by [Font Awesome](https://fontawesome.com/)
- Design inspired by modern audio plugin interfaces

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/myaiplug/HalfScrew2/issues) on GitHub.

---

Made with ❤️ by the HalfScrew team
