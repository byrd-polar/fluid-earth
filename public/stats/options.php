<?php

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
    '/js/script.js' => '/js/plausible.hash.js'
];

// Set URL of Plausible Analytics
$backendUrl = "https://plausible.io";

// Script when running under a folder:
// <script defer data-domain="example.com" data-api="/stats/api/event" src="/stats/js/script.js"></script>

// Script when running in the root:
// <script defer data-domain="example.com" src="/js/script.js"></script>

