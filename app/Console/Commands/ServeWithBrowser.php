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
    protected $description = 'Start the Laravel development server and open in Brave browser';

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

        // Find Brave browser path
        $bravePath = $this->findBraveBrowser();

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

        // Wait a moment for server to start, then open browser (only once)
        if ($bravePath && !self::$browserOpened) {
            sleep(2);
            $this->info("Opening {$url} in Brave browser...");
            
            if (PHP_OS_FAMILY === 'Windows') {
                // Use exec to open URL - this will reuse existing Brave window if open
                @exec("start \"\" \"{$bravePath}\" \"{$url}\"");
                self::$browserOpened = true;
            }
        } elseif (!$bravePath) {
            $this->warn("Brave browser not found. Please open {$url} manually.");
        }

        $this->info("Server started successfully. Press Ctrl+C to stop.");

        $process->wait();

        return 0;
    }

    /**
     * Find Brave browser executable path
     *
     * @return string|null
     */
    protected function findBraveBrowser()
    {
        $possiblePaths = [
            getenv('LOCALAPPDATA') . '\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
            getenv('ProgramFiles') . '\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
            getenv('ProgramFiles(x86)') . '\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
        ];

        foreach ($possiblePaths as $path) {
            if (file_exists($path)) {
                return $path;
            }
        }

        // Check if BROWSER_PATH is set in .env
        $browserPath = env('BROWSER_PATH');
        if ($browserPath && file_exists($browserPath)) {
            return $browserPath;
        }

        return null;
    }
}
