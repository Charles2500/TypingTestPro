<?php
require_once __DIR__ . '/includes/bootstrap.php'; require_login();
$stmt = db()->prepare('SELECT wpm, accuracy, errors, duration, difficulty, created_at FROM test_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 100');
$stmt->execute([current_user_id()]); $rows = $stmt->fetchAll();
$pageTitle = 'History'; require __DIR__ . '/includes/header.php';
?>
<div class="app-layout"><?php require __DIR__ . '/includes/sidebar.php'; ?>
<main class="main-content"><div class="page-heading"><div><p class="eyebrow">YOUR PROGRESS</p><h1>Typing history</h1><p class="muted">Review your latest practice sessions.</p></div></div>
<section class="panel"><div class="section-heading"><h2>Previous tests</h2><span class="muted"><?= count($rows) ?> records</span></div>
<?php if (!$rows): ?><p class="empty-state">Your completed tests will appear here.</p><?php else: ?><div class="table-wrap"><table><thead><tr><th>Date</th><th>WPM</th><th>Accuracy</th><th>Errors</th><th>Duration</th><th>Difficulty</th></tr></thead><tbody>
<?php foreach ($rows as $r): ?><tr><td><?= e(date('M j, Y g:i A', strtotime($r['created_at']))) ?></td><td><b><?= (int)$r['wpm'] ?></b></td><td><?= (int)$r['accuracy'] ?>%</td><td><?= (int)$r['errors'] ?></td><td><?= (int)$r['duration'] ?> sec</td><td><?= e(ucfirst($r['difficulty'])) ?></td></tr><?php endforeach; ?>
</tbody></table></div><?php endif; ?></section></main></div>
<?php require __DIR__ . '/includes/footer.php'; ?>
