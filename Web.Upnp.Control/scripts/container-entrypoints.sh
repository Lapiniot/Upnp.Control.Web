#!/usr/bin/env bash

if [[ ! -f config/upnp-dashboard.pfx ]]; then
    cd config
    ../scripts/cert-gen.sh crupnppw
    cd ..
fi

if [[ -f config/upnp-dashboard.pfx && ! -f config/appsettings.Production.Https.json ]]; then
    cp .appsettings.Production.Https.json config/appsettings.Production.Https.json
fi

export ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_Kestrel__Certificates__Default__Path=config/upnp-dashboard.pfx \
    ASPNETCORE_Kestrel__Certificates__Default__Password=crupnppw

exec ./Web.Upnp.Control