<?php

use App\Http\Controllers\ExportDocxController;
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

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/adr/export-docx', ExportDocxController::class)->name('api.adr.export-docx');
Route::get('/adr/export-docx/{token}', [ExportDocxController::class, 'download'])->name('api.adr.export-docx.download');
