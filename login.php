<?php
require_once __DIR__ . '/includes/bootstrap.php';
if (is_logged_in()) redirect('dashboard.php');
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $stmt = db()->prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if ($user && password_verify($password, $user['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['user_id'] = (int)$user['id'];
        $_SESSION['user_name'] = $user['name'];
        redirect('dashboard.php');
    }
    $error = 'Incorrect email or password.';
}
$pageTitle = 'Sign in';
require __DIR__ . '/includes/header.php';
?>
<main class="auth-wrap">
  <section class="auth-card">
    <div class="brand-mark">⌨</div><p class="eyebrow">WELCOME BACK</p>
    <h1>Sign in to TypingTest Pro</h1><p class="muted">Track your progress and improve every day.</p>
    <?php if ($error): ?><div class="alert error"><?= e($error) ?></div><?php endif; ?>
    <form method="post" class="stack">
      <?= csrf_field() ?>
      <label>Email address<input type="email" name="email" required autocomplete="email" placeholder="you@example.com"></label>
      <label>Password<input type="password" name="password" required autocomplete="current-password" placeholder="Your password"></label>
      <button class="btn primary full">Sign in</button>
    </form>
    <p class="auth-foot">New here? <a href="register.php">Create an account</a></p>
  </section>
</main>
<?php require __DIR__ . '/includes/footer.php'; ?>
