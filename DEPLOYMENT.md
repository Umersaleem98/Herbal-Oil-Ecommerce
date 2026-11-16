# Herbal Oil deployment

Configure PHP 8.2 or newer, Composer, and MySQL or MariaDB. Set the web document root to Laravel's public directory and use the production database credentials in the server's .env file.

Deploy the application together with the checked-in Bootstrap and JavaScript files under public/assets. Then run these commands on the server.

```sh
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan view:cache
```

Set APP_ENV=production, APP_DEBUG=false, and APP_URL to your HTTPS address. Generate an application key for a fresh installation. Preserve the key for existing installations. For initial catalog and admin setup only, configure ADMIN_EMAIL and ADMIN_PASSWORD before running php artisan db:seed --force. Confirm delivery charges, return information, payment settings, product details and stock in the dashboard before launch.

See the [README](README.md) for local setup and catalog images.
