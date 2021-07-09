<?php

include 'options.php';

$requestUri = str_replace($relativeUri, '', $_SERVER['REQUEST_URI']);

$code = 404;
$content = 'Not found';

if (in_array($requestUri, $whitelist)) {

    $url = $backendUrl . $requestUri;

    if (array_key_exists($requestUri, $mapping)) {
        $url = $backendUrl . $mapping[$requestUri];
    }

    $ch = curl_init($url);
    $headers = [];

    foreach (getallheaders() as $key => $value) {
        if (!in_array($key, ['Host', 'Accept-Encoding', 'X-Forwarded-For', 'Client-IP'])) {
            $headers[$key] = $key . ': ' . $value;
        }
    }

    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }

    $headers['X-Forwarded-For'] = 'X-Forwarded-For: ' . $ip;

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_HEADER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

    if (strtolower($_SERVER['REQUEST_METHOD']) === 'post') {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
    }

    $content = curl_exec($ch);

    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

    curl_close($ch);
}

http_response_code($code);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

if (isset($contentType)) {
    header('content-type: ' . $contentType);
}

echo $content;
