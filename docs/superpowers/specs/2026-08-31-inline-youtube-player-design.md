# Inline YouTube Player Design

## Goal

Play every portfolio video inside its existing card instead of opening a separate modal. Preserve the original card dimensions, expose the complete native YouTube controls, and make the experience smooth on desktop and mobile.

## Approved Interaction

- Each of the six portfolio cards keeps its current thumbnail, title, and size.
- The complete red YouTube play button is the click and touch target, including its red background and white triangle.
- Clicking or pressing the play button replaces that card's thumbnail with one `youtube-nocookie.com` iframe.
- The iframe uses native YouTube controls, seeking, volume, captions, settings, picture-in-picture where supported, and fullscreen.
- A small accessible close button sits above the player and restores the card thumbnail immediately.
- Only one video can be active. Starting another video first destroys the previous iframe, stopping its audio.
- Closing, hiding the page, or leaving it destroys the active iframe. A closed video never restarts by itself.
- No YouTube iframe is created before a deliberate play-button action.

## Desktop Layout

- The player occupies exactly the same card rectangle that previously displayed the thumbnail.
- The surrounding page remains scrollable and unchanged.
- The YouTube iframe fills the card with no additional modal, backdrop, or page-size change.
- The close button remains visible without covering YouTube's main controls.

## Mobile Layout

- The card retains the existing responsive width and height.
- The complete red play button has a touch target of at least 68 by 48 CSS pixels.
- The inline iframe fills the responsive card without horizontal overflow.
- Native `playsinline` behavior keeps playback inside the page; the YouTube fullscreen control remains available.
- The close button has a minimum 44 by 44 CSS-pixel touch target and remains clear of the device edges.

## Video Set

The implementation and browser verification apply to all six configured IDs:

1. `_j9ewTMvYvk`
2. `doOU2AIX2r4`
3. `KnavSFeuBNI`
4. `tSyr8gRAS7Y`
5. `-BWhYYHI5Wk`
6. `lejcLUhH5IA`

## Error Handling

- If an iframe cannot load, the card remains closable and can return to its thumbnail.
- A failed video must not prevent another card from opening.
- The existing early guard continues preventing Framer from creating hidden or autoplaying YouTube iframes.

## Verification

- Static regression checks confirm there is no modal player and that cards host the active iframe inline.
- Before interaction: six cards, six play buttons, and zero YouTube iframes.
- Each video is opened individually and checked for the correct embed ID and exactly one active iframe.
- Starting a second video removes the first iframe.
- Closing removes the active iframe and it does not return after a delay.
- Desktop and mobile viewport tests confirm sizing, touch targets, no overflow, and native fullscreen configuration.

## Scope

This change affects only portfolio video playback and responsive player controls. It does not redesign the rest of the Framer page.
