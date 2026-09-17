<?php
/**
 * BC IMMOWERT — Kontaktformular-Endpoint (PHP, kein Framework, kein Composer)
 *
 * Ersetzt die frühere eigenständige Node.js-Anwendung (server/app.js, jetzt
 * unter archive/old-components/ abgelegt) — als ganz normale PHP-Datei, die
 * auf jedem cPanel-Hosting sofort läuft — keine "Setup Node.js App", kein
 * separater Prozess, kein NPM Install. Landet automatisch in
 * dist/api/kontakt.php bei jedem `npm run build`, weil Astro alles unter
 * public/ unverändert nach dist/ kopiert (siehe public/.htaccess für die
 * gleiche Logik).
 *
 * Schutzschichten (14.09.2026 erweitert, siehe Kommentare bei den
 * jeweiligen Funktionen für Details):
 *   - Honeypot-Feld (unsichtbares Formularfeld, das nur ein Bot ausfüllt)
 *   - reCAPTCHA v3 serverseitig geprüft, Score-Schwelle + Action-Check —
 *     schlägt standardmäßig fehl (nicht offen), wenn der Key fehlt
 *   - Same-Origin-Prüfung (origin_allowed()) als CSRF-Ersatz für diese
 *     session-lose statische Seite
 *   - Datei-basiertes Rate-Limit pro IP (rate_limit_ok())
 *   - Länge pro Feld begrenzt (FIELD_MAX_LENGTHS), nicht nur die
 *     Gesamtgröße der Anfrage
 *   - Alle Werte HTML-escaped, bevor sie in die versendete E-Mail
 *     eingebettet werden (escape_html())
 *
 * Die Geheimnisse (RECAPTCHA_SECRET_KEY, RESEND_API_KEY, ...) stehen NICHT
 * in dieser Datei — sie liegen in kontakt-geheim.php, EINE Ebene ÜBER
 * public_html, also außerhalb des Web-Roots (kann nie per URL aufgerufen
 * werden). Vorlage: api-geheim/kontakt-geheim.example.php in diesem Repo.
 *
 * Einrichtung auf cPanel (einmalig):
 *   1. Diese Datei kommt automatisch mit, wenn dist/ nach public_html
 *      hochgeladen wird (liegt dann unter public_html/api/kontakt.php).
 *   2. kontakt-geheim.php EINMALIG separat hochladen — nach ~/ (also NEBEN
 *      den Ordner public_html, nicht hinein), mit den echten Werten aus
 *      api-geheim/kontakt-geheim.example.php. Bleibt dort dauerhaft liegen,
 *      auch wenn public_html später komplett neu hochgeladen wird.
 *   3. In public/.htaccess (schon eingetragen) leitet eine RewriteRule
 *      /api/kontakt auf diese Datei um — das Formular selbst
 *      (action="/api/kontakt" in ContactForm.astro) muss dafür NICHT
 *      geändert werden.
 *
 * Logs: eigene Datei kontakt-log.txt, eine Ebene über public_html (siehe
 * "Log-Datei einrichten" weiter unten) — nie per URL abrufbar, aber
 * jederzeit über den cPanel-Dateimanager oder FTP zu öffnen. Jede Zeile
 * beginnt mit "[kontakt]" und einer kurzen Request-ID, damit Zeilen zu
 * einer Anfrage zusammengehören.
 */

declare(strict_types=1);

// Nie rohe PHP-Fehler/Warnungen in die JSON-Antwort durchsickern lassen —
// unabhängig davon, wie das Hosting-Konto display_errors eingestellt hat.
ini_set('display_errors', '0');

