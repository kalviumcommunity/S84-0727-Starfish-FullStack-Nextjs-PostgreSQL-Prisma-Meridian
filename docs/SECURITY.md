# Security Guide

## Environment Variables

Sensitive configuration should be stored using environment variables.

Do not commit:

- Database passwords
- API keys
- Authentication secrets
- Private tokens
- Production credentials

## Git Safety

Before committing changes, verify that sensitive files are excluded from version control.

Check the Git status before pushing:

```bash
git status