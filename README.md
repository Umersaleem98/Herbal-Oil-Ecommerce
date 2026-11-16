# Herbal Oil Ecommerce

A Laravel and Bootstrap 5 storefront for botanical hair, face, and body oils, with a staff dashboard for products, inventory, orders, and store settings.

![Amber botanical oil bottles with rosemary and olive branches on limestone](public/images/botanical/hero.png)

## Starter catalog

| Image | Product | Description |
| --- | --- | --- |
| ![Rosemary oil and rosemary sprigs](public/images/botanical/rosemary.webp) | Rosemary Hair Oil | Rosemary blend for pre-wash hair oiling. |
| ![Amla oil with green amla fruit](public/images/botanical/amla.webp) | Amla Hair Oil | Amla blend for a regular hair oiling routine. |
| ![Coconut oil with sliced coconut](public/images/botanical/coconut.webp) | Coconut Body Oil | Coconut oil for body care and massage. |
| ![Jojoba oil with jojoba seeds](public/images/botanical/jojoba.webp) | Jojoba Face Oil | Light-feeling oil for facial care. |
| ![Sweet almond oil with almonds](public/images/botanical/almond.webp) | Sweet Almond Body Oil | Sweet almond oil for body care and massage. |
| ![Neem oil with neem leaves](public/images/botanical/neem.webp) | Neem Botanical Oil | Neem blend for topical care. |

Catalog images are generated mockups. Replace them with actual packaging photography before launch and verify product descriptions, label claims, prices, and stock.

## Local setup

Install PHP 8.2 or newer, Composer, and MySQL or MariaDB. Run these commands from the repository directory.

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
```

Create the database in MySQL or MariaDB.

```sql
CREATE DATABASE IF NOT EXISTS herbal_oil
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Set your database connection, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env`. Use a unique administrator password of at least 12 characters. Keep `.env` local.

```powershell
php artisan migrate --seed
php artisan serve
```

- Storefront at [localhost:8000](http://localhost:8000/)
- Staff sign-in at [localhost:8000/admin](http://localhost:8000/admin)
- Order tracking at [localhost:8000/track](http://localhost:8000/track)

Start XAMPP MySQL if using XAMPP for the database. If serving with Apache, point its document root at the Laravel `public` directory. The six starter products have zero stock until you enter quantities in the dashboard.

## Development and checks

Create a separate local database named `herbal_oil_test` before running the Laravel suite. Some inherited tests still expect saree-specific behavior, reference prefixes, or branding.

```powershell
$env:DB_DATABASE = 'herbal_oil_test'
php artisan migrate --seed
php artisan test
Remove-Item Env:DB_DATABASE
```
