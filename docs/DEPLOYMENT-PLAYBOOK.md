# Playbook: Triển khai website từ đầu (Design → Git → AWS ECS → Domain → Launch)

Tài liệu này mô tả **toàn bộ quy trình** đã dùng để launch website Compass AgeWell, viết
lại theo dạng có thể **lặp lại cho dự án tương tự**: từ một bản thiết kế prototype (Claude.ai
hoặc bất kỳ React prototype nào) → biến thành web production → tự động deploy lên AWS ECS
Fargate → trỏ domain qua Cloudflare → HTTPS → live.

> **Đối tượng**: người setup hạ tầng (DevOps / tech lead). Cần quyền AWS + Cloudflare.
> Sau khi setup xong một lần, dev chỉ cần `git push` (xem [DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md)).

---

## 0. Kiến trúc tổng quan

```
                                    ┌─────────────────────────────────────┐
   Cloudflare DNS                   │              AWS (us-east-1)         │
   compassagewell.com  ──CNAME──►   │   ┌────────┐    ┌──────────────┐     │
   www                              │   │  ALB   │───►│ ECS Fargate  │     │
                                    │   │ :443   │    │ nginx static │     │
                                    │   │ (ACM)  │    │ (Vite dist)  │     │
                                    │   └────────┘    └──────────────┘     │
                                    │        ▲              ▲ image        │
   api.compassagewell.com ─CNAME─►  │   ┌──────────┐    ┌───────┐          │
                                    │   │ API GW   │───►│Lambda │──► DynamoDB
                                    │   │ /api/lead│    │ lead  │──► SES    │
                                    │   └──────────┘    └───────┘          │
                                    │   ECR (image registry)               │
                                    └─────────────────────────────────────┘
        ▲ git push main
   GitHub Actions (OIDC) ──build──► ECR ──rolling deploy──► ECS + Lambda
```

**Các quyết định kiến trúc** (và lý do):
| Hạng mục | Lựa chọn | Lý do |
|---|---|---|
| Build frontend | Vite + React 18 | Build tĩnh, nhẹ, SEO tốt, không cần Node runtime |
| Serving | nginx static / ECS Fargate + ALB | Rẻ, đơn giản, hợp site 1 trang tĩnh |
| Backend form | API Gateway + Lambda + DynamoDB | Serverless, scale-to-zero, gần như miễn phí ở traffic thấp |
| IaC | Terraform | Quản cả AWS + Cloudflare, version control, tái lập |
| DNS/HTTPS | Cloudflare (DNS-only) + ACM trên ALB | ALB tự terminate TLS, đơn giản |

---

## 1. Chuẩn bị công cụ (máy local)

Cài các công cụ sau (Windows dùng `winget`):

```powershell
winget install OpenJS.NodeJS.LTS          # Node 20+ (build frontend)
winget install Docker.DockerDesktop        # build/test container local
winget install Hashicorp.Terraform         # dựng hạ tầng
winget install Amazon.AWSCLI               # gọi AWS
winget install GitHub.cli                  # set secrets, theo dõi CI
```

> Sau khi cài, **mở terminal MỚI** để PATH cập nhật. Kiểm tra:
> `node -v`, `docker --version`, `terraform version`, `aws --version`, `gh --version`.

---

## 2. Chuẩn bị tài khoản & quyền (làm thủ công, cần con người)

### 2a. AWS — tạo IAM user + access key
1. Đăng nhập AWS Console → dịch vụ **IAM**
2. **Users → Create user** (vd `agewell-admin`), KHÔNG cần console access
3. **Attach policies directly → AdministratorAccess** (thu hẹp quyền sau khi xong)
4. Vào user → **Security credentials → Create access key → CLI** → tải `.csv`
5. Trong terminal local: `aws configure` → nhập Access Key / Secret / region `us-east-1` / format `json`
6. Verify: `aws sts get-caller-identity` (phải ra Account + Arn)

### 2b. Cloudflare — Zone ID + API token
1. dash.cloudflare.com → chọn domain → tab **Overview** → copy **Zone ID** (cột phải)
2. **My Profile → API Tokens → Create Token → template "Edit zone DNS"**
3. Zone Resources: `Include → Specific zone → <domain>` → Create → **copy token** (chỉ hiện 1 lần)

### 2c. SES — verify email gửi lead (tùy chọn)
```powershell
aws ses verify-email-identity --email-address "you@example.com" --region us-east-1
```
→ mở mail, bấm link xác nhận. SES mặc định **sandbox** (chỉ gửi tới email đã verify); muốn
gửi tới bất kỳ ai cần xin thoát sandbox trong AWS Console.

---

## 3. Port prototype → Vite + React (nếu bắt đầu từ prototype)

Nếu có prototype kiểu Claude.ai (JSX biên dịch trình duyệt, không build step):

