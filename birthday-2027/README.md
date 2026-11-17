# Alyna + Ellene · February 2027

Invitation: https://www.thetanfamily.net/alyna/birthday-2027/

This directory holds the editable React invitation and its GitHub Pages build. Run `npm ci` and `npm run build` here, then copy the contents of `github-dist/` into both `../family/alyna/birthday-2027/` and `../docs/alyna/birthday-2027/`. Commit both the source and generated files. The existing family copy step also preserves this route. No family homepage or album changes are required.

Edit `app/page.tsx` and `lib/event.ts` when the exact February date and time are known. `app/rsvp-form.tsx` implements one household response, a total including adults and children, and private edit links that retain this nested route. Never place RSVP records or secrets in this public repository.

The existing server application remains hosted at https://alyna-ellene-birthday-2027.pesettan.chatgpt.site. Its `/api/rsvp` endpoint stores responses in the existing Cloudflare D1 database and permits the two HTTPS family origins. Only a private edit token can read or update a response. The protected `/host` dashboard and CSV export require the host's ChatGPT sign-in. The full backend source remains in the Sites source repository for project `appgprj_6afcad1f55b88191a24a963d242f094e`.

Approved images and the actual satellite parking map are served from the existing Sites media service; no image media are copied into this website repository. Fonts and their licenses are served locally because font requests require same-origin delivery or explicit CORS headers. Party details are pre-rendered and visible without JavaScript; sending and editing RSVPs requires JavaScript.
