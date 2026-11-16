<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>{{ request()->is('admin') ? 'Store administration' : ($seoProduct->name ?? 'Botanical oils') }} | Herbal Oil</title>
<link rel="icon" href="/images/botanical/leaf.svg">
<link rel="stylesheet" href="/assets/bootstrap.min.css">
<link rel="stylesheet" href="/assets/herbal.css">
<script defer src="/assets/bootstrap.bundle.min.js"></script>
<script type="module" src="/assets/herbal.js"></script>
</head>
<body data-page="{{ request()->is('admin') ? 'admin' : (request()->is('track') ? 'track' : 'shop') }}" data-product="{{ $seoProduct->id ?? '' }}">
<nav class="navbar navbar-dark bg-forest sticky-top">
  <div class="container gap-2">
    <a class="navbar-brand d-flex gap-2 align-items-center" href="/"><img width="32" height="32" src="/images/botanical/leaf.svg" alt=""> Herbal Oil</a>
    <div class="d-flex gap-2 flex-wrap">
      <a class="btn btn-outline-light btn-sm" href="/track">Track order</a>
      @unless(request()->is('admin') || request()->is('track'))
        <button class="btn btn-light btn-sm" data-bs-toggle="offcanvas" data-bs-target="#bag">Bag <span id="bag-count" class="badge text-bg-success">0</span></button>
      @endunless
    </div>
  </div>
</nav>
@if(!request()->is('admin') && !request()->is('track'))
<header class="shop-hero text-white">
  <div class="container py-5">
    <p class="text-uppercase fw-semibold small">Hair · Skin · Body</p>
    <h1 class="display-3 col-md-7">Botanical oils for everyday care</h1>
    <a class="btn btn-light mt-3" href="#catalog">Shop the collection</a>
  </div>
</header>
@endif
<main id="app" class="container py-4 py-lg-5" aria-busy="true">
  <p role="status"><span class="spinner-border spinner-border-sm me-2"></span>Loading Herbal Oil…</p>
</main>
<footer class="border-top py-4"><div class="container text-secondary small">© {{ date('Y') }} Herbal Oil</div></footer>
<div class="offcanvas offcanvas-end" tabindex="-1" id="bag" aria-labelledby="bag-title">
  <div class="offcanvas-header border-bottom"><h2 class="h5 offcanvas-title" id="bag-title">Shopping bag</h2><button class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div>
  <div class="offcanvas-body" id="bag-body"></div>
</div>
<div class="modal fade" id="dialog" tabindex="-1" aria-labelledby="dialog-title">
  <div class="modal-dialog modal-dialog-scrollable modal-lg"><div class="modal-content">
    <div class="modal-header"><h2 class="h5 modal-title" id="dialog-title"></h2><button class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body" id="dialog-body"></div>
  </div></div>
</div>
</body>
</html>
