# TypingTest Pro

A PHP + MySQL typing practice application designed to run locally with XAMPP.

## Requirements
- XAMPP with Apache and MySQL
- PHP 8.0+ recommended
- PDO MySQL extension enabled

## Installation
1. Copy the `TypingTestPro` folder into `C:\xampp\htdocs\`.
2. Open XAMPP Control Panel and start **Apache** and **MySQL**.
3. Visit `http://localhost/phpmyadmin`.
4. Choose **Import**, select `database/typing_test.sql`, and import it.
5. Open `http://localhost/TypingTestPro/`.
6. Create an account and start practicing.

## Database settings
The default configuration in `includes/db.php` uses:
- Host: `127.0.0.1`
- Database: `typing_test`
- Username: `root`
- Password: blank

If your MySQL root account has a password, update `includes/db.php`.

## Features
- Registration and login with password hashing
- Practice timer, WPM, accuracy, errors, and passage progress
- Results modal and toast notifications
- Saved test history and personal best
- Theme and practice preferences stored in browser local storage

## Notes
- This is a local starter project. Do not deploy it publicly without adding production configuration, HTTPS, rate limiting, stronger operational logging, and a review of security settings.
- Settings are saved in the current browser, not in the user's database profile.
- The leaderboard, password reset, and admin tools are not included yet.
