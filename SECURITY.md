# Security Policy

## Reporting a Vulnerability

Security is important to us. If you have discovered a security vulnerability in
upbeat, we appreciate your help in disclosing it to us in a responsible manner.

### How to Report

Please **do not** open a public GitHub issue for security vulnerabilities.
Instead, use GitHub's
[Report a vulnerability](https://github.com/Jubstaaa/upbeat/security/advisories/new)
form, or email ilkerbalcilartr@gmail.com. Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### What to Expect

- Acknowledgment of your report within 48 hours
- Regular updates about the progress
- Credit for the discovery (if desired)
- A reasonable timeline for a fix and release

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x     | ✅        |

We recommend always running the latest version of upbeat.

## Your UptimeRobot key

upbeat never sends your UptimeRobot key to the browser. Even a read-only key can
list every monitor in the account and its alert contacts, email addresses
included, so the key is only ever used on the server, and the browser receives
only the numbers the page shows. If you find a way to make upbeat expose the
key, an alert contact, or anything UptimeRobot returns that the page does not
show, please report it privately.

## Security Best Practices

- Use a **read-only** API key, never the main key. The main key can delete
  monitors.
- Set the key as a secret (`wrangler secret put`, a Vercel environment
  variable, or `docker run -e`), never in a committed file.
- Every monitor the key can read is shown on the page. Keep private monitors in
  a separate UptimeRobot account.

## Questions?

If you have questions about security, please reach out at
ilkerbalcilartr@gmail.com or open a
[GitHub Discussion](https://github.com/Jubstaaa/upbeat/discussions).
