# Deployment

This repository now includes a GitHub Actions workflow that deploys the site automatically whenever code is pushed to `main`.

## What It Does

The workflow in `.github/workflows/deploy.yml`:

- checks out the repository
- connects to the server over SSH using a private key stored in GitHub Secrets
- syncs the repository contents into the live directory with `rsync`
- excludes `.git`, `.github`, and `internal-docs`
- removes files from the server that were removed from the repo

This is safer than the current manual `ssh` + `git pull` flow because the live server no longer depends on an interactive password login or on the server copy of the repo being in a clean state.

## Required GitHub Secrets

Create these repository secrets in GitHub under Settings > Secrets and variables > Actions:

- `SSH_HOST`: server hostname or IP address
- `SSH_PORT`: SSH port, usually `22`
- `SSH_USER`: deployment user
- `DEPLOY_PATH`: live site directory, for example `/var/www/profile`
- `SSH_PRIVATE_KEY`: private key used by GitHub Actions to connect to the server
- `SSH_KNOWN_HOSTS`: output of `ssh-keyscan -H <host>` for the server

For your current server, the values would likely be:

- `SSH_HOST`: `psyduck.lajota.com.py` or `216.219.95.206`
- `SSH_PORT`: `22`
- `DEPLOY_PATH`: `/var/www/profile`
- `SSH_USER`: use `root` only if you must; a dedicated deploy user is better

## Recommended Server Setup

Use a dedicated deploy user if possible. If you want the smallest change from your current setup, you can keep using the existing server and target path, but move from password login to SSH key login.

Example on the server:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy"
cat ~/.ssh/id_ed25519.pub
```

Add the generated public key to the deploy user's `~/.ssh/authorized_keys`.

If you stay with `root`, that means:

```bash
mkdir -p /root/.ssh
chmod 700 /root/.ssh
printf '%s\n' '<public-key-here>' >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
```

To populate `SSH_KNOWN_HOSTS` from your machine:

```bash
ssh-keyscan -H psyduck.lajota.com.py
```

To copy the private key content for `SSH_PRIVATE_KEY`:

```bash
cat ~/.ssh/id_ed25519
```

## First Rollout

1. Add the GitHub secrets.
2. Commit and push this workflow.
3. Run the workflow manually with `workflow_dispatch` or push a small change to `main`.
4. Confirm that `/var/www/profile/index.html` is updated on the server.
5. After that, stop using the manual `git pull` deployment flow.

## Notes

- This workflow deploys the tracked repository contents directly to the live folder.
- The server copy does not need to stay as a git checkout anymore.
- If you later want zero-downtime or rollback support, the next step is an atomic release-based deploy using timestamped release folders and a `current` symlink.