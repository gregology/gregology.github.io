---
title: Raspberry Pi Cheatsheet
layout: page
description: "Quick reference for Raspberry Pi setup. Wifi config, SSH, static IP, and common commands."
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