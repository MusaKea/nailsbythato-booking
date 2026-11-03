# NailsbyThato Booking System

A booking website for a nail salon in Daveyton, Benoni: customers pick a treatment, date and time, agree to the booking policy and book. The owner manages bookings from a private admin page.

**Live demo:** https://YOUR-USERNAME.github.io/nailsbythato-booking/
**Demo admin page:** add `admin.html` to the link above. Password: `demo`.
**Sample confirmation email:** `email-preview.html`

The live demo runs entirely in the browser. Bookings are saved only in your own browser and no emails are sent.

## Features
- Treatment menu with prices and durations; free time slots are calculated automatically
- No double bookings (each treatment blocks the right amount of time)
- Opening hours, closed days and past times handled
- Booking policy the customer must accept
- R100 deposit flow: a booking is held, then confirmed when the owner marks the deposit as paid
- Branded HTML emails: "booking received" and "you're confirmed", plus a notification to the owner
- WhatsApp button prefilled with the booking details
- Password-protected admin page to view bookings, mark deposits and cancel
- Responsive, minimal design with light and dark mode

## What is in this repository
- Root folder: the static demo (`index.html`, `admin.html`, `demo-api.js`), hosted on GitHub Pages.
- `full-version/`: the complete Node.js and Express application with real email sending. See the README inside it to run it.

## Built with
HTML, CSS and JavaScript for the website; Node.js, Express and Nodemailer for the full version.

## Screenshots
Add screenshots here: booking page, time selection, confirmation screen, admin page, confirmation email.

## How this was built
This is a concept project I built for my portfolio, with AI assistance (Claude, by Anthropic). I described what a small nail salon needs, worked through the design and features in conversation, then ran, tested and edited the code in VS Code. I set up the email sending with a Gmail account and published the demo on GitHub Pages.

## How it works
- `index.html` is the customer page. It asks the booking logic for treatments and free times, then sends the booking.
- `demo-api.js` is the booking logic in the browser. It works out free time slots from the opening hours and treatment length, stops double bookings, and saves bookings in `localStorage`.
- `admin.html` is the owner's page. It lists bookings, marks deposits as paid and cancels bookings.
- `full-version/server.js` does the same job as `demo-api.js` on a real server (Express), saving bookings to a file and sending emails with `full-version/email.js`.

Built by [your name].
