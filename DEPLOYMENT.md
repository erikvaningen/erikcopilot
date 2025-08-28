# Vercel Deployment Configuration

This document explains how to configure and use Vercel deployment hooks for the `erikcopilot` project.

## Overview

Vercel deployment hooks allow you to trigger deployments programmatically via HTTP requests. This is useful for:
- Triggering deployments from CI/CD pipelines
- Deploying from external systems
- Manual deployment triggers without accessing the Vercel dashboard
- Automated deployments based on external events

## Setup Instructions

### 1. Creating a Deployment Hook

To create a deployment hook for the main branch:

1. Navigate to your Vercel project dashboard
2. Go to **Settings** → **Git** → **Deploy Hooks**
3. Click **Create Hook**
4. Configure the hook:
   - **Hook Name**: `main-branch-deploy` (or your preferred name)
   - **Git Branch**: `main`
   - **Ref**: Leave blank (deploys latest commit on main branch)
5. Click **Create Hook**
6. Copy the generated webhook URL

### 2. Update Deployment Hook URL

Replace the placeholder URL below with your actual deployment hook URL:

```
Deployment Hook URL: https://api.vercel.com/v1/integrations/deploy/[YOUR_DEPLOYMENT_HOOK_ID]/[YOUR_HOOK_TOKEN]
```

**🔧 TODO**: Update this URL with your actual Vercel deployment hook URL once created.

## Usage Instructions

### Triggering a Deployment

#### Method 1: Using cURL
```bash
curl -X POST https://api.vercel.com/v1/integrations/deploy/[YOUR_DEPLOYMENT_HOOK_ID]/[YOUR_HOOK_TOKEN]
```

#### Method 2: Using HTTPie
```bash
http POST https://api.vercel.com/v1/integrations/deploy/[YOUR_DEPLOYMENT_HOOK_ID]/[YOUR_HOOK_TOKEN]
```

#### Method 3: Using wget
```bash
wget --post-data="" https://api.vercel.com/v1/integrations/deploy/[YOUR_DEPLOYMENT_HOOK_ID]/[YOUR_HOOK_TOKEN]
```

### Response

A successful deployment trigger will return:
```json
{
  "job": {
    "id": "deployment_id",
    "state": "PENDING",
    "createdAt": 1234567890
  }
}
```

### Checking Deployment Status

You can monitor the deployment progress:
1. Check your Vercel dashboard at [vercel.com](https://vercel.com)
2. Look for the new deployment in your project's deployments list
3. Monitor build logs and deployment status

## Integration Examples

### GitHub Actions Integration

Add this to your GitHub Actions workflow to trigger deployment:

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel Deployment
        run: |
          curl -X POST ${{ secrets.VERCEL_DEPLOY_HOOK_URL }}
```

### Environment Variables

For security, store the deployment hook URL as an environment variable:

```bash
export VERCEL_DEPLOY_HOOK_URL="https://api.vercel.com/v1/integrations/deploy/[YOUR_DEPLOYMENT_HOOK_ID]/[YOUR_HOOK_TOKEN]"
curl -X POST $VERCEL_DEPLOY_HOOK_URL
```

## Security Considerations

- ⚠️ **Keep your deployment hook URL secret** - anyone with access can trigger deployments
- Store the URL in environment variables or secure secret management systems
- Consider using Vercel's built-in Git integration for automatic deployments instead of hooks for routine use
- Regularly rotate deployment hooks if they may have been compromised

## Troubleshooting

### Common Issues

1. **404 Not Found**: Verify the deployment hook URL is correct
2. **Invalid Hook**: Ensure the hook hasn't been deleted or disabled
3. **Rate Limiting**: Vercel may rate limit deployment requests
4. **Build Failures**: Check Vercel deployment logs for build errors

### Getting Help

- Check [Vercel Documentation](https://vercel.com/docs/concepts/git/deploy-hooks)
- View deployment logs in the Vercel dashboard
- Contact the project maintainer if issues persist

## Additional Resources

- [Vercel Deploy Hooks Documentation](https://vercel.com/docs/concepts/git/deploy-hooks)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Project Repository](https://github.com/erikvaningen/erikcopilot)

---

**Last Updated**: January 2025  
**Maintainer**: Erik van Ingen