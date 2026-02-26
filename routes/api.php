<?php

use App\Http\Controllers\AdrFormController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExportDocxController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SectionsController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SwappingRequestController;
use App\Http\Controllers\TemplatesController;
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
Route::post('/auth/verify-email', [AuthController::class, 'verifyEmail'])->name('api.auth.verify-email');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->name('api.auth.reset-password');
Route::get('/sections', [SectionsController::class, 'index'])->name('api.sections.index');
Route::get('/section', [SectionsController::class, 'index'])->name('api.section.index');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/data-retention/settings', [SettingsController::class, 'getRetentionSettings'])->name('api.data-retention.settings.get');
    Route::put('/data-retention/settings', [SettingsController::class, 'updateRetentionSettings'])->name('api.data-retention.settings.update');
    Route::post('/data-retention/preview', [SettingsController::class, 'previewRetention'])->name('api.data-retention.preview');
    Route::post('/data-retention/auto-archive', [SettingsController::class, 'autoArchive'])->name('api.data-retention.auto-archive');
    Route::post('/data-retention/days-until-archive', [SettingsController::class, 'getDaysUntilArchive'])->name('api.data-retention.days-until-archive');
    Route::post('/sections', [SectionsController::class, 'store'])->name('api.sections.store');
    Route::put('/sections/{id}', [SectionsController::class, 'update'])->name('api.sections.update');
    Route::patch('/sections/{id}/archive', [SectionsController::class, 'archive'])->name('api.sections.archive');
    Route::patch('/sections/{id}/restore', [SectionsController::class, 'restore'])->name('api.sections.restore');
    Route::delete('/sections/{id}', [SectionsController::class, 'destroy'])->name('api.sections.destroy');
    Route::get('/auth/me', [AuthController::class, 'me'])->name('api.auth.me');
    Route::post('/auth/logout', [AuthController::class, 'logout'])->name('api.auth.logout');
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/profile', [ProfileController::class, 'show'])->name('api.profile.show');
    Route::put('/profile', [ProfileController::class, 'update'])->name('api.profile.update');
    Route::post('/profile/image', [ProfileController::class, 'uploadImage'])->name('api.profile.uploadImage');
    Route::delete('/profile/image', [ProfileController::class, 'removeImage'])->name('api.profile.removeImage');
    Route::get('/profiles', [ProfileController::class, 'index'])->name('api.profiles.index');
    Route::put('/profiles/{id}', [ProfileController::class, 'updateById'])->name('api.profiles.update');

    Route::get('/schedules', [ScheduleController::class, 'index'])->name('api.schedules.index');
    Route::post('/schedules', [ScheduleController::class, 'store'])->name('api.schedules.store');
    Route::put('/schedules/{id}', [ScheduleController::class, 'update'])->name('api.schedules.update');
    Route::delete('/schedules/{id}', [ScheduleController::class, 'destroy'])->name('api.schedules.destroy');

    Route::get('/swapping-requests', [SwappingRequestController::class, 'index'])->name('api.swapping-requests.index');
    Route::get('/swapping-requests/{id}', [SwappingRequestController::class, 'show'])->name('api.swapping-requests.show');
    Route::post('/swapping-requests', [SwappingRequestController::class, 'store'])->name('api.swapping-requests.store');
    Route::get('/swapping-requests/{id}/export', [SwappingRequestController::class, 'export'])->name('api.swapping-requests.export');
    Route::post('/swapping-requests/{id}/approve', [SwappingRequestController::class, 'approve'])->name('api.swapping-requests.approve');
    Route::post('/swapping-requests/{id}/deny', [SwappingRequestController::class, 'deny'])->name('api.swapping-requests.deny');
    Route::post('/swapping-requests/{id}/archive', [SwappingRequestController::class, 'archive'])->name('api.swapping-requests.archive');
    Route::post('/swapping-requests/{id}/restore', [SwappingRequestController::class, 'restore'])->name('api.swapping-requests.restore');
    Route::get('/swap/available-template', [SwappingRequestController::class, 'getAvailableTemplate'])->name('api.swap.available-template');

    Route::get('/adr-forms', [AdrFormController::class, 'index'])->name('api.adr-forms.index');
    Route::get('/adr-forms/{id}', [AdrFormController::class, 'show'])->name('api.adr-forms.show');
    Route::get('/adr/available-template', [AdrFormController::class, 'getAvailableTemplate'])->name('api.adr.available-template');
    Route::get('/adr/latest-admin-matters', [AdrFormController::class, 'latestAdminMatters'])->name('api.adr.latest-admin-matters');
    Route::post('/adr-forms', [AdrFormController::class, 'store'])->name('api.adr-forms.store');
    Route::put('/adr-forms/{id}', [AdrFormController::class, 'update'])->name('api.adr-forms.update');
    Route::patch('/adr-forms/{id}/archive', [AdrFormController::class, 'archive'])->name('api.adr-forms.archive');
    Route::patch('/adr-forms/{id}/restore', [AdrFormController::class, 'restore'])->name('api.adr-forms.restore');
    Route::delete('/adr-forms/{id}', [AdrFormController::class, 'destroy'])->name('api.adr-forms.destroy');

    Route::post('/adr/export-docx', ExportDocxController::class)->name('api.adr.export-docx');
    Route::get('/adr/export-docx/{token}', [ExportDocxController::class, 'download'])->name('api.adr.export-docx.download');
    Route::post('/adr/export-pdf', [ExportDocxController::class, 'exportPdf'])->name('api.adr.export-pdf');

    Route::get('/templates', [TemplatesController::class, 'index'])->name('api.templates.index');
    Route::post('/templates', [TemplatesController::class, 'store'])->name('api.templates.store');
    Route::patch('/templates/set-active', [TemplatesController::class, 'setActive'])->name('api.templates.set-active');
    Route::get('/templates/{filename}/preview', [TemplatesController::class, 'preview'])->name('api.templates.preview')->where('filename', '[^/]+');
    Route::delete('/templates/{filename}', [TemplatesController::class, 'destroy'])->name('api.templates.destroy')->where('filename', '[^/]+');
    Route::get('/templates/{filename}', [TemplatesController::class, 'show'])->name('api.templates.show')->where('filename', '[^/]+');
});
