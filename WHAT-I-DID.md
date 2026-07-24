# What I Built — Amar QR

## Complete Project Structure

```
amarqr/
├── app/
│   ├── layout.tsx              # Root layout + Inter font + Vercel Analytics
│   ├── page.tsx                # Home: Hero → QR Builder → Reviews
│   ├── about/page.tsx          # About page with your story
│   ├── api/reviews/route.ts    # GET + POST reviews (NeonDB)
│   ├── api/track/route.ts      # GET + POST usage counter (NeonDB)
│   └── globals.css             # Tailwind + Pixel scan animations
├── components/
│   ├── Navbar.tsx              # Sticky nav with logo + links
│   ├── Hero.tsx                # Hero section with tagline
│   ├── UsageCounter.tsx        # "X QR codes created so far"
│   ├── QRBuilder.tsx           # Main builder (controls + preview)
│   ├── QRControls.tsx          # All customization options
│   ├── ContentTypeSelector.tsx # URL/Text/Email/Phone/SMS/WiFi/vCard/Location
│   ├── ContentInput.tsx        # Dynamic form fields per content type
│   ├── ColorPicker.tsx         # FG + BG + Eye color
│   ├── EyeStyleSelector.tsx    # Square / Circle / Rounded
│   ├── LogoUploader.tsx        # Upload image → center of QR
│   ├── SizeSlider.tsx          # 128px – 512px
│   ├── ErrorCorrectionSelect.tsx # L / M / Q / H
│   ├── QRPreview.tsx           # Live QR canvas with scan animation
│   ├── ScanAnimation.tsx       # Pixel-style corners + glow line
│   ├── DownloadButtons.tsx     # PNG / SVG / JPG download
│   ├── DownloadPopup.tsx       # Post-download review form + Skip
│   ├── ReviewSection.tsx       # Review section container
│   ├── ReviewForm.tsx          # Submit review (name + message + rating)
│   ├── ReviewList.tsx          # Display reviews from NeonDB
│   └── Footer.tsx              # Footer with contact + links
├── lib/
│   ├── types.ts                # TypeScript types
│   ├── db.ts                   # NeonDB connection
│   └── qrUtils.ts              # QR generation + canvas rendering + download
├── public/
│   └── favicon.svg             # Amar QR brand icon
├── .env.local                  # Your NeonDB connection string
└── (config files)
```

## Features Implemented

- **8 content types**: URL, Text, Email, Phone, SMS, WiFi, vCard, Location
- **Full customization**: FG/BG/Eye colors, eye styles (square/circle/rounded), size, error correction
- **Logo upload**: Any image centered on QR
- **Pixel scanner animation**: Corner brackets + glowing scan line (CSS animation)
- **Download**: PNG, SVG, JPG
- **Post-download popup**: Review form or Skip
- **Review system**: NeonDB-powered, displays on homepage
- **Usage counter**: Live counter on hero section
- **Vercel Analytics**: Built-in
- **Dark theme**: Modern, mobile responsive
- **About page**: Your story + mission
