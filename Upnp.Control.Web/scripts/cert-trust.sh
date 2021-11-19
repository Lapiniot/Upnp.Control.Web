#!/usr/bin/env bash

FILE=${1:-'./upnp-dashboard.crt'}

# Debian based Linux distros
if [ -x "$(command -v dpkg)" ]; then
    (command -v update-ca-certificates >/dev/null 2>&1 || sudo apt install ca-certificates) &&
    sudo cp -v $FILE /usr/local/share/ca-certificates/ &&
    sudo update-ca-certificates -v &&
    echo -e "\033[32mSuccesfully installed certificates to the trusted store\033[0m" &&
    exit 0

    echo -e "\033[31mError adding certificate to the trusted store\033[0m"
    exit 1
fi

# MacOS
if [ -x "$(command -v security)" ]; then
    sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain $FILE &&
    echo -e "\033[32mSuccesfully installed certificates to the trusted store\033[0m" &&
    exit 0

    echo -e "\033[31mError adding certificate to the trusted store\033[0m"
    exit 1
fi

echo -e "\033[31mError adding to the trusted certificates: \nUnknown OS distro, check documentation how to add trusted certificates on your system\033[0m"

exit 1