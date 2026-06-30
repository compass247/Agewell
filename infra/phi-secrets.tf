/* ============================================================
   PHI portal — secrets (KMS-encrypted Secrets Manager).
   Holds AUTH_SECRET, PHI_ENC_KEY, the RDS password, and the assembled
   DATABASE_URL_PHI. Injected into the portal/migrate tasks via `secrets`
   (valueFrom). Never in plaintext Terraform output.
   ============================================================ */

# Auth.js session-signing secret.
resource "random_password" "phi_auth_secret" {
  length  = 48
  special = false
}

# Master password for the PHI Postgres. URL-safe (no special chars) so the
# DATABASE_URL_PHI connection string never needs escaping.
resource "random_password" "phi_db_master" {
  length  = 32
  special = false
}

# App-layer AES-256-GCM key (32 bytes, base64). ⚠️ MUST be stable FOREVER —
# rotating it makes every existing dob_enc/medicare_mbi_enc/mfa_secret
# undecryptable. Generated ONCE and then frozen: prevent_destroy stops a
# replace, ignore_changes stops any attribute drift from regenerating it.
resource "random_id" "phi_enc_key" {
  byte_length = 32

  lifecycle {
    prevent_destroy = true
    ignore_changes  = all
  }
}

resource "aws_secretsmanager_secret" "phi" {
  name        = "${var.project}-phi"
  description = "PHI portal secrets (AUTH_SECRET, PHI_ENC_KEY, DB password, DATABASE_URL_PHI)."
  kms_key_id  = aws_kms_key.phi.arn

  # PHI secret must not be accidentally deleted; keep a recovery window.
  recovery_window_in_days = 30
}

resource "aws_secretsmanager_secret_version" "phi" {
  secret_id = aws_secretsmanager_secret.phi.id
  secret_string = jsonencode({
    AUTH_SECRET = random_password.phi_auth_secret.result
    # random_id.b64_std is a standard-base64 32-byte value — exactly what
    # src/lib/phi/crypto.js expects for PHI_ENC_KEY.
    PHI_ENC_KEY = random_id.phi_enc_key.b64_std
    DB_PASSWORD = random_password.phi_db_master.result
    DATABASE_URL_PHI = format(
      "postgresql://%s:%s@%s:5432/phi?sslmode=require",
      var.phi_db_username,
      random_password.phi_db_master.result,
      aws_db_instance.phi.address,
    )
  })
}
