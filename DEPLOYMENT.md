# HalfScrew Deployment Guide

This guide will walk you through deploying the HalfScrew Audio Plugin for preview and production use.

## Quick Preview Options

### Option 1: GitHub Pages (Recommended for Preview)

GitHub Pages is the easiest way to get a live preview of your audio plugin.

**Setup Steps:**

1. **Enable GitHub Pages** in your repository settings:
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions"
   - The workflow file `.github/workflows/deploy-pages.yml` is already configured

2. **Trigger Deployment**:
   - Push changes to the `main` branch
   - Or manually trigger the workflow from the Actions tab

3. **Access Your Live Site**:
   - Once deployed, your site will be available at:
   - `https://myaiplug.github.io/HalfScrew2/`

### Option 2: Local Development Server

For quick local testing:

```bash
# Using Python (recommended)
python3 -m http.server 8080

# Using Node.js http-server
npx http-server -p 8080

# Using PHP
php -S localhost:8080
```

Then visit `http://localhost:8080` in your browser.

## Production Deployment Options

### Netlify

1. **Deploy via Git**:
   - Sign up at [netlify.com](https://www.netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Build settings:
     - Build command: (leave empty)
     - Publish directory: `.`
   - Click "Deploy site"

2. **Deploy via Drag & Drop**:
   - Drag your project folder to Netlify's deploy zone
   - Instant deployment!

**Custom Domain**: Configure in Netlify's domain settings

### Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd HalfScrew2
vercel
```

3. Follow the prompts to deploy

**Custom Domain**: Configure in Vercel dashboard

### AWS S3 + CloudFront

1. **Create S3 Bucket**:
```bash
aws s3 mb s3://halfscrew-audio-plugin
```

2. **Upload Files**:
```bash
aws s3 sync . s3://halfscrew-audio-plugin --exclude ".git/*"
```

3. **Enable Static Website Hosting**:
   - In S3 console, enable static website hosting
   - Set index document to `index.html`

4. **Set up CloudFront** (optional, for HTTPS):
   - Create CloudFront distribution
   - Point origin to S3 bucket
   - Configure SSL certificate

### Traditional Web Hosting

Upload all files via FTP/SFTP to your web host:
- `index.html`
- `style.css`
- `script.js`
- `lib/` directory

## CDN Considerations

The project uses CDN-hosted libraries:
- Tone.js: `https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js`
- Font Awesome: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`

**For Production**: Consider hosting these locally for better reliability:

1. Download the libraries
2. Place in a `vendor/` directory
3. Update script/link tags in `index.html`

## Environment-Specific Configuration

### Enable HTTPS

For production deployment, always use HTTPS:
- GitHub Pages: Automatically enabled
- Netlify/Vercel: Automatically enabled with free SSL
- Custom Server: Use Let's Encrypt (free)

### Performance Optimization

Before production deployment:

1. **Minify JavaScript**:
```bash
npx terser script.js -o script.min.js -c -m
```

2. **Minify CSS**:
```bash
npx cssnano style.css style.min.css
```

3. **Update HTML** to use minified versions

### CORS Headers

If hosting audio files on a different domain, ensure CORS headers are set:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

## Testing Before Deployment

1. **Test in Multiple Browsers**:
   - Chrome
   - Firefox
   - Safari
   - Edge

2. **Test Audio Processing**:
   - Upload different audio formats (MP3, WAV)
   - Test time shifting at various speeds
   - Test pitch bending
   - Test download functionality

3. **Test Responsive Design**:
   - Desktop
   - Tablet
   - Mobile

## Monitoring and Analytics

### Add Google Analytics (Optional)

Add to `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Troubleshooting

### Issue: Audio not playing
- Check browser console for errors
- Ensure HTTPS is enabled (Web Audio API requires secure context)
- Check that Tone.js loaded successfully

### Issue: CDN resources blocked
- Check if ad blockers are interfering
- Consider self-hosting dependencies

### Issue: Download not working
- Check browser console
- Verify file permissions
- Test with different audio files

## Rollback Plan

If deployment fails:
1. GitHub Pages: Revert commit and push
2. Netlify/Vercel: Use built-in rollback feature
3. Manual: Keep backup of previous version

## Next Steps

After successful deployment:
1. Share the preview URL with stakeholders
2. Gather feedback
3. Iterate on design and features
4. Monitor performance and user experience

---

For questions or issues, please open an issue on GitHub.
