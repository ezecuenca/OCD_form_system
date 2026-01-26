# Setup Instructions for After Duty Report System

## Prerequisites
- PHP 7.3+ or 8.0+
- Composer (PHP package manager)
- Node.js and npm
- MySQL or other database (if needed)

## Step-by-Step Setup

### 1. Install PHP Dependencies
```bash
composer install
```

### 2. Install Node.js Dependencies
```bash
npm install
```

### 3. Install SCSS Compiler (if not already installed)
```bash
npm install --save-dev sass sass-loader@^10
```

### 4. Set Up Environment File
```bash
# Copy .env.example to .env (if not already done)
copy .env.example .env

# Generate application key
php artisan key:generate
```

### 5. Compile Assets
```bash
# For development (one-time compilation)
npm run dev

# OR for development with watch mode (auto-recompiles on changes)
npm run watch
```

### 6. Start Laravel Development Server
```bash
php artisan serve
```

The server will start at: `http://localhost:8000` or `http://127.0.0.1:8000`

### 7. Open in Browser
Navigate to: **http://localhost:8000** or **http://127.0.0.1:8000**

You should see the Dashboard page!

## Quick Commands Reference

```bash
# Install dependencies
composer install
npm install
npm install --save-dev sass sass-loader@^10

# Compile assets (development)
npm run dev

# Watch for changes (development)
npm run watch

# Start server
php artisan serve

# Production build (when ready to deploy)
npm run production
```

## Troubleshooting

### If SCSS compilation fails:
- Make sure `sass` and `sass-loader` are installed: `npm install --save-dev sass sass-loader@^10`

### If assets don't load:
- Make sure you've run `npm run dev` to compile the assets
- Check that `public/css/app.css` and `public/js/app.js` exist

### If you see a blank page:
- Check browser console for JavaScript errors
- Make sure the router is initialized properly
- Verify that `#app-content` element exists in the layout
