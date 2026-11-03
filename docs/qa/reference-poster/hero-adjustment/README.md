# Poster hero adjustment — 3 November 2026

Moved the overview return link above the logo at the upper left, matching the owner's marked location. Kept a 44 px minimum target and added a left arrow. Reduced the desktop illustration from 132% to 94% of the hero height, removed the negative bottom offset, and constrained its width with `object-fit: contain`. The source image is unchanged; the full paper fan now fits within the desktop hero.

Browser checks at 320, 375, 1440, 1920 and 2560 px passed with no horizontal overflow, clipped text or broken images. The overview link sits above the logo at each width and was followed successfully to the home page. At every tested desktop width, the illustration's complete image box stays within the hero. Existing phone artwork treatment is retained. See [geometry results](responsive.json) and [desktop screenshot](desktop-1920.png).

`npm run build` and `npm run lint` passed. This change only adjusts page presentation and navigation placement; data selection and records are unchanged.