// Eigene, leicht auffindbare Log-Datei (14.09.2026). Ohne dies landen
// error_log()-Zeilen irgendwo im allgemeinen PHP-Fehlerprotokoll von
// cPanel (Metrics -> Errors, oder eine verstreute error_log-Datei) — von
// Hosting zu Hosting unterschiedlich leicht zu finden. Stattdessen: eine
// Ebene über public_html (genau wie kontakt-geheim.php), damit sie nie
// per URL abrufbar ist, aber jederzeit über den cPanel-Dateimanager oder
// FTP geöffnet werden kann — Dateiname: kontakt-log.txt.
//
// Einfache Größenbegrenzung ohne Cron/manuelles Aufräumen: wird die Datei
// größer als 2 MB, wird sie einmal nach kontakt-log.txt.alt verschoben
// (eine vorherige .alt-Datei wird dabei überschrieben) und neu begonnen —
// verhindert unbegrenztes Wachstum auf Hosting-Paketen mit Speicherlimit.
// Schlägt der Schreibzugriff fehl (z. B. Verzeichnis nicht beschreibbar),
// fällt PHP automatisch auf sein normales Fehlerprotokoll zurück — kein
// Absturz, nur weniger bequem einsehbar.
$logFile = dirname(__DIR__, 2) . '/kontakt-log.txt';
if (@filesize($logFile) > 2 * 1024 * 1024) {
  @rename($logFile, $logFile . '.alt');
}
@ini_set('error_log', $logFile);

const DEFAULT_RECIPIENTS = ['info@bc-immowert.de', 'suite@bc-immowert.de'];
const RECAPTCHA_MIN_SCORE = 0.5;
const RECAPTCHA_ACTION = 'kontakt';
const REQUIRED_FIELDS = ['vorname', 'nachname', 'email', 'nachricht'];

// Länge pro einzelnem Feld — MAX_BODY_BYTES deckt nur die Gesamtgröße ab,
// nicht ein einzelnes überlanges Feld innerhalb dieses Limits.
const FIELD_MAX_LENGTHS = [
  'vorname' => 100,
  'nachname' => 100,
  'email' => 254, // RFC 5321 Obergrenze für eine gesamte E-Mail-Adresse
  'telefon' => 40,
  'bereich' => 100,
  'leistung' => 100,
  'nachricht' => 5000,
];

// Anfragen pro IP, Sliding-Window-Zähler (siehe rate_limit_check()) —
// zusätzlich zu reCAPTCHA, nicht als Ersatz dafür.
const RATE_LIMIT_MAX_REQUESTS = 6;
const RATE_LIMIT_WINDOW_SECONDS = 600; // 10 Minuten

// Eine echte Anfrage ist ein paar hundert Byte groß. Alles darüber ist
// entweder ein Versehen oder Missbrauch.
const MAX_BODY_BYTES = 20000;

$reqId = bin2hex(random_bytes(4));
$startedAt = microtime(true);

function elapsed_ms(float $startedAt): string {
  return round((microtime(true) - $startedAt) * 1000) . 'ms';
}

/** Eine Zeile pro Ereignis, gut greppbar: "[kontakt] <reqId> <message> <data>". */
function log_line(string $level, string $reqId, string $message, array $data = null): void {
  $line = "[kontakt] {$reqId} {$message}";
  if ($data !== null) $line .= ' ' . json_encode($data, JSON_UNESCAPED_SLASHES);
  error_log($line);
}

