<?php
require_once __DIR__ . '/../includes/bootstrap.php';
require_login();
header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error'=>'Method not allowed']); exit; }
$payload = json_decode(file_get_contents('php://input'), true);
if (!is_array($payload) || !hash_equals(csrf_token(), (string)($payload['csrf_token'] ?? ''))) { http_response_code(419); echo json_encode(['error'=>'Invalid request token']); exit; }
$wpm = filter_var($payload['wpm'] ?? null, FILTER_VALIDATE_INT);
$accuracy = filter_var($payload['accuracy'] ?? null, FILTER_VALIDATE_INT);
$errors = filter_var($payload['errors'] ?? null, FILTER_VALIDATE_INT);
$duration = filter_var($payload['duration'] ?? null, FILTER_VALIDATE_INT);
$difficulty = $payload['difficulty'] ?? '';
if ($wpm === false || $wpm < 0 || $wpm > 1000 || $accuracy === false || $accuracy < 0 || $accuracy > 100 || $errors === false || $errors < 0 || $duration === false || !in_array($duration, [30,60,120], true) || !in_array($difficulty, ['easy','medium','hard'], true)) {
    http_response_code(422); echo json_encode(['error'=>'Invalid result data']); exit;
}
$stmt = db()->prepare('INSERT INTO test_results (user_id, wpm, accuracy, errors, duration, difficulty) VALUES (?, ?, ?, ?, ?, ?)');
$stmt->execute([current_user_id(), $wpm, $accuracy, $errors, $duration, $difficulty]);
$bestStmt = db()->prepare('SELECT MAX(wpm) FROM test_results WHERE user_id = ?');
$bestStmt->execute([current_user_id()]);
echo json_encode(['saved'=>true, 'personal_best'=>(int)$bestStmt->fetchColumn()]);
