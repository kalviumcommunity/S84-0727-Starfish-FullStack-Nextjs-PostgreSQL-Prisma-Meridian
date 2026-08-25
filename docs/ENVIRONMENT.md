# Environment Variables Reference

## Purpose

Environment variables allow configuration to be provided without hardcoding environment-specific values into application source code.

## Local Environment

Local environment variables should be configured using the environment file expected by the project.

## Security

Never commit secrets or credentials to the repository.

Sensitive values may include:

- Database credentials
- Authentication secrets
- API keys
- Private tokens

## Production

Production environment variables should be configured through the deployment platform.

## Troubleshooting

If the application cannot access a required service, verify:

1. The variable exists.
2. The variable name is correct.
3. The value is correct.
4. The application has been restarted after configuration changes.