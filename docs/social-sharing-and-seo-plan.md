# Social Sharing, SEO, and MCEN Accessibility Plan

This document outlines the steps to enable rich social media previews (pop-up cards), improve Search Engine Optimization (SEO), and ensure accessibility behind strict corporate/government proxies like the Marine Corps Enterprise Network (MCEN).

## 1. Social Sharing Cards (Open Graph & Twitter)

To make your website appear as a "card" with an image, title, and description when shared via iMessage (iOS), Android Messages, WhatsApp, Facebook, etc., you must implement **Open Graph (OG)** protocol tags.

### A. Required Meta Tags
Add the following tags to the `<head>` section of your `index.html`.

```html
<!-- Primary Meta Tags -->
<title>Mary & Corbin's Wedding</title>
<meta name="title" content="Mary & Corbin's Wedding - May 23, 2026">
<meta name="description" content="Join us for the wedding of Mary Christensen and Corbin Breton at The Club Continental in Orange Park, FL.">

<!-- Open Graph / Facebook / iMessage -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://[YOUR-DOMAIN].com/">
<meta property="og:title" content="Mary & Corbin's Wedding">
<meta property="og:description" content="May 23, 2026 • The Club Continental, Orange Park, FL. RSVP and details inside.">
<meta property="og:image" content="https://[YOUR-DOMAIN].com/og-image.jpg">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://[YOUR-DOMAIN].com/">
<meta property="twitter:title" content="Mary & Corbin's Wedding">
<meta property="twitter:description" content="May 23, 2026 • The Club Continental, Orange Park, FL.">
<meta property="twitter:image" content="https://[YOUR-DOMAIN].com/og-image.jpg">
```

### B. Image Requirements
1.  **Selection**: Choose a high-quality photo (landscape orientation is best, 1200x630 pixels).
2.  **Placement**: Save this image as `og-image.jpg` in your `public/` directory.
3.  **Absolute URL**: Open Graph heavily prefers or requires **absolute URLs** (e.g., `https://yourdomain.com/og-image.jpg`) rather than relative paths (`/og-image.jpg`). You will need to know your final deployment domain until deployment, you can use a placeholder or test with localhost tunneling (e.g., ngrok).

## 2. SEO & Important Features

### A. Sitemap (`sitemap.xml`)
Create a file named `sitemap.xml` in your `public/` directory to help search engines find your pages.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>https://thebretonwedding.com/</loc>
      <lastmod>2026-02-14</lastmod>
      <changefreq>monthly</changefreq>
      <priority>1.0</priority>
   </url>
</urlset>
```

### B. Robots (`robots.txt`)
Create a file named `robots.txt` in your `public/` directory.

```txt
User-agent: *
Allow: /
Sitemap: https://thebretonwedding.com/sitemap.xml
```

### C. Structured Data (JSON-LD)
Add this script to the `<head>` of `index.html`. This tells Google your site is specifically about an **Event**, which can help it appear in rich results (e.g., with date and location snippet).

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Mary & Corbin's Wedding",
  "startDate": "2026-05-23T11:00",
  "endDate": "2026-05-23T15:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "The Club Continental",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "2143 Astor St",
      "addressLocality": "Orange Park",
      "postalCode": "32073",
      "addressRegion": "FL",
      "addressCountry": "US"
    }
  },
  "image": [
    "https://thebretonwedding.com/og-image.jpg"
  ],
  "description": "The wedding ceremony and reception of Mary Christensen and Corbin Breton."
}
</script>
```

## 3. MCEN (Marine Corps Enterprise Network) Accessibility

The MCEN firewall is strict. To maximize the chance of your site being accessible:

1.  **HTTPS is Mandatory**: The site **MUST** be served over HTTPS with a valid SSL certificate. Most modern hosts (Vercel, Netlify, GitHub Pages) handle this automatically.
2.  **Avoid "New" or "Uncategorized" Status**:
    *   New domains are often blocked by default.
    *   **Action**: Once deployed, submit your URL to categorization services.
        *   **Palo Alto Networks**: [Test A Site](https://urlfiltering.paloaltonetworks.com/) (Submit as "Society and Culture" or "Personal Sites").
        *   **McAfee/Trellix**: [Customer URL Ticketing System](https://sitelookup.mcafee.com/).
3.  **TLD Selection**: Avoid cheap TLDs like `.xyz`, `.top`, or `.info` as they are often flagged for spam. Prefer `.com`, `.net`, or `.us`.
4.  **Static Content is Safer**: Since your site is a static Vue app, it is less likely to be blocked for "active content" or "command and control" signatures compared to dynamic PHP/WordPress sites with plugins.
5.  **No Mixed Content**: Ensure absolutely no resources (images, scripts) are loaded over `http://`. Everything must be `https://`.

## Summary Checklist

- [ ] Create `og-image.jpg` (1200x630px) and place in `public/`.
- [ ] Add `<meta>` tags and JSON-LD script to `index.html`.
- [ ] Create `public/sitemap.xml`.
- [ ] Create `public/robots.txt`.
- [ ] Deploy the site.
- [ ] Verify using [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) and [Twitter Card Validator](https://cards-dev.twitter.com/validator).
- [ ] Submit domain for categorization if blocked on MCEN.
