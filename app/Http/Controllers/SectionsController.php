<?php

namespace App\Http\Controllers;

use App\Models\Section;

class SectionsController extends Controller
{
    public function index()
    {
        return Section::query()
            ->select(['id', 'name'])
            ->orderBy('name')
            ->get();
    }
}
