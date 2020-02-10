---
title: Raspberry Pi Cheatsheet
layout: page
redirect_from:
  - /pi
---

## Add to boot partition

### Wifi

`wpa_supplicant.conf`

```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=CA

network={
    ssid="network"
    psk="password"
}
```

### SSH

`touch ssh`