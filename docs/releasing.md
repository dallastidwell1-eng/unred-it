# Releasing Unred It

How a build gets signed by Mozilla and installed. The owner holds the Mozilla
account and the API keys (D-007); they never go into this repository, a file,
or a chat.

## One-time setup (owner)

1. Go to https://addons.mozilla.org/developers/ and sign in with (or create) a
   Mozilla account. If AMO asks you to turn on two-step authentication, do so.
2. Read and accept the Firefox Add-on Distribution Agreement when AMO shows it.
3. Open **Tools > Manage API Keys** (https://addons.mozilla.org/developers/addon/api/key/)
   and generate credentials. You get two values:
   - **JWT issuer**: this is the API key.
   - **JWT secret**: this is the API secret. It is shown once.
4. Save both in your password manager. Do not paste them into a chat, an email,
   or any file in this project.

## Set your keys for one terminal session

In a PowerShell window opened in the project folder. Each command asks for the
value and does not echo the secret or save it to the command history:

```powershell
$env:WEB_EXT_API_KEY = Read-Host "AMO JWT issuer"
$env:WEB_EXT_API_SECRET = Read-Host -MaskInput "AMO JWT secret"
```

The keys last until you close that window.

## Sign a test build for the phone (unlisted)

1. Every signed build needs a new, higher version number than any build sent
   before (listed or unlisted). Claude bumps `version` in `package.json` before
   each signing.
2. In the same PowerShell window as your keys:

   ```powershell
   npm run sign:unlisted
   ```

   The script runs every check, builds the zip and the sources zip for
   reviewers, and sends them to AMO. It stops before sending anything if a
   check fails or a key is missing.

3. Mozilla signs it, usually within minutes; Mozilla says it can take up to
   24 hours, and you get an email when it is signed. The signed `.xpi` file
   is saved in `web-ext-artifacts/`.

## Install the signed build on Firefox for Android

From Mozilla's "Install self-distributed extensions" page:

1. Copy the `.xpi` file to the phone (for example, through a cloud drive or USB).
2. In Firefox, open **Settings > About Firefox**.
3. Tap the Firefox logo five times quickly. This turns on a hidden menu.
4. Go back to **Settings** and tap **Install Extension from File**.
5. Pick the `.xpi` file and tap **Add**.

On desktop Firefox: **about:addons > gear menu > Install Add-on From File**.

## Public listing (M8, not yet)

`npm run sign:listed` submits a public version. It needs the owner's approval
(D-009), the listing text (name, summary, description, license), and a
reviewed answer to OQ-010 and OQ-014 first.
