<?php

use App\Http\Controllers\AdrFormController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExportDocxController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SectionsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('/auth/register', [AuthController::class, 'register'])->name('api.auth.register');
Route::post('/auth/login', [AuthController::class, 'login'])->name('api.auth.login');
Route::get('/sections', [SectionsController::class, 'index'])->name('api.sections.index');
Route::get('/section', [SectionsController::class, 'index'])->name('api.section.index');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me'])->name('api.auth.me');
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('api.auth.logout');
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/profile', [ProfileController::class, 'show'])->name('api.profile.show');
    Route::put('/profile', [ProfileController::class, 'update'])->name('api.profile.update');

    Route::get('/adr-forms', [AdrFormController::class, 'index'])->name('api.adr-forms.index');
    Route::get('/adr-forms/{id}', [AdrFormController::class, 'show'])->name('api.adr-forms.show');
    Route::post('/adr-forms', [AdrFormController::class, 'store'])->name('api.adr-forms.store');
    Route::put('/adr-forms/{id}', [AdrFormController::class, 'update'])->name('api.adr-forms.update');
    Route::patch('/adr-forms/{id}/archive', [AdrFormController::class, 'archive'])->name('api.adr-forms.archive');
    Route::patch('/adr-forms/{id}/restore', [AdrFormController::class, 'restore'])->name('api.adr-forms.restore');
    Route::delete('/adr-forms/{id}', [AdrFormController::class, 'destroy'])->name('api.adr-forms.destroy');

    Route::post('/adr/export-docx', ExportDocxController::class)->name('api.adr.export-docx');
    Route::get('/adr/export-docx/{token}', [ExportDocxController::class, 'download'])->name('api.adr.export-docx.download');
    Route::post('/adr/export-pdf', [ExportDocxController::class, 'exportPdf'])->name('api.adr.export-pdf');
});
