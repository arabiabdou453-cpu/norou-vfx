# YouTube Player Interaction Design

## Goal

Keep the current fast, lazy-loaded video system while making interaction feel like YouTube: the centered red YouTube play icon is the explicit launch control, the existing modal keeps its current dimensions, and fullscreen can be entered and exited smoothly.

## Interaction

- The thumbnail and title remain visual content; only the centered red YouTube play icon launches the player.
- The icon is a real keyboard-accessible button with a descriptive accessible label.
- Clicking it creates exactly one privacy-enhanced YouTube iframe with native controls.
- The modal keeps its current normal size and centered position.
- Full screen expands the existing modal and changes to Exit full screen.
- Exiting fullscreen restores the same normal size; it does not choose a new intermediate size.
- Close, Escape, page hiding, or navigation destroys the iframe and stops playback.
- Previous and Next remain available and replace the single iframe rather than creating additional players.

## Motion

- The backdrop fades in and the dialog uses a short opacity-and-scale transition.
- Closing reverses the transition before the iframe is destroyed.
- Fullscreen uses the browser Fullscreen API; the normal dialog dimensions remain unchanged.
- Reduced-motion preferences disable decorative transitions.

## Performance and Safety

- No YouTube iframe or media request exists before the user activates a play icon.
- Video IDs are accepted only from the existing allow-listed portfolio map.
- External playback uses youtube-nocookie.com, a strict referrer policy, and the minimum iframe permissions needed for native controls and fullscreen.
- At most one active YouTube iframe exists.

## CSS Diagnostics

Framer exported 12 gradient stops using scientific notation close to zero:

- -2.22753e-15%
- 2.914225630988854e-14%

VS Code's CSS parser emits two parenthesis diagnostics for each value, producing 24 reported errors. Both values are visually zero. They will be normalized to 0% without changing the rendered gradients.

## Verification

- Static regression tests must fail before implementation and pass afterward.
- JavaScript syntax checks must pass.
- The initial browser state must contain six play controls, zero active YouTube iframes, and zero YouTube media requests.
- Clicking the play icon must open one iframe.
- Fullscreen must enter and exit while preserving the normal modal size.
- Closing must remove the iframe, and it must not return after a timed wait.
- Desktop and 390px mobile layouts must be checked in Chrome DevTools.
- The scientific-notation values and the related VS Code CSS diagnostics must be absent after normalization.
