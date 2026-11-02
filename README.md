# CarVet — interactive GitHub Pages demo

A standalone React + TypeScript demo of CarVet: the original packages, buyer stories, sample requests and reports, client/advisor workspace, and the planned keep-forever scanner journey. It also includes a separate iPhone-first app demo with a saved-car garage. Both experiences work in phones, tablets, and desktop browsers.

This version runs on a static host, including GitHub Pages. It does not need the ChatGPT preview, a server, API keys, or a database.

## Run it in VS Code

Install Node.js 22.13 or newer and Git. Extract the ZIP, then open the **inner `CarVet-GitHub-Demo` folder** in VS Code. This is the folder containing `package.json` and `index.html`.

Open **Terminal → New Terminal**, then run:

```powershell
npm install
npm run dev
```

Open the local address printed in the terminal. Keep the terminal running while you use the demo. Press `Ctrl+C` to stop it.

If PowerShell blocks `npm.ps1`, use `npm.cmd install` and `npm.cmd run dev` instead.

## Publish your demo

Follow [GITHUB-PAGES.md](GITHUB-PAGES.md). The included GitHub Actions workflow builds the site and publishes it after a push to `main`.

There is no repository name or account name to change in the code. Relative assets and hash routes keep the demo working inside a GitHub project URL. A route such as `#/test-drive` stays inside your published site; refreshing it does not require a server rewrite.

## What you can try

- Open the separate phone app demo from the large footer button, or at `#/phone-demo` within your site. Its four tabs are **My search**, **Discover**, **My cars**, and **Scanner**.
- Browse six illustrative cars in Discover; save cars, add notes, and move them between Looking at, Viewing next, Checked, and Passed on. Attach a recorded sample scanner session to a saved car and download your sample garage.
- Browse all eight original packages and open their detail pages.
- Follow a sample buyer story or enter a sample buyer brief.
- Filter the supplied sample vehicles, compare candidates, read an illustrative review, and save a decision plan.
- Switch between Client and Advisor previews, edit sample statuses, notes, and checklists, and download sample plans.
- Explore the scanner kit, parked setup, recorded test-drive playback, sample diagnostic information, scripted support, and buying-day checklist.
- Open the articles, sample report, contact draft, privacy information, and scope pages.

The phone app garage is stored separately from the website's client/advisor workspace. Each saves its own sample changes in the browser on the device being used. They are not shared across devices, synchronized with each other, or sent to an advisor. Each experience has its own restore/reset control. In the phone app, Checked is a demo workflow status, not a verdict about a car's condition.

The Home Screen manifest opens the phone demo. You can add the hosted website to your phone's Home Screen if your browser offers that option. Internet access is still needed: this is a browser app demo, not a native or App Store app, and it does not provide offline scanner recording.

## What this demo represents

Selected packages describe a compatible OBD scanner sent to the client and kept permanently. Higher packages show planned online support, and the highest package shows planned buying-day support. The scanner app, actual pairing, real vehicle logging, shipping, human advisors, accounts, payments, and service bookings are future work. The support conversation and diagnostic readings here are labelled sample interactions.

GitHub Pages cannot run the production matching API. This portable demo uses public sample inventory and transparent sample filtering/ordering. The trained recommendation models remain outside the browser build. `backend-reference/`, when included, preserves the server-side matching source for a future server deployment; GitHub Pages does not execute it.

## Build or preview the release

```powershell
npm test
npm run build
npm run preview
```

`npm test` runs the included demo checks. `npm run build` runs TypeScript validation and writes the static website to `dist/`. The GitHub workflow runs the tests and publishes that folder after a successful build. Use the preview command or a static web server to view the built site; double-clicking `index.html` is not the supported way to run the React demo.

## Where to edit

| Folder | Purpose |
| --- | --- |
| `app/` | Page content and shared styles |
| `components/` | Interactive demos, package explorer, header, and footer |
| `data/` | Packages, articles, and client stories |
| `demo/` | Static routing, compatibility adapters, and sample matching |
| `public/` | CarVet logo, images, and icons |
| `.github/workflows/` | Automatic GitHub Pages publishing |

After editing, run `npm test` and `npm run build`, then commit and push your changes. GitHub Actions publishes the new version.
