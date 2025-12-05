# When the Medium Forgets: The Ephemeral Engine

An interactive digital installation exploring communication technologies with memory loss.

## Concept

This installation simulates the central argument of the paper *"When the Medium Forgets: A Theory of Communication Technologies With Memory Loss"*:

> Forgetting is not accidental or unfortunate but instead a designed, necessary, and culturally meaningful aspect of the history of communication.

The Ephemeral Engine invites users to communicate through text, drawing, or voice, then subjects their communication to one of six "forgetting algorithms" that perform deliberate, artistic decay.

## Features

### Three Input Modes
1. **Text**: Type a message
2. **Draw**: Create a drawing on a canvas
3. **Voice**: Record a voice message (requires microphone permission)

### Six Forgetting Algorithms
1. **Oral Tradition**: Text mutates and drifts with each "retelling"
2. **Sand Drawing**: Gradual erosion washes away the message
3. **Burned Letter**: Information consumed by digital fire
4. **Corrupted File**: Data decay introduces errors and glitches
5. **Auto-Delete**: Timed, deliberate erasure after serving its purpose
6. **AI Hallucination**: System generates new meanings as original fades

### Archive of the Forgotten
- Records metadata of forgotten communications (not the content)
- Shows statistics about forgetting patterns
- Embodies the politics of what gets remembered vs. what gets forgotten

## Technical Implementation

Built with:
- HTML5, CSS3, JavaScript (ES6+)
- Canvas API for drawing
- Web Audio API for voice recording
- MediaRecorder API for audio capture
- LocalStorage for archive persistence
- CSS animations for decay effects

## How to Run

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. For voice recording, allow microphone access when prompted
4. For the full experience, use a browser that supports:
   - MediaRecorder API (Chrome, Firefox, Edge)
   - Canvas API
   - CSS Animations

## Philosophical Framework

This installation explores:
- Ephemerality as a design feature
- The cultural logic of forgetting
- Technologies of memory loss vs. preservation
- The relationship between communication and temporality
- Digital intimacy through impermanence

## Extending the Project

Potential enhancements:
- Add server-side archive storage
- Implement more complex forgetting algorithms
- Add social features (shared ephemeral spaces)
- Create visualizations of decay patterns
- Add soundscapes for each algorithm

## Credits

Created as a digital companion to the research paper *"When the Medium Forgets: A Theory of Communication Technologies With Memory Loss"*.

All audio samples from Mixkit (royalty-free).

## License

Educational use only. Please credit the original concept.