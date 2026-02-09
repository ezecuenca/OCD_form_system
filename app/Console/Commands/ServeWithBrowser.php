<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Symfony\Component\Process\Process;

class ServeWithBrowser extends Command
{
    /**
     * Track if browser has been opened to prevent multiple opens
     *
     * @var bool
     */
    private static $browserOpened = false;

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'serve {--host=127.0.0.1} {--port=8000}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Start the Laravel development server and open in Microsoft Edge';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $host = $this->option('host');
        $port = $this->option('port');
        $url = "http://{$host}:{$port}";

        $this->info("Starting Laravel development server on {$url}...");

        // Start the PHP built-in server (same as Laravel's serve command)
        $publicPath = $this->laravel->basePath('public');
        $serverFile = $this->laravel->basePath('server.php');

        $process = new Process([
            PHP_BINARY,
            '-S',
            "{$host}:{$port}",
            '-t',
            $publicPath,
            $serverFile
        ], $this->laravel->basePath());

        $process->setTimeout(null);

        // Start the server
        $process->start(function ($type, $buffer) {
            $this->output->write($buffer);
        });

        // Wait a moment for server to start, then open Microsoft Edge (only once)
        if (!self::$browserOpened) {
            sleep(2);
            $this->info("Opening {$url} in Microsoft Edge...");

            if (PHP_OS_FAMILY === 'Windows') {
                @exec('start msedge "' . $url . '"');
                self::$browserOpened = true;
            } else {
                $this->warn("Auto-open in Edge is supported on Windows. Please open {$url} in your browser.");
            }
        }

        $this->info("Server started successfully. Press Ctrl+C to stop.");

        $process->wait();

        return 0;
    }
}
