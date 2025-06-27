# 🚀 Modern Tetris - Deployment Guide

## GitHub Pages Deployment

### Prerequisites

1. **GitHub Account**: Ensure you have a GitHub account
2. **Repository**: The project should be in a GitHub repository
3. **Public Repository**: GitHub Pages requires a public repository (or GitHub Pro for private repos)

### Automatic Deployment (Recommended)

#### 1. Repository Setup

1. Go to your GitHub repository
2. Navigate to **Settings** > **Pages**
3. Under **Source**, select **GitHub Actions**
4. Save the settings

#### 2. Push to Deploy

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Update game features"
   ```

2. Push to main branch:
   ```bash
   git push origin main
   ```

3. **GitHub Actions will automatically**:
   - Build the project
   - Run tests
   - Deploy to GitHub Pages

#### 3. Access Your Site

Your game will be available at:
```
https://mytakoyaki.github.io/modern-tetris/
```

### Manual Deployment

#### 1. Build Locally

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Or use the deployment script
npm run deploy:script
```

#### 2. Deploy Files

The built files will be in the `out/` directory. You can:

1. **Upload to GitHub Pages manually**:
   - Go to repository Settings > Pages
   - Select "Deploy from a branch"
   - Choose the branch and `/out` folder

2. **Use GitHub CLI**:
   ```bash
   gh pages deploy out/
   ```

### Troubleshooting

#### Common Issues

1. **Build Fails**:
   - Check for TypeScript errors: `npm run lint`
   - Run tests: `npm test`
   - Check GitHub Actions logs

2. **Site Not Loading**:
   - Verify GitHub Pages is enabled
   - Check the correct URL format
   - Wait a few minutes for deployment to complete

3. **Assets Not Loading**:
   - Ensure `next.config.ts` has `output: 'export'`
   - Check that `trailingSlash: true` is set

#### GitHub Actions Workflow

The workflow file `.github/workflows/deploy.yml` handles:

- Node.js 20 setup
- Dependency installation
- Test execution
- Build process
- GitHub Pages deployment

### Environment Variables

For local development, create a `.env.local` file:

```env
NEXT_PUBLIC_GAME_VERSION=1.0.0
NEXT_PUBLIC_DEBUG_MODE=false
```

### Performance Optimization

The build process includes:

- **Static Export**: All pages are pre-rendered
- **Image Optimization**: Disabled for static export
- **Code Splitting**: Automatic optimization
- **Tree Shaking**: Unused code removal

### Monitoring

- **GitHub Actions**: Check deployment status
- **GitHub Pages**: Monitor site availability
- **Browser DevTools**: Check for console errors

### Rollback

To rollback to a previous version:

1. Revert to a previous commit:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. Or manually deploy a specific version:
   ```bash
   git checkout <commit-hash>
   npm run build
   # Deploy the out/ directory
   ```

## Support

For deployment issues:

1. Check GitHub Actions logs
2. Review the build output
3. Verify repository settings
4. Check GitHub Pages documentation 