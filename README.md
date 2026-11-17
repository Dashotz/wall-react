# wall-react

A nostalgic Facebook-style wall built with React, Next.js, and Supabase.

Users can type a message, attach a photo, hit Share, and see their post show up in the feed right away. It also includes a 2016 Facebook layout with sidebars for Marketplace and classic games like Dragon City, 8 Ball Pool, and Criminal Case.

## What works

- Type a message and press Share to post it to the wall (no login needed).
- Posts are saved in Supabase (`wall-react` database).
- Feed loads newest posts first and keeps everything after a page refresh.
- 280-character limit with a live counter.
- Live feed updates without refreshing the page using Supabase Realtime.
- Photo upload up to 5MB (JPG, PNG, GIF, WebP).
- Mobile responsive layout.