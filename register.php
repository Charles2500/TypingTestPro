<?php
require_once __DIR__ . '/includes/bootstrap.php';
if (is_logged_in()) redirect('dashboard.php');
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $name = trim($_POST['name'] ?? '');
    $email = trim(strtolower($_POST['email'] ?? ''));
    $password = $_POST['password'] ?? '';
    if (mb_strlen($name) < 2) $error = 'Please enter your name.';
    elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) $error = 'Enter a valid email address.';
    elseif (strlen($password) < 8) $error = 'Password must be at least 8 characters.';
    else {
        try {
            $stmt = db()->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
            $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
            $_SESSION['user_id'] = (int)db()->lastInsertId();
            $_SESSION['user_name'] = $name;
            redirect('dashboard.php');
        } catch (PDOException $ex) { $error = 'That email address is already registered.'; }
    }
}
$pageTitle = 'Create account';
require __DIR__ . '/includes/header.php';
?>
<main class="auth-wrap">
  <section class="auth-card">
    <div class="brand-mark">⌨</div><p class="eyebrow">GET STARTED</p>
    <h1>Create your account</h1><p class="muted">Your typing progress, saved in one place.</p>
    <?php if ($error): ?><div class="alert error"><?= e($error) ?></div><?php endif; ?>
    <form method="post" class="stack">
      <?= csrf_field() ?>
      <label>Your name<input name="name" required minlength="2" autocomplete="name" placeholder="Your name"></label>
      <label>Email address<input type="email" name="email" required autocomplete="email" placeholder="you@example.com"></label>
      <label>Password<input type="password" name="password" required minlength="8" autocomplete="new-password" placeholder="At least 8 characters"></label>
      <button class="btn primary full">Create account</button>
    </form>
    <p class="auth-foot">Already registered? <a href="login.php">Sign in</a></p>
  </section>
</main>
<?php require __DIR__ . '/includes/footer.php'; ?>