function escape_html(?string $value): string {
  return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

/**
 * Same-Origin-Prüfung als leichtgewichtiger CSRF-Schutz. Diese statische
 * Seite hat keine PHP-Sessions und kann daher keinen klassischen
 * CSRF-Token in ein verstecktes Formularfeld rendern — die Origin/Referer-
 * Prüfung ist der Standardersatz dafür bei einer rein statischen Seite mit
 * einem einzelnen API-Endpunkt.
 *
 * Verhindert, dass eine fremde Seite im Hintergrund ein eigenes <form>
 * gegen /api/kontakt abschickt (ein echter Browser-POST, den weder das
 * Honeypot-Feld noch CORS aufhält — CORS schützt nur das Lesen der
 * Antwort, nicht das Absenden selbst).
 *
 * Absichtlich durchlässig, wenn WEDER Origin NOCH Referer gesendet wurden:
 * manche Browser-Datenschutz-Einstellungen und Erweiterungen entfernen
 * beide Header auch bei echten Same-Origin-Anfragen. reCAPTCHA und das
 * Rate-Limit greifen in diesem Fall weiterhin.
 */
function origin_allowed(): bool {
  // parse_url(...)'s PHP_URL_HOST always strips the port, while
  // $_SERVER['HTTP_HOST'] keeps it when the request wasn't on the default
  // port (e.g. "127.0.0.1:8093" in local testing) — compare hostnames only
  // on both sides so this works the same in production (no port in Host)
  // and locally (a port on Host but never on parse_url's PHP_URL_HOST).
  $rawHost = $_SERVER['HTTP_HOST'] ?? '';
  $host = parse_url('http://' . $rawHost, PHP_URL_HOST) ?? $rawHost;

  $origin = $_SERVER['HTTP_ORIGIN'] ?? null;
  if ($origin !== null && $origin !== '') {
    $originHost = parse_url($origin, PHP_URL_HOST);
    return is_string($originHost) && strcasecmp($originHost, $host) === 0;
  }
  $referer = $_SERVER['HTTP_REFERER'] ?? null;
  if ($referer !== null && $referer !== '') {
    $refHost = parse_url($referer, PHP_URL_HOST);
    return is_string($refHost) && strcasecmp($refHost, $host) === 0;
  }
  return true;
}

/**
 * Einfaches dateibasiertes Sliding-Window-Rate-Limit pro IP-Adresse —
 * zusätzliche Schutzschicht neben reCAPTCHA, kein Ersatz dafür (greift
 * z. B. auch dann noch, wenn RECAPTCHA_SECRET_KEY aus Versehen fehlt).
 * Kein Redis/Memcached nötig — passt zum "kein Framework, kein Composer,
 * läuft auf jedem cPanel"-Ansatz dieser Datei.
 *
 * $_SERVER['REMOTE_ADDR'] statt X-Forwarded-For: Letzteres ließe sich vom
 * Client selbst gefälscht mitschicken, wenn kein bekannter vorgeschalteter
 * Proxy geprüft wird, und würde das Rate-Limit damit wirkungslos machen.
 *
 * Bei einem Dateisystemfehler (z. B. temporäres Verzeichnis nicht
 * beschreibbar) wird durchgelassen statt blockiert — ein defektes
 * Rate-Limit soll die Kontaktaufnahme nicht für alle echten Besucher
 * lahmlegen.
 */
function rate_limit_ok(string $reqId): bool {
  $ip = $_SERVER['REMOTE_ADDR'] ?? '';
  if ($ip === '') return true;

  $dir = sys_get_temp_dir() . '/bc-immowert-kontakt-ratelimit';
  if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
    log_line('warn', $reqId, 'rate limit: Verzeichnis nicht erstellbar — durchgelassen');
    return true;
  }

  $file = $dir . '/' . hash('sha256', $ip) . '.json';
  $fp = @fopen($file, 'c+');
  if ($fp === false) {
    log_line('warn', $reqId, 'rate limit: Datei nicht öffenbar — durchgelassen');
    return true;
  }

  flock($fp, LOCK_EX);
  $raw = stream_get_contents($fp);
  $timestamps = $raw !== false && $raw !== '' ? json_decode($raw, true) : [];
  if (!is_array($timestamps)) $timestamps = [];

  $now = time();
  $windowStart = $now - RATE_LIMIT_WINDOW_SECONDS;
  $timestamps = array_values(array_filter($timestamps, fn($t) => is_int($t) && $t > $windowStart));

  $allowed = count($timestamps) < RATE_LIMIT_MAX_REQUESTS;
  if ($allowed) {
    $timestamps[] = $now;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($timestamps));
    fflush($fp);
  }
  flock($fp, LOCK_UN);
  fclose($fp);

  return $allowed;
}

