# Deploy Melody ke OpenShift (Sekali Apply)

## 1) Login dan buat project

```bash
oc login <API_SERVER> --token=<TOKEN>
oc new-project melody-trial
```

## 2) Sekali apply semua resource (ImageStream + BuildConfig + Deployment + Service + Route)

### Opsi cepat (nilai default)

```bash
oc process -f /home/runner/work/melody/melody/openshift/template.yaml | oc apply -f -
```

### Opsi parameterized (disarankan)

```bash
oc process -f /home/runner/work/melody/melody/openshift/template.yaml \
  -p APP_NAME=melody \
  -p GIT_URI=https://github.com/0xAre/melody.git \
  -p GIT_REF=main \
  -p ROUTE_HOST= \
  -p REPLICAS=1 \
  -p REQUEST_CPU=50m \
  -p REQUEST_MEMORY=128Mi \
  -p LIMIT_CPU=250m \
  -p LIMIT_MEMORY=256Mi \
  | oc apply -f -
```

> `ROUTE_HOST` boleh dikosongkan agar OpenShift generate host otomatis.

## 3) Build image dari source repo

```bash
oc start-build melody --follow
```

Jika `APP_NAME` bukan `melody`, pakai nama sesuai parameter:

```bash
oc start-build <APP_NAME> --follow
```

## 4) Tunggu rollout selesai

```bash
oc rollout status deployment/melody
```

Jika `APP_NAME` custom:

```bash
oc rollout status deployment/<APP_NAME>
```

## 5) Verifikasi

```bash
ROUTE_URL="https://$(oc get route melody -o jsonpath='{.spec.host}')"
echo "$ROUTE_URL"

# Root
curl -I "$ROUTE_URL/"

# SPA route refresh check (harus bukan 404)
curl -I "$ROUTE_URL/search"

# Static data check
curl -I "$ROUTE_URL/songs.json"
```

Jika `APP_NAME` custom, ganti `route melody` jadi `route <APP_NAME>`.

## 6) Hardening lanjutan (opsional)

- Tambah `NetworkPolicy` untuk batasi trafik internal.
- Tambah pipeline build/deploy otomatis via GitHub Actions atau OpenShift Pipelines.
- Atur HPA jika traffic meningkat.

## Catatan teknis

- Build menggunakan `Dockerfile` multi-stage (`node` build + `nginx-unprivileged` runtime).
- SPA fallback aktif via `try_files $uri $uri/ /index.html;` di `/home/runner/work/melody/melody/openshift/nginx.conf`.
- Health endpoint tersedia di `/healthz`.
- Manifest terpisah tetap tersedia di folder `/home/runner/work/melody/melody/openshift/` jika perlu apply per resource.
