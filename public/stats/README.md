# Reverse proxy for Plausible Analytics
Written in PHP for Shared-Hosting on Apache.

## Installation

1. Manually download the latest release from [here](https://github.com/Neoflow/ReverseProxy-PlausibleAnalytics/releases/).

### Running in the root of a domain or subdomain

2. Move `.htaccess`, `index.php` and `options.php` into the root of your domain or subdomain (e.g. `stats.example.com`).
3. **Optional** Customize the `options.php`.
4. Add the script like in the following example and customize the attributes.
```html
<script defer data-domain="example.com" src="//stats.example.com/js/script.js"></script>
```

### Running in a subfolder of a domain

2. Move `.htaccess`, `index.php` and `options.php` into the subfolder of your website (e.g. `example.com/stats`).
3. **Optional** Customize the `options.php`.
4. Add the script like in the following example and customize the attributes.
```html
<script defer data-domain="example.com" data-api="/stats/api/event" src="/stats/js/script.js"></script>
```

## Options

```php
// Set the relative URI when the reverse proxy is running in a folder.
// If your proxy runs under https://example.com/stats, then set /stats as relative URI and otherwise just leave it blank.
$relativeUri = '/stats';

// Set all allowed URI which should be accessible trough the proxy
$whitelist = [
    '/js/script.js',
    '/api/event'
];

// Optional, map allowed URI to another for sanitizing any proofs of Plausible Analytics in the URI
$mapping = [
    '/js/script.js' => '/js/plausible.outbound-links.js'
];

// Set URL of Plausible Analytics
$backendUrl = "https://plausible.io";
```

## Contributors
* Jonathan Nessier, [Neoflow](https://www.neoflow.ch)

If you would like to see this reverse proxy for Plausible Analytics develop further, or if you want to support me or show me your appreciation, please
donate any amount through PayPal. Thank you! :beers:

[![Donate](https://img.shields.io/badge/Donate-paypal-blue)](https://www.paypal.me/JonathanNessier)

## License
Licensed under [MIT](LICENSE).

*Made in Switzerland with :cheese: and :heart:*