function is_valid_email(mixed $value): bool {
  // Bewusst locker: nur ein Schutz gegen offensichtlichen Unsinn, kein
  // vollständiger RFC-5322-Validator.
  return is_string($value) && preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $value) === 1;
}

function respond_json(int $status, array $body): never {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($body);
  exit;
}

/**
 * Das per-JS verbesserte Formular schickt immer "Accept: application/json"
 * und liest die Antwort selbst aus (ContactForm.astro leitet nach /danke/
 * weiter, sobald der fetch-Aufruf durch ist). Ein normales <form>-Submit
 * ohne JavaScript schickt stattdessen den normalen Browser-Accept-Header
 * und erwartet eine echte Seite zurück — deshalb hier ein echtes 302 nach
 * /danke/ statt eines JSON-Blobs.
 */
function respond_success(): never {
  $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
  if (str_contains($accept, 'application/json')) {
    respond_json(200, ['ok' => true]);
  }
  header('Location: /danke/', true, 302);
  exit;
}

function verify_recaptcha(string $token, string $secret): array {
  $ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => http_build_query(['secret' => $secret, 'response' => $token]),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
  ]);
  $res = curl_exec($ch);
  $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  if ($res === false || $httpCode < 200 || $httpCode >= 300) return ['success' => false];
  $decoded = json_decode($res, true);
  return is_array($decoded) ? $decoded : ['success' => false];
}

/** @return array{ok: bool, status: int, body: string} */
function send_via_resend(string $apiKey, string $from, array $to, string $replyTo, string $subject, string $html): array {
  $ch = curl_init('https://api.resend.com/emails');
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
      'Authorization: Bearer ' . $apiKey,
      'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode([
      'from' => $from,
      'to' => $to,
      'reply_to' => $replyTo,
      'subject' => $subject,
      'html' => $html,
    ]),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
  ]);
  $res = curl_exec($ch);
  $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch);
  curl_close($ch);
  if ($res === false) return ['ok' => false, 'status' => 0, 'body' => $err];
  return ['ok' => $httpCode >= 200 && $httpCode < 300, 'status' => $httpCode, 'body' => $res];
}

// --------------------------------------------------------------- Dispatch

// Liveness-Check — praktisch für einen externen Uptime-Monitor, unabhängig
// vom Rest der statischen Seite.
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  log_line('info', $reqId, 'health check');
  respond_json(200, ['ok' => true, 'service' => 'bc-immowert-kontakt-api', 'time' => date('c')]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  log_line('warn', $reqId, 'rejected: wrong method', ['method' => $_SERVER['REQUEST_METHOD']]);
  header('Allow: POST, GET');
  respond_json(405, ['error' => 'method_not_allowed']);
}

log_line('info', $reqId, 'request received');

if (!origin_allowed()) {
  log_line('warn', $reqId, 'rejected: origin/referer mismatch', [
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? null,
    'referer' => $_SERVER['HTTP_REFERER'] ?? null,
    'host' => $_SERVER['HTTP_HOST'] ?? null,
  ]);
  respond_json(403, ['error' => 'origin_mismatch']);
}

if (!rate_limit_ok($reqId)) {
  log_line('warn', $reqId, 'rejected: rate limit exceeded', ['ip' => $_SERVER['REMOTE_ADDR'] ?? null]);
  respond_json(429, ['error' => 'rate_limited']);
}

// Geheimnisse: eine Ebene über public_html, außerhalb des Web-Roots.
$secretsFile = dirname(__DIR__, 2) . '/kontakt-geheim.php';
if (!is_file($secretsFile)) {
  log_line('error', $reqId, 'kontakt-geheim.php fehlt', ['expected' => $secretsFile]);
  respond_json(500, ['error' => 'not_configured']);
}
require $secretsFile;
// Erwartet danach: RECAPTCHA_SECRET_KEY, RESEND_API_KEY, optional
// CONTACT_FORM_RECIPIENTS (Array), CONTACT_FORM_FROM (String) — siehe
// api-geheim/kontakt-geheim.example.php.

