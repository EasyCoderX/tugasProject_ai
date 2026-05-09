# Celebration Overlay Design

**Date:** 2026-05-09
**Topic:** Achievement Celebration Overlay
**Status:** Approved

## Overview

A full-screen celebration overlay that appears when an achievement is unlocked, featuring a large animated achievement badge, confetti animation, cheerful sound effect, and a "Continue" button to dismiss. The overlay supports 3 languages (en/id/zh), uses theme-aware styling, and requires user interaction to dismiss.

## Component Structure

### New Component: `src/components/CelebrationOverlay.tsx`

**Props Interface:**
```typescript
interface CelebrationOverlayProps {
  isOpen: boolean;
  emoji: string;
  title: string;
  onClose: () => void;
  theme: ThemeConfig;
}
```

**Component State:**
- Internal state for animation phases (entrance, idle, exit)
- Ref for sound effect audio context

**Key Methods:**
- `playCelebrationSound()` - Generates and plays "ta-da!" sound
- `handleClose()` - Triggers exit animation then calls `onClose`

**Placement:**
- Rendered in `page.tsx` alongside existing `Confetti` component
- Positioned with `fixed inset-0 z-50` to cover full screen

## Visual Design & Animations

### Background
- Semi-transparent overlay using theme's background color with 70% opacity
- Backdrop blur effect (`backdrop-blur-sm`) for depth
- Gradient overlay matching theme's accent color (10% opacity)

### Achievement Badge Animation
- Entrance: Scale from 0 to 1 with elastic easing (0.5s)
- Idle: Gentle floating/bobbing animation (2s loop)
- Emoji: 80px size with bounce effect on entrance
- Title: Large text (text-3xl), bold, theme's text color
- Glow effect using theme's shadow color

### Continue Button
- Large button (h-14, px-8) at bottom with margin
- Theme's accent color background
- Rounded corners using theme's buttonRadius
- Scale animation on hover/tap
- "Continue" text localized

### Confetti Integration
- Existing `Confetti` component renders behind overlay
- Confetti triggers when overlay opens

## Sound Effect Implementation

### Sound Generation (Web Audio API)

**Approach:** Generate a cheerful "ta-da!" sound using oscillators

**Sound Composition:**
- First note: C5 (523.25 Hz) - 0.15s duration
- Second note: E5 (659.25 Hz) - 0.15s duration
- Third note: G5 (783.99 Hz) - 0.3s duration
- Waveform: Sine wave with slight detune for richness
- Envelope: Quick attack, medium decay
- Volume: 0.3 (not too loud for kids)

**Implementation:**
```typescript
function playCelebrationSound() {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  const durations = [0.15, 0.15, 0.3];

  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.2 + durations[i]);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + i * 0.2);
    osc.stop(audioCtx.currentTime + i * 0.2 + durations[i]);
  });
}
```

**Trigger:** Plays once when overlay opens

## Integration with page.tsx

### State Updates

Add new state for celebration overlay:
```typescript
const [celebration, setCelebration] = useState<{
  isOpen: boolean;
  emoji: string;
  title: string;
}>({ isOpen: false, emoji: '', title: '' });
```

### Update triggerCelebration
```typescript
const triggerCelebration = useCallback((message: string) => {
  // Parse emoji and title from message (e.g., "🎉 First Discovery!")
  const emoji = message.split(' ')[0] || '🎉';
  const title = message.substring(message.indexOf(' ') + 1) || message;

  setCelebration({ isOpen: true, emoji, title });
  setShowConfetti(true);
}, []);
```

### Handle Close
```typescript
const handleCelebrationClose = useCallback(() => {
  setCelebration({ isOpen: false, emoji: '', title: '' });
  setShowConfetti(false);
}, []);
```

### Render
```typescript
<CelebrationOverlay
  isOpen={celebration.isOpen}
  emoji={celebration.emoji}
  title={celebration.title}
  onClose={handleCelebrationClose}
  theme={THEMES[theme]}
/>
```

**Placement:** After `<Confetti />`, before main content

## Error Handling & Edge Cases

### Audio Context Errors
- Handle cases where Web Audio API is not supported
- Catch and log audio errors without breaking the UI
- Gracefully degrade if audio fails (visuals still work)

### Animation Fallbacks
- If framer-motion animations fail, show static overlay
- Ensure overlay is always dismissible even if animations break

### Performance
- Clean up audio context when overlay closes
- Don't create multiple audio contexts (reuse or cleanup properly)
- Ensure confetti cleanup happens on close

### Accessibility
- Add ARIA labels for screen readers
- Ensure keyboard navigation works (Escape key to close)
- Respect reduced motion preferences

## Testing Considerations

### Manual Testing Checklist
- Overlay appears correctly on achievement unlock
- Confetti animation plays in background
- Sound effect plays once on open
- "Continue" button dismisses overlay
- Overlay works in all 3 languages (en/id/zh)
- Theme colors apply correctly
- Overlay dismisses on Escape key
- Audio respects device mute state
- No memory leaks after multiple celebrations

### Browser Testing
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
- Desktop and mobile viewports

## i18n Requirements

Add to `src/lib/i18n.ts`:
```typescript
continue: 'Continue',
```

For all 3 languages (en/id/zh).
