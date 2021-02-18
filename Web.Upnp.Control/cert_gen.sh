#!/usr/bin/env bash

apt update
apt install openssl
apt install ca-certificates

PARENT=$(hostname)
FILE_NAME=upnp-dashboard
USER=upnp-dashboard
GROUP=upnp-dashboard

openssl req \
-x509 \
-newkey rsa:4096 \
-sha256 \
-days 365 \
-nodes \
-keyout $FILE_NAME.key \
-out $FILE_NAME.crt \
-subj "/CN=${PARENT}" \
-extensions v3_ca \
-extensions v3_req \
-config <( \
  echo '[req]'; \
  echo 'default_bits= 4096'; \
  echo 'distinguished_name=req'; \
  echo 'x509_extension = v3_ca'; \
  echo 'req_extensions = v3_req'; \
  echo '[v3_req]'; \
  echo 'basicConstraints = CA:FALSE'; \
  echo 'keyUsage = nonRepudiation, digitalSignature, keyEncipherment'; \
  echo 'subjectAltName = @alt_names'; \
  echo '[ alt_names ]'; \
  echo "DNS.1 = www.${PARENT}"; \
  echo "DNS.2 = ${PARENT}"; \
  echo '[ v3_ca ]'; \
  echo 'subjectKeyIdentifier=hash'; \
  echo 'authorityKeyIdentifier=keyid:always,issuer'; \
  echo 'basicConstraints = critical, CA:TRUE, pathlen:0'; \
  echo 'keyUsage = critical, cRLSign, keyCertSign'; \
  echo 'extendedKeyUsage = serverAuth, clientAuth')

openssl x509 -noout -text -in $FILE_NAME.crt

cp --force --verbose ./$FILE_NAME.crt /usr/local/share/ca-certificates/

update-ca-certificates --verbose

chown $USER:$GROUP $FILE_NAME.crt $FILE_NAME.key
chmod 0444 $FILE_NAME.crt $FILE_NAME.key
#openssl pkcs12 -export -out $PARENT.pfx -inkey $PARENT.key -in $PARENT.crt