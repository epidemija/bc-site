<?php
/**
 * BC IMMOWERT — Geheimnisse für api/kontakt.php
 *
 * Diese Datei NICHT in public_html hochladen. Kopiere sie unter dem Namen
 * "kontakt-geheim.php" EINE Ebene über public_html hoch — also so, dass sie
 * NEBEN dem Ordner public_html liegt, nicht darin. In cPanels File Manager:
 * gehe eine Ebene über public_html (meist einfach die Startansicht), lade
 * dort "kontakt-geheim.php" hoch. Von dort kann niemand die Datei per
 * Browser-URL aufrufen — sie liegt außerhalb des Web-Roots.
 *
 * Diese Datei bleibt dauerhaft dort liegen, auch wenn du public_html später
 * komplett neu hochlädst (neuer Zip vom Sajt) — du musst sie nur EINMAL
 * hochladen, nicht bei jedem Update.
 *
 * Lokal in diesem Projekt: eine Kopie mit den echten Werten liegt in
 * api-geheim/kontakt-geheim.php (git-ignoriert, nie im Repo).
 */

// reCAPTCHA v3 Secret-Key. Aus dem gleichen Google-Konto wie der Site-Key
// (der im Frontend steht, in der Haupt-.env als PUBLIC_RECAPTCHA_SITE_KEY).
define('RECAPTCHA_SECRET_KEY', '');

// Resend API-Key — aus dem Resend-Dashboard. Die Absenderdomain
// (CONTACT_FORM_FROM unten) muss dort verifiziert sein, sonst schlägt jeder
// Versand fehl. https://resend.com/domains
define('RESEND_API_KEY', '');

// Optional — ohne diese Zeile: info@bc-immowert.de und suite@bc-immowert.de.
// define('CONTACT_FORM_RECIPIENTS', ['info@bc-immowert.de', 'suite@bc-immowert.de']);

// Optional — muss eine Adresse auf einer in Resend verifizierten Domain sein.
// define('CONTACT_FORM_FROM', 'BC IMMOWERT Website <kontakt@bc-immowert.de>');

// NUR für die lokale Entwicklung: ohne einen echten RECAPTCHA_SECRET_KEY
// oben würde das Formular sonst mit HTTP 500 (captcha_not_configured)
// ablehnen (Absicht — kein stillschweigend ungeschützter Versand in der
// Produktion). Diese Zeile NIE in die echte, auf dem Server liegende
// kontakt-geheim.php übernehmen — nur in einer rein lokalen Kopie zum
// Testen ohne echten reCAPTCHA-Key.
// define('ALLOW_SKIP_RECAPTCHA_WHEN_UNSET', true);
