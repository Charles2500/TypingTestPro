<?php
require_once __DIR__ . '/includes/bootstrap.php'; require_login();
$pageTitle = 'Settings'; require __DIR__ . '/includes/header.php';
?>
<div class="app-layout"><?php require __DIR__ . '/includes/sidebar.php'; ?>
<main class="main-content"><div class="page-heading"><div><p class="eyebrow">PREFERENCES</p><h1>Settings</h1><p class="muted">Adjust the practice experience on this device.</p></div></div>
<section class="panel settings-panel"><h2>Appearance</h2><p class="muted">Choose a theme for the application.</p><div class="setting-row"><div><b>Dark mode</b><p class="muted">Use a darker color scheme.</p></div><label class="switch"><input type="checkbox" id="themeSetting"><span></span></label></div>
<h2 class="settings-subhead">Practice defaults</h2><div class="setting-row"><div><b>Default duration</b><p class="muted">Choose your preferred test length.</p></div><select id="defaultDuration"><option value="30">30 seconds</option><option value="60">60 seconds</option><option value="120">120 seconds</option></select></div>
<div class="setting-row"><div><b>Default difficulty</b><p class="muted">Choose the starting passage level.</p></div><select id="defaultDifficulty"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div><button id="saveSettings" class="btn primary">Save preferences</button><p id="settingsStatus" class="muted" role="status"></p></section></main></div>
<script src="assets/js/settings.js"></script>
<?php require __DIR__ . '/includes/footer.php'; ?>
