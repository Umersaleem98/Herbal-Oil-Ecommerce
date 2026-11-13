<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ request()->is('admin') ? 'Herbal Oil — Store Administration' : (isset($seoProduct) ? ($seoProduct->seo_title ?: $seoProduct->name.' | Herbal Oil') : 'Shop Botanical Oils in Pakistan | Herbal Oil') }}</title>
    <meta name="description" content="{{ isset($seoProduct) ? ($seoProduct->seo_description ?: $seoProduct->description) : 'Shop botanical oils for hair, skin and body, with delivery across Pakistan.' }}">
    <meta property="og:title" content="Herbal Oil — Botanical oils for everyday care">
    <meta property="og:description" content="Explore botanical oils for your hair, skin and body routines.">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="en_PK">
    <meta property="og:image" content="{{ url('/images/botanical/hero.png') }}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" type="image/svg+xml" href="/images/botanical/leaf.svg">
    <link rel="canonical" href="{{ url()->current() }}">
    @if(request()->is('admin'))<meta name="robots" content="noindex,nofollow">@endif
    @viteReactRefresh
    @vite('resources/js/app.jsx')
</head>
<body><script id="business-settings" type="application/json">@json(\App\Support\BusinessSettings::get())</script><div id="app" class="{{ request()->is('admin') ? 'admin-app' : 'rang-mahal-store' }}"></div></body>
</html>