$raw = file_get_contents('php://input');
if ($raw === false) {
  log_line('error', $reqId, 'Anfragekörper konnte nicht gelesen werden');
  respond_json(400, ['error' => 'invalid_body']);
}
if (strlen($raw) > MAX_BODY_BYTES) {
  log_line('warn', $reqId, 'rejected: payload too large');
  respond_json(413, ['error' => 'payload_too_large']);
}

$data = json_decode($raw, true);
if (!is_array($data)) {
  log_line('warn', $reqId, 'rejected: invalid JSON body');
  respond_json(400, ['error' => 'invalid_body']);
}

$vorname = $data['vorname'] ?? null;
$nachname = $data['nachname'] ?? null;
$email = $data['email'] ?? null;
$telefon = $data['telefon'] ?? null;
$bereich = $data['bereich'] ?? null;
$leistung = $data['leistung'] ?? null;
$nachricht = $data['nachricht'] ?? null;
$website = $data['website'] ?? null; // Honeypot
$recaptchaToken = $data['recaptchaToken'] ?? null;
$quelle = $data['quelle'] ?? null;

// Honeypot: ein Bot füllt jedes Feld aus, das er findet, auch dieses — für
// echte Besucher per CSS versteckt, nicht display:none (siehe
// ContactForm.astro). Erfolg vortäuschen, damit der Bot nichts lernt — kein
// Fehler zum Reagieren, keine Mail wird tatsächlich verschickt.
if (!empty($website)) {
  log_line('warn', $reqId, 'honeypot triggered — silently dropped, no mail sent');
  respond_success();
}

foreach (REQUIRED_FIELDS as $field) {
  if (!is_string($data[$field] ?? null) || trim($data[$field]) === '') {
    log_line('warn', $reqId, 'rejected: missing required field', ['field' => $field]);
    respond_json(400, ['error' => 'missing_fields', 'field' => $field]);
  }
}

foreach (FIELD_MAX_LENGTHS as $field => $maxLength) {
  $value = $data[$field] ?? null;
  if (is_string($value) && strlen($value) > $maxLength) {
    log_line('warn', $reqId, 'rejected: field too long', ['field' => $field, 'length' => strlen($value)]);
    respond_json(400, ['error' => 'field_too_long', 'field' => $field]);
  }
}

if (!is_valid_email($email)) {
  log_line('warn', $reqId, 'rejected: invalid email format');
  respond_json(400, ['error' => 'invalid_email']);
}

$recaptchaSecret = defined('RECAPTCHA_SECRET_KEY') ? RECAPTCHA_SECRET_KEY : '';
if ($recaptchaSecret !== '') {
  if (!is_string($recaptchaToken) || $recaptchaToken === '') {
    log_line('warn', $reqId, 'rejected: missing reCAPTCHA token');
    respond_json(400, ['error' => 'missing_captcha']);
  }
  $verification = verify_recaptcha($recaptchaToken, $recaptchaSecret);
  $score = $verification['score'] ?? null;
  $action = $verification['action'] ?? null;
  $scoreOk = !is_numeric($score) || $score >= RECAPTCHA_MIN_SCORE;
  $actionOk = empty($action) || $action === RECAPTCHA_ACTION;
  log_line('info', $reqId, 'reCAPTCHA verified', [
    'success' => $verification['success'] ?? false,
    'score' => $score,
    'action' => $action,
  ]);
  if (empty($verification['success']) || !$scoreOk || !$actionOk) {
    log_line('warn', $reqId, 'rejected: reCAPTCHA check failed', [
      'success' => $verification['success'] ?? false,
      'score' => $score,
      'scoreOk' => $scoreOk,
      'actionOk' => $actionOk,
    ]);
    respond_json(403, ['error' => 'captcha_failed']);
  }
} elseif (defined('ALLOW_SKIP_RECAPTCHA_WHEN_UNSET') && ALLOW_SKIP_RECAPTCHA_WHEN_UNSET === true) {
  // Nur für die lokale Entwicklung gedacht — eine lokale Geheimnisse-Datei
  // kann das explizit setzen, um ohne echten reCAPTCHA-Key testen zu
  // können. Die Produktionsdatei auf dem Server definiert das nie, daher
  // greift standardmäßig der else-Zweig unten (fail closed).
  log_line('warn', $reqId, 'RECAPTCHA_SECRET_KEY not set — skipping verification (ALLOW_SKIP_RECAPTCHA_WHEN_UNSET)');
} else {
  // Fail closed: ein fehlender Key ist eine Fehlkonfiguration, kein Grund,
  // den Spam-Schutz stillschweigend abzuschalten und die Mail trotzdem zu
  // verschicken.
  log_line('error', $reqId, 'RECAPTCHA_SECRET_KEY not set — rejecting (fail closed)');
  respond_json(500, ['error' => 'captcha_not_configured']);
}

