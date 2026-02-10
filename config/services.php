<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    /*
    |--------------------------------------------------------------------------
    | LibreOffice (for DOCX to PDF export)
    |--------------------------------------------------------------------------
    | Full path to soffice.exe (Windows) or libreoffice/soffice (Linux) for
    | converting exported DOCX to PDF. Optional; if not set, the app will
    | look in default install locations and PATH.
    |
    | For faster conversion, run a LibreOffice listener and use unoconv:
    | 1. Start listener: soffice --headless --accept="socket,host=127.0.0.1,port=2083;urp;StarOffice.ServiceManager"
    | 2. Set libreoffice_use_listener=true and optionally unoconv_path (or have unoconv in PATH).
    */
    'libreoffice_path' => env('LIBREOFFICE_PATH'),
    'libreoffice_use_listener' => env('LIBREOFFICE_USE_LISTENER', false),
    'libreoffice_listener_host' => env('LIBREOFFICE_LISTENER_HOST', '127.0.0.1'),
    'libreoffice_listener_port' => env('LIBREOFFICE_LISTENER_PORT', '2083'),
    'unoconv_path' => env('UNOCONV_PATH'),

];
