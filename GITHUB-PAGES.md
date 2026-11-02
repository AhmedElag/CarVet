# Publish CarVet on GitHub Pages

Use this guide for the extracted **source folder**, not the ZIP itself. The repository root should contain `package.json`, `package-lock.json`, `index.html`, `app/`, `components/`, and `.github/`.

## 1. Test the source locally

1. Install Node.js 22.13 or newer and Git if they are not already installed.
2. Extract the ZIP.
3. In VS Code, choose **File → Open Folder** and open the inner `CarVet-GitHub-Demo` folder containing `package.json`.
4. Choose **Terminal → New Terminal** and run:

```powershell
npm install
npm run dev
```

Open the address printed by Vite. Try the Packages link, the client/test-drive journey, and the separate phone app demo linked by the large button in the website footer. Its route is `#/phone-demo` within the site. Stop the server with `Ctrl+C` when finished.

Before publishing, run the included checks and build:

```powershell
npm test
npm run build
```

The build includes TypeScript validation. The provided workflow repeats these checks when you push.

On a Windows machine where PowerShell blocks `npm.ps1`, replace `npm` with `npm.cmd` in the commands. No PowerShell policy change is needed.

## 2. Create an empty GitHub repository

On GitHub, create a new repository with any name you want, for example `carvet-demo`.

For the simplest free GitHub Pages setup, choose **Public**. Leave **Add a README file**, **Add .gitignore**, and **Choose a license** unselected because this source already contains the setup files. Create the repository, then copy its HTTPS repository URL from **Code → HTTPS** or the empty repository's setup screen.

GitHub Pages is available for public repositories on GitHub Free. Pages from private repositories require a supported paid plan. The published demo is intended to be a website clients can open without ChatGPT access.

## 3. Push the source from VS Code

In the same terminal, inside the extracted source folder, run these commands one line at a time:

```powershell
git init
git add .
git commit -m "Add CarVet interactive demo"
git branch -M main
```

Then replace `PASTE-YOUR-REPOSITORY-URL-HERE` with the HTTPS URL you copied. Keep the quotation marks:

```powershell
git remote add origin "PASTE-YOUR-REPOSITORY-URL-HERE"
git push -u origin main
```

Complete GitHub sign-in if Git or VS Code asks for it. Use GitHub's browser sign-in flow; do not put a password or token into the source files.

If Git says your name or email is missing, set them for this repository, then repeat the commit and push:

```powershell
git config user.name "Ahmed Elag"
git config user.email "YOUR-GITHUB-EMAIL"
git commit -m "Add CarVet interactive demo"
git push -u origin main
```

This sequence assumes a **new empty repository**. If the remote already contains files or Git reports a rejected push, stop and inspect that repository before continuing. Do not use a force push to replace existing work.

The `.gitignore` keeps `node_modules/`, local environment files, and build output out of the source commit. Commit the supplied `package-lock.json` so the automatic build uses the tested dependencies. The `.github/workflows/deploy-pages.yml` file must also be included.

## 4. Enable GitHub Pages

In your repository on GitHub:

1. Open **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.
3. Open the repository's **Actions** tab.
4. Select **Deploy CarVet to GitHub Pages**. If the first run failed because Pages was not enabled yet, use **Re-run all jobs**. You can also choose **Run workflow → main → Run workflow**.
5. Wait for the workflow to finish successfully. The deployment job and **Settings → Pages** show the live website URL. Copy that exact URL to share the demo.

Use **GitHub Actions** as the source. You do not need to select a branch folder, create a `gh-pages` branch, upload `dist/` manually, or set a custom domain.

## 5. Open it on an iPhone or tablet

Open the published website URL in the phone or tablet browser. The menu, sample requests, comparison dialog, recorded playback, support preview, and workspace operate in the browser. A local VS Code address such as `localhost` is only for your computer; share the published GitHub Pages URL with clients.

For the separate phone experience, use the large phone-demo button in the website footer. It opens `#/phone-demo` within your published site. **My search** summarizes the search; **Discover** lets you browse six sample cars; **My cars** keeps saved cars, progress statuses, and notes; **Scanner** walks through a recorded OBD sample that can be attached to a saved car. You can mark a car Looking at, Viewing next, Checked, or Passed on. Checked is a demo workflow label, not a vehicle-condition assessment.

To share a specific screen, open it and copy the full address, including the `#/...` part. Keep that part when sharing. Refreshing a hash route returns to the same page.

Saved data belongs to that browser. The phone app garage and the website's client/advisor workspace are separate local stores with their own restore/reset controls; they do not synchronize with one another. Opening the demo on another phone starts with its own examples. The demo does not connect to an OBD scanner, ship a device, provide a real advisor, or book a buying-day service.

If your phone browser offers **Add to Home Screen**, you can add the hosted website as a shortcut. The supplied manifest starts at the phone demo. It still needs internet access and remains a browser app demo; no native or App Store app is installed.

## 6. Publish later changes

After making edits in VS Code:

```powershell
npm test
npm run build
git add .
git commit -m "Update CarVet demo"
git push
```

The same workflow tests, rebuilds, and publishes the site. Use the **Actions** tab to check the result. If nothing changed, Git may correctly say there is nothing to commit.

## Common fixes

| What you see | What to check |
| --- | --- |
| Repository contains only a ZIP | Extract it and push the files inside the source folder. |
| Build cannot find `package.json` | The inner source folder must be the repository root, not an extra nested folder. |
| `npm ci` says the lockfile is missing | Commit the supplied `package-lock.json`. If you changed dependencies, run `npm install` locally and commit the updated lockfile. |
| Pages setup or deployment says not found | Set **Settings → Pages → Source → GitHub Actions**, then rerun the workflow. |
| No workflow appears | Confirm `.github/workflows/deploy-pages.yml` is present on `main`, and Actions is enabled for the repository. |
| Old version after a successful deployment | Refresh the page or reopen the published address after the deployment finishes. |
| Source is visible but the website is not published | The repository URL and the Pages URL are different. Copy the website URL from **Settings → Pages**. |

## Reference

The included workflow follows GitHub's static build-and-deploy flow. GitHub documents the Pages setting and workflow actions here:

- [Configuring a publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
