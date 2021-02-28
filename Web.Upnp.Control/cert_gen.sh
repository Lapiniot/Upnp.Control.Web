#!/usr/bin/env bash

PARENT=$(hostname)
FILE_NAME=upnp-dashboard

openssl req \
-x509 \
-newkey rsa:4096 \
-sha256 \
-days 365 \
-nodes \
-keyout $FILE_NAME.key \
-out $FILE_NAME.crt \
-extensions v3_req \
-config <( \
  echo "[req]"; \
  echo "default_bits            = 4096"; \
  echo "distinguished_name      = req_distinguished_name"; \
  echo "x509_extensions         = v3_req"; \
  echo "req_extensions          = v3_req"; \
  echo "prompt                  = no"; \
  echo "[req_distinguished_name]"; \
  echo "commonName              = ${PARENT}"; \
  echo "[v3_req]"; \
  echo "basicConstraints        = critical, CA:FALSE"; \
  echo "keyUsage                = critical, nonRepudiation, keyCertSign, cRLSign, digitalSignature, keyEncipherment"; \
  echo "extendedKeyUsage        = critical, serverAuth"; \
  echo "subjectAltName          = critical, @alt_names"; \
  echo "subjectKeyIdentifier    = hash"; \
  echo "authorityKeyIdentifier  = keyid:always, issuer"; \
  echo "1.3.6.1.4.1.311.84.1.1  = ASN1:UTF8String:02"; \
  echo "[alt_names]"; \
  echo "DNS.1                   = www.${PARENT}"; \
  echo "DNS.2                   = ${PARENT}"; \
  echo "DNS.3                   = localhost"; \
  echo "IP.1                    = 127.0.0.1")

openssl x509 -noout -text -in $FILE_NAME.crt

openssl pkcs12 -export -out $FILE_NAME.pfx -inkey $FILE_NAME.key -in $FILE_NAME.crt