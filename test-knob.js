// Test script to verify knob functionality
const speedKnob = document.getElementById('speed-knob');
const speedValue = document.getElementById('speed-value');
const pitchKnob = document.getElementById('pitch-knob');
const pitchValue = document.getElementById('pitch-value');

// Test speed knob
speedKnob.value = 125;
speedKnob.dispatchEvent(new Event('input', { bubbles: true }));
console.log('Speed value after change:', speedValue.textContent);

// Test pitch knob
pitchKnob.value = 3.5;
pitchKnob.dispatchEvent(new Event('input', { bubbles: true }));
console.log('Pitch value after change:', pitchValue.textContent);

// Test theme
const body = document.body;
console.log('Current theme:', body.getAttribute('data-theme'));
