<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', 'After Duty Report System')</title>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
    @stack('styles')
</head>
<body class="antialiased">
    <aside class="sidebar">
        <div class="sidebar__logo">
            <img src="{{ asset('images/ocd_logo.svg') }}" alt="OCD Logo" class="sidebar__logo-img">
        </div>

        <nav class="sidebar__nav">
            <a href="{{ route('adr-reports.index') }}" data-route="/adr-reports" class="sidebar__link {{ request()->routeIs('adr-reports.*') || request()->is('/') ? 'sidebar__link--active' : '' }}">
                <span class="sidebar__link-icon">
                    <img src="{{ asset('images/adr_report_logo.svg') }}" alt="ADR Reports" class="sidebar__link-icon-img">
                </span>
                <span class="sidebar__link-text">ADR Reports</span>
            </a>

            <a href="{{ route('archived-reports.index') }}" data-route="/archived-reports" class="sidebar__link {{ request()->routeIs('archived-reports.*') ? 'sidebar__link--active' : '' }}">
                <span class="sidebar__link-icon">
                    <img src="{{ asset('images/adr_archive_logo.svg') }}" alt="Archived Reports" class="sidebar__link-icon-img">
                </span>
                <span class="sidebar__link-text">Archived Reports</span>
            </a>
        </nav>

        <div class="sidebar__settings">
            <a href="{{ route('settings.index') }}" data-route="/settings" class="sidebar__link {{ request()->routeIs('settings.*') ? 'sidebar__link--active' : '' }}">
                <span class="sidebar__link-icon">
                    <img src="{{ asset('images/setting_logo.svg') }}" alt="Settings" class="sidebar__link-icon-img">
                </span>
                <span class="sidebar__link-text">Settings</span>
            </a>
        </div>
    </aside>

    <header class="header">
        <div class="header__user">
            <img src="{{ asset('images/user_icon.svg') }}" alt="User" class="header__user-icon">
            <svg class="header__user-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
    </header>

    <main class="main-content" id="app-content">
        @yield('content')
    </main>

    <script src="{{ asset('js/app.js') }}"></script>
    @stack('scripts')
</body>
</html>
