<?php
declare(strict_types=1);
session_start();
require_once __DIR__ . '/db.php';
function e($value): string { return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8'); }
function redirect(string $path): never { header('Location: ' . $path); exit; }
function is_logged_in(): bool { return isset($_SESSION['user_id']); }
function require_login(): void { if (!is_logged_in()) redirect('login.php'); }
function current_user_id(): int { return (int)($_SESSION['user_id'] ?? 0); }
function csrf_token(): string {
    if (empty($_SESSION['csrf_token'])) $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf_token'];
}
function csrf_field(): string { return '<input type="hidden" name="csrf_token" value="' . e(csrf_token()) . '">'; }
function verify_csrf(): void {
    $sent = $_POST['csrf_token'] ?? '';
    if (!is_string($sent) || !hash_equals(csrf_token(), $sent)) { http_response_code(419); exit('Invalid request token. Refresh and try again.'); }
}
