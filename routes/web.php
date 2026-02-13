<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::view('/login', 'welcome')->name('login');
Route::view('/signup', 'welcome')->name('signup');

Route::middleware('auth')->group(function () {
    Route::get('/', function () {
        return view('welcome');
    })->name('dashboard');

    Route::get('/dashboard', function () {
        return redirect()->route('adr-reports.index');
    })->name('dashboard.index');

    // Placeholder routes for sidebar navigation
    Route::get('/adr-reports', function () {
        return view('welcome');
    })->name('adr-reports.index');

    Route::get('/schedule', function () {
        return view('welcome');
    })->name('schedule.index');

    Route::get('/archived-reports', function () {
        return view('welcome');
    })->name('archived-reports.index');

    Route::get('/settings', function () {
        return view('welcome');
    })->name('settings.index');

    // Catch-all route for client-side routing
    // This ensures that refreshing on any client-side route (like /adr-reports/create)
    // will return the main view instead of a 404
    Route::get('/{any}', function () {
        return view('welcome');
    })->where('any', '.*');
});