$resendApiKey = defined('RESEND_API_KEY') ? RESEND_API_KEY : '';
if ($resendApiKey === '') {
  log_line('error', $reqId, 'RESEND_API_KEY is not set — contact form cannot send mail');
  respond_json(500, ['error' => 'email_not_configured']);
}

$recipients = defined('CONTACT_FORM_RECIPIENTS') && is_array(CONTACT_FORM_RECIPIENTS) && CONTACT_FORM_RECIPIENTS
  ? CONTACT_FORM_RECIPIENTS
  : DEFAULT_RECIPIENTS;

$fromAddress = defined('CONTACT_FORM_FROM') && CONTACT_FORM_FROM !== ''
  ? CONTACT_FORM_FROM
  : 'BC IMMOWERT Website <kontakt@bc-immowert.de>';

// UTM-Parameter als eine "key=value, key=value"-Zeile — nur gerendert, wenn
// mindestens einer tatsächlich vorhanden war.
$utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
$utmParts = [];
foreach ($utmKeys as $key) {
  if (!empty($data[$key])) $utmParts[] = "{$key}=" . $data[$key];
}
$utmLine = $utmParts
  ? '<p><strong>Kampagne:</strong> ' . escape_html(implode(', ', $utmParts)) . '</p>'
  : '';

$html = trim('
  <h2>Neue Anfrage über bc-immowert.de</h2>
  <p><strong>Name:</strong> ' . escape_html($vorname) . ' ' . escape_html($nachname) . '</p>
  <p><strong>E-Mail:</strong> ' . escape_html($email) . '</p>
  <p><strong>Telefon:</strong> ' . ($telefon ? escape_html($telefon) : '–') . '</p>
  <p><strong>Bereich:</strong> ' . ($bereich ? escape_html($bereich) : '–') . '</p>
  <p><strong>Leistung:</strong> ' . ($leistung ? escape_html($leistung) : '–') . '</p>
  <p><strong>Nachricht:</strong><br>' . nl2br(escape_html($nachricht)) . '</p>
  <hr>
  <p><strong>Gesendet von Seite:</strong> ' . ($quelle ? escape_html($quelle) : 'unbekannt (kein Referrer)') . '</p>
  ' . $utmLine . '
');

$sendRes = send_via_resend(
  $resendApiKey,
  $fromAddress,
  $recipients,
  $email,
  "Neue Anfrage von {$vorname} {$nachname}",
  $html
);

if (!$sendRes['ok']) {
  log_line('error', $reqId, 'Resend rejected the send', [
    'status' => $sendRes['status'],
    'body' => $sendRes['body'],
    'elapsed' => elapsed_ms($startedAt),
  ]);
  respond_json(502, ['error' => 'send_failed']);
}

$sendBody = json_decode($sendRes['body'], true);
log_line('info', $reqId, 'mail sent', [
  'recipients' => count($recipients),
  'resendId' => $sendBody['id'] ?? null,
  'quelle' => $quelle ?: null,
  'elapsed' => elapsed_ms($startedAt),
]);

respond_success();
