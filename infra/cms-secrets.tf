/* ============================================================
   CMS secrets — Directus keys, DB password, admin bootstrap,
   and the revalidate webhook secret. Generated here and stored
   in Secrets Manager; injected into the ECS task definitions via
   the `secrets` block (valueFrom). Never in plaintext state output.
   ============================================================ */

# Directus KEY + SECRET (signing/encryption). Random, stable across applies.
resource "random_password" "directus_key" {
  length  = 32
  special = false
}

resource "random_password" "directus_secret" {
  length  = 48
  special = false
}

# Postgres master password for the CMS database.
resource "random_password" "cms_db" {
  length  = 32
  special = false # avoid shell/URL-unsafe chars in the DB connection string
}

# Bootstrap admin password (first boot). Rotate via the Studio after first login.
resource "random_password" "cms_admin" {
  length  = 24
  special = true
}

# Shared HMAC secret: Directus Flow -> Next.js /api/revalidate (publish = live).
resource "random_password" "revalidate" {
  length  = 32
  special = false
}

# One Secrets Manager secret holding all CMS credentials as a JSON document.
resource "aws_secretsmanager_secret" "cms" {
  name        = "${var.project}-cms"
  description = "Directus CMS credentials (DB password, keys, admin bootstrap, revalidate secret)."
}

resource "aws_secretsmanager_secret_version" "cms" {
  secret_id = aws_secretsmanager_secret.cms.id
  secret_string = jsonencode({
    DB_PASSWORD       = random_password.cms_db.result
    KEY               = random_password.directus_key.result
    SECRET            = random_password.directus_secret.result
    ADMIN_PASSWORD    = random_password.cms_admin.result
    REVALIDATE_SECRET = random_password.revalidate.result
  })
}
