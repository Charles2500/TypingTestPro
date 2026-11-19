<?php
function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;
    $host = '127.0.0.1';
    $database = 'typing_test';
    $username = 'root';
    $password = ''; // Default XAMPP MySQL password. Change if yours is different.
    $dsn = "mysql:host={$host};dbname={$database};charset=utf8mb4";
    try {
        $pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]);
    } catch (PDOException $ex) {
        http_response_code(500);
        exit('Database connection failed. Check that MySQL is running and includes/db.php has the correct credentials. Details: ' . htmlspecialchars($ex->getMessage(), ENT_QUOTES, 'UTF-8'));
    }
    return $pdo;
}
