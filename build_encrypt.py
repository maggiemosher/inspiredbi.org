#!/usr/bin/env python3
"""
Encrypts the E2A dashboard so it can be hosted on a public static site
(GitHub Pages / Cloudflare) while requiring a password to view.

Usage:
    python3 build_encrypt.py "YourReviewerPassword" src/dashboard.html dist/e2a/index.html

Encryption: AES-256-GCM, key derived with PBKDF2-SHA256 (600,000 iterations).
The page decrypts in the browser with the Web Crypto API. Without the password,
the dashboard content cannot be read, even by viewing the page source.
Requires: pip install cryptography
"""
import base64, os, sys, json
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

ITER = 600_000

def main(pw, src, dst):
    html = open(src, encoding="utf-8").read().encode("utf-8")
    salt, iv = os.urandom(16), os.urandom(12)
    key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITER).derive(pw.encode("utf-8"))
    ct = AESGCM(key).encrypt(iv, html, None)
    payload = json.dumps({"s": base64.b64encode(salt).decode(), "i": base64.b64encode(iv).decode(),
                          "c": base64.b64encode(ct).decode(), "n": ITER})
    tpl = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "login_template.html"), encoding="utf-8").read()
    os.makedirs(os.path.dirname(dst) or ".", exist_ok=True)
    open(dst, "w", encoding="utf-8").write(tpl.replace("__PAYLOAD__", payload))
    print(f"Wrote {dst} ({os.path.getsize(dst)//1024} KB)")

if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    main(*sys.argv[1:])