1. **Scaffold** project Vite ở root:
   - `package.json` (react, react-dom pin đúng version prototype; vite, @vitejs/plugin-react)
   - `vite.config.js` (plugin react + proxy `/api` cho dev)
   - `index.html` (giữ meta SEO/OG/Twitter/canonical)
2. **Chuyển module pattern**: prototype thường dùng IIFE + `window.X = ...`. Đổi sang
   `import`/`export` ESM chuẩn. Mỗi file export component thay vì gắn lên `window`.
3. **Tổ chức** `src/`: `main.jsx` (entry), `App.jsx`, `content-data.js`, `components/`, `sections/`, `styles.css`, `api.js`.
4. **Bỏ phần chỉ dùng cho prototype** (vd tweaks-panel), hardcode giá trị đã chốt.
5. **Assets** → `public/assets/`, tham chiếu `/assets/...`. Thêm `robots.txt`, `sitemap.xml`.
6. **Form** → gọi `src/api.js` POST `/api/lead`, thêm validation + honeypot chống bot.
7. **Verify local**:
   ```powershell
   npm install
   npm run build      # phải sạch, ra dist/
   npm run lint       # phải xanh
   npm run preview    # mở thử, kiểm các section + responsive + form
   ```

---

## 4. Container hoá (Dockerfile + nginx)

- **`Dockerfile`** multi-stage: stage 1 `node:20-alpine` build → stage 2 `nginx:alpine` serve `dist/`.
  Nhận `ARG VITE_API_BASE` để bake API URL lúc build.
- **`nginx.conf`**: SPA fallback (`try_files ... /index.html`), endpoint `/healthz` trả 200,
  gzip, security headers, cache dài cho `/assets/`, no-cache cho `index.html`.
- **`.dockerignore`**: loại `node_modules`, `dist`, `.git`, `BD_Requirements`, `infra`, `backend`.
- **Test local** (validate đúng image ECS sẽ chạy):
  ```powershell
  docker build -t web:test .
  docker run -d --name web-test -p 8099:80 web:test
  curl http://localhost:8099/healthz     # phải 200
  docker rm -f web-test
  ```

---

## 5. Backend lead form (serverless)

`backend/lead-handler/`:
- `package.json` (`@aws-sdk/client-dynamodb`, `lib-dynamodb`, `client-sesv2`)
- `index.mjs`: handler `POST /api/lead` → validate (tên + SĐT) → honeypot → ghi DynamoDB → SES (best-effort)
- Cài deps production: `npm install --omit=dev` (Terraform sẽ zip thư mục này)

---

## 6. Hạ tầng Terraform (`infra/`)

Cấu trúc file (tách theo nhóm cho dễ đọc):
| File | Nội dung |
|---|---|
| `versions.tf` | providers (aws, cloudflare, archive, tls) + backend S3 |
| `variables.tf` | biến đầu vào (region, domain, email, github_repo...) |
| `network.tf` | default VPC + subnets + security groups |
| `acm.tf` | ACM cert (apex+www) validate qua Cloudflare DNS |
| `alb.tf` | ALB + target group + listeners (80→443 redirect) |
| `ecr.tf` | ECR repo + lifecycle (giữ 10 image) |
| `ecs.tf` | cluster + task def + service + IAM execution role + logs |
| `backend.tf` | DynamoDB + Lambda + API Gateway + custom domain api.* |
| `dns.tf` | Cloudflare CNAME apex/www → ALB |
| `oidc.tf` | GitHub OIDC provider + deploy role |
| `outputs.tf` | xuất ARN/URL cần cho GitHub config |

### 6a. Bootstrap state (làm 1 lần)
State của Terraform không tự quản chính nó được, nên tạo bằng tay trước:
```powershell
$ACCOUNT = (aws sts get-caller-identity --query Account --output text)
$BUCKET = "agewell-tfstate-$ACCOUNT"
aws s3api create-bucket --bucket $BUCKET --region us-east-1
aws s3api put-bucket-versioning --bucket $BUCKET --versioning-configuration Status=Enabled
aws s3api put-public-access-block --bucket $BUCKET --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
aws dynamodb create-table --table-name agewell-tf-lock --attribute-definitions AttributeName=LockID,AttributeType=S --key-schema AttributeName=LockID,KeyType=HASH --billing-mode PAY_PER_REQUEST --region us-east-1
```

### 6b. Cấu hình + apply
1. Copy `infra/terraform.tfvars.example` → `infra/terraform.tfvars`, điền region/domain/email (file này **gitignored**).
2. Cài deps Lambda: `cd backend/lead-handler; npm install --omit=dev; cd ../..`
3. Đặt biến môi trường Cloudflare (KHÔNG ghi vào file):
   ```powershell
   $env:TF_VAR_cloudflare_api_token = "<token>"
   $env:TF_VAR_cloudflare_zone_id   = "<zone-id>"
   ```
