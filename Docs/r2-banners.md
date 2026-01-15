# R2 banners (mobile)

This app loads dashboard banner images from Cloudflare R2 using the Public Development URL.

## Configure

Set `R2_PUBLIC_BASE_URL` in:

- `.env.development`
- `.env.staging`
- `.env.production`

Current expected object keys:

- `banners/banner-1.png`
- `banners/banner-2.png`
- `banners/banner-3.png`

The carousel builds image URLs like:

`$R2_PUBLIC_BASE_URL/banners/banner-1.png`
