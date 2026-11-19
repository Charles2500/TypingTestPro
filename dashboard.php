<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_login();
$userId = current_user_id();
$stats = db()->prepare('SELECT COUNT(*) tests, COALESCE(MAX(wpm),0) best, COALESCE(ROUND(AVG(wpm)),0) average, COALESCE(ROUND(AVG(accuracy)),0) accuracy FROM test_results WHERE user_id = ?');
$stats->execute([$userId]); $summary = $stats->fetch();
$recent = db()->prepare('SELECT wpm, accuracy, errors, duration, created_at FROM test_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 5');
$recent->execute([$userId]); $recentRows = $recent->fetchAll();
$pageTitle = 'Practice';
require __DIR__ . '/includes/header.php';
?>
<div class="app-layout">
<?php require __DIR__ . '/includes/sidebar.php'; ?>
<main class="main-content">
  <div class="page-heading"><div><p class="eyebrow">YOUR WORKSPACE</p><h1>Ready to get faster?</h1><p class="muted">A few focused minutes can make a difference.</p></div><span class="user-chip"><?= e($_SESSION['user_name']) ?></span></div>
  <section class="stats-grid">
    <article class="stat-card"><span class="stat-label">Personal best</span><strong><?= (int)$summary['best'] ?><small> WPM</small></strong></article>
    <article class="stat-card"><span class="stat-label">Average speed</span><strong><?= (int)$summary['average'] ?><small> WPM</small></strong></article>
    <article class="stat-card"><span class="stat-label">Average accuracy</span><strong><?= (int)$summary['accuracy'] ?><small>%</small></strong></article>
    <article class="stat-card"><span class="stat-label">Tests completed</span><strong><?= (int)$summary['tests'] ?></strong></article>
  </section>
  <section class="panel practice-panel">
    <div class="section-heading"><div><p class="eyebrow">TYPING PRACTICE</p><h2>Find your rhythm</h2></div><span class="live-pill"><i></i> Live test</span></div>
    <div class="test-options">
      <label>Difficulty<select id="difficulty"><option value="easy">Easy</option><option value="medium" selected>Medium</option><option value="hard">Hard</option></select></label>
      <label>Duration<select id="duration"><option value="30">30 seconds</option><option value="60" selected>60 seconds</option><option value="120">120 seconds</option></select></label>
    </div>
    <div class="live-stats">
      <div><span>WPM</span><strong id="wpm">0</strong></div><div><span>Accuracy</span><strong id="accuracy">100%</strong></div><div><span>Time left</span><strong id="timer">60</strong></div><div><span>Errors</span><strong id="errors">0</strong></div>
    </div>
    <div id="text" class="typing-text" tabindex="0" aria-label="Text to type"></div>
    <textarea id="typingInput" class="typing-input" aria-label="Type the displayed passage here" autocomplete="off" autocapitalize="off" spellcheck="false" disabled></textarea>
    <div class="progress-track"><div id="progressBar"></div></div>
    <div class="test-footer"><span id="status" class="muted">Press Start Test when you're ready.</span><div class="button-row"><button id="resetBtn" class="btn secondary">Reset</button><button id="startBtn" class="btn primary">Start Test</button></div></div>
  </section>
  <section class="panel">
    <div class="section-heading"><div><p class="eyebrow">RECENT ACTIVITY</p><h2>Latest tests</h2></div><a href="history.php" class="text-link">View history →</a></div>
    <?php if (!$recentRows): ?><p class="empty-state">No tests yet. Complete your first practice to see it here.</p><?php else: ?>
    <div class="table-wrap"><table><thead><tr><th>Date</th><th>WPM</th><th>Accuracy</th><th>Errors</th><th>Duration</th></tr></thead><tbody>
    <?php foreach ($recentRows as $r): ?><tr><td><?= e(date('M j, Y g:i A', strtotime($r['created_at']))) ?></td><td><b><?= (int)$r['wpm'] ?></b></td><td><?= (int)$r['accuracy'] ?>%</td><td><?= (int)$r['errors'] ?></td><td><?= (int)$r['duration'] ?> sec</td></tr><?php endforeach; ?>
    </tbody></table></div><?php endif; ?>
  </section>
</main>
</div>
<div id="toastContainer" class="toast-container" aria-live="polite"></div>
<div id="resultModal" class="modal" aria-hidden="true">
  <div class="modal-backdrop"></div><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="resultTitle">
    <button id="closeModal" class="modal-close" aria-label="Close">×</button><div class="trophy">🏆</div><p class="eyebrow">SESSION COMPLETE</p><h2 id="resultTitle">Great work!</h2><p id="resultMessage" class="muted">Here's your result.</p>
    <div class="result-grid"><div><strong id="finalWpm">0</strong><span>WPM</span></div><div><strong id="finalAccuracy">100%</strong><span>Accuracy</span></div><div><strong id="finalErrors">0</strong><span>Errors</span></div></div>
    <p id="personalBestMessage" class="best-note"></p><div class="button-row"><button id="closeResultBtn" class="btn secondary">Close</button><button id="tryAgainBtn" class="btn primary">Try again ↻</button></div>
  </section>
</div>
<script src="assets/js/app.js"></script>
<?php require __DIR__ . '/includes/footer.php'; ?>
