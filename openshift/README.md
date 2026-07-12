# Deploy Melody ke OpenShift (Uji Coba)

## 1) Login dan buat project

```bash
oc login <API_SERVER> --token=<TOKEN>
oc new-project melody-trial
```

## 2) Buat resource build dan image

```bash
oc apply -f /home/runner/work/melody/melody/openshift/imagestream.yaml
oc apply -f /home/runner/work/melody/melody/openshift/buildconfig.yaml
```

> Kalau ingin pakai fork/branch lain, update `spec.source.git.uri` dan `spec.source.git.ref` pada `/home/runner/work/melody/melody/openshift/buildconfig.yaml`.

## 3) Build image dari source repo

```bash
oc start-build melody --follow
```

## 4) Deploy aplikasi + service + route

```bash
oc apply -f /home/runner/work/melody/melody/openshift/deployment.yaml
oc apply -f /home/runner/work/melody/melody/openshift/service.yaml
oc apply -f /home/runner/work/melody/melody/openshift/route.yaml
oc rollout status deployment/melody
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

## 6) Hardening lanjutan (opsional)

- Tambah `NetworkPolicy` untuk batasi trafik internal.
- Tambah pipeline build/deploy otomatis via GitHub Actions atau OpenShift Pipelines.
- Atur HPA jika traffic meningkat.

## Catatan teknis

- Build menggunakan `Dockerfile` multi-stage (`node` build + `nginx-unprivileged` runtime).
- SPA fallback aktif via `try_files $uri $uri/ /index.html;` di `/home/runner/work/melody/melody/openshift/nginx.conf`.
- Health endpoint tersedia di `/healthz`.
