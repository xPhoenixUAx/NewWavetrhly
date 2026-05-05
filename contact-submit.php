<?php
declare(strict_types=1);

function clean_input(string $value): string
{
    $value = trim($value);
    $value = str_replace(["\r", "\n"], " ", $value);
    return filter_var($value, FILTER_UNSAFE_RAW, FILTER_FLAG_STRIP_LOW);
}

function redirect_with_status(string $status): void
{
    header("Location: contact.html?form=" . rawurlencode($status) . "#contactForm");
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    redirect_with_status("invalid");
}

if (!empty($_POST["website_url"] ?? "")) {
    redirect_with_status("sent");
}

$name = clean_input((string)($_POST["name"] ?? ""));
$email = clean_input((string)($_POST["email"] ?? ""));
$phone = clean_input((string)($_POST["phone"] ?? ""));
$message = trim((string)($_POST["message"] ?? ""));

if ($name === "" || $email === "" || $message === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    redirect_with_status("invalid");
}

$host = strtolower((string)($_SERVER["HTTP_HOST"] ?? "newwavetrhy.com"));
$host = preg_replace("/:\d+$/", "", $host);
$host = preg_replace("/^www\./", "", $host);

if ($host === "" || $host === "localhost" || substr($host, -6) === ".local") {
    $host = "newwavetrhy.com";
}

$recipient = "support@" . $host;
$from = "no-reply@" . $host;
$subject = "New contact inquiry from " . $name;

$safeMessage = trim(strip_tags($message));
$body = implode("\n", [
    "New website inquiry",
    "-------------------",
    "Name: " . $name,
    "Email: " . $email,
    "Phone: " . ($phone !== "" ? $phone : "Not provided"),
    "",
    "Message:",
    $safeMessage,
    "",
    "Sent from: " . ($host ?: "website"),
]);

$headers = [
    "From: NewWavetrhy Website <" . $from . ">",
    "Reply-To: " . $email,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "X-Mailer: PHP/" . phpversion(),
];

$sent = mail($recipient, $subject, $body, implode("\r\n", $headers));

redirect_with_status($sent ? "sent" : "error");