4. Init + plan + apply:
   ```powershell
   cd infra
   terraform init -backend-config="bucket=$BUCKET" -backend-config="region=us-east-1" -backend-config="dynamodb_table=agewell-tf-lock"
   terraform plan -out tf.plan        # REVIEW kỹ: "X to add, 0 to destroy"
   terraform apply tf.plan            # gõ yes
   ```
   > Bước `aws_acm_certificate_validation` chờ DNS validate, **2–5 phút** là bình thường.
5. **Lưu lại Outputs** (`terraform output`) — cần cho bước 7.

> ⚠️ Lần apply đầu, ECS chạy image placeholder `:bootstrap` → task chưa healthy. Bình thường,
> sẽ khỏe sau khi CI push image thật (bước 8).

---

## 7. Cấu hình GitHub (secrets + variables)

Dùng `gh` CLI (lấy giá trị từ `terraform output`):
```powershell
$REPO = "compass247/Agewell"
# Secrets
gh secret set AWS_DEPLOY_ROLE_ARN --repo $REPO --body "<github_deploy_role_arn>"
gh secret set TF_STATE_BUCKET     --repo $REPO --body "agewell-tfstate-<account>"
# Variables
gh variable set AWS_REGION         --repo $REPO --body "us-east-1"
gh variable set ECR_REPOSITORY     --repo $REPO --body "agewell-web"
gh variable set ECS_CLUSTER        --repo $REPO --body "agewell"
gh variable set ECS_SERVICE        --repo $REPO --body "agewell-web"
gh variable set LEAD_LAMBDA_NAME   --repo $REPO --body "agewell-lead-handler"
gh variable set API_BASE           --repo $REPO --body "https://api.compassagewell.com"
gh variable set CLOUDFLARE_ZONE_ID --repo $REPO --body "<zone-id>"
```
> `CLOUDFLARE_API_TOKEN` chỉ cần nếu chạy `infra.yml` trên cloud. Nếu apply Terraform local thì bỏ qua.

---

## 8. Deploy lần đầu + verify

```powershell
gh workflow run deploy.yml --repo compass247/Agewell --ref main
gh run watch <run-id> --repo compass247/Agewell --exit-status
```
Pipeline: build image → push ECR → render task def → ECS rolling deploy → update Lambda.

### Verify production
```powershell
# ECS healthy
aws ecs describe-services --cluster agewell --services agewell-web --region us-east-1 --query 'services[0].{running:runningCount,desired:desiredCount}'
# Site
curl -s -o /dev/null -w "%{http_code}" https://compassagewell.com/         # 200
curl -s -o /dev/null -w "%{http_code}" https://compassagewell.com/healthz  # 200
# Form API
curl -X POST https://api.compassagewell.com/api/lead -H "Content-Type: application/json" -d '{"name":"Test","phone":"408-555-1234","lang":"vi","source":"smoke"}'
# → {"ok":true,...}; kiểm DynamoDB: aws dynamodb scan --table-name agewell-leads --region us-east-1 --query Count
```

Sau đó **xóa lead test** khỏi DynamoDB nếu cần.

---

## 9. Checklist launch

- [ ] `https://<domain>` trả 200, SSL hợp lệ, không cảnh báo trình duyệt
- [ ] `www` + HTTP→HTTPS redirect hoạt động
- [ ] Các section render đúng trên mobile + desktop, toggle ngôn ngữ OK
- [ ] Form submit thật → lưu DynamoDB (+ email nếu đã verify SES)
- [ ] OG/Twitter card hiển thị đúng khi share (Zalo/Facebook)
- [ ] `robots.txt` + `sitemap.xml` truy cập được
- [ ] CI/CD: push thử commit nhỏ → deploy tự động xanh

---

## 10. Gỡ bỏ toàn bộ (nếu cần huỷ dự án)

```powershell
cd infra
terraform destroy            # xoá 39 resource AWS + DNS Cloudflare
# Xoá state bucket + lock table thủ công (chúng nằm ngoài Terraform)
aws s3 rb s3://agewell-tfstate-<account> --force
aws dynamodb delete-table --table-name agewell-tf-lock --region us-east-1
```

---

## Phụ lục: Chi phí ước tính (traffic thấp)

| Dịch vụ | Chi phí/tháng (ước) |
|---|---|
| ALB | ~16–20 USD (chi phí cố định chính) |
| ECS Fargate (1 task, 0.25 vCPU/0.5GB) | ~9 USD |
| Lambda + DynamoDB + API Gateway | gần như miễn phí ở traffic thấp |
| SES | 0 (vài nghìn email đầu miễn phí) |
| ECR storage | < 1 USD |
| **Tổng** | **~25–30 USD/tháng** |

Muốn rẻ hơn nữa: cân nhắc thay ALB+ECS bằng S3+CloudFront (static hosting) — nhưng mất khả
năng chạy container.
