---
title: "Raspberry Pi Time Machine (2019 update)"
author: Greg
layout: post
permalink: /2018/09/raspberry-pi-time-machine/
date: 2018-09-03 04:51:05 -0400
comments: True
licence: Creative Commons
categories:
  - Tech
  - Tutorial
tags:
  - raspberry pi
  - mac
  - MacOS
  - OSx
  - Time Machine
---

***2019-01-02 Updated after comments from Guy. Please comment below if you have any new issues***

## Prerequisites

* Raspberry Pi (tested with a Raspberry Pi 2 Model B)
* Micro SD card (2GB+)
* USB Hard Drive

## Setup Pi with Raspbian

Install [Raspbian Buster Lite](https://www.raspberrypi.org/downloads/raspbian/) on the SD card. Follow the instructions on the [Installing images](https://www.raspberrypi.org/documentation/installation/installing-images/README.md) tutorial on the Raspberry Pi site. Then [enable SSH](https://www.raspberrypi.org/documentation/remote-access/ssh/). Insert the SD card into the Pi, plug in the USB hard drive, plug in a network cable, and power on the Pi.

Next set a static IP address for your Raspberry Pi. Depending on your setup, you can either set the Pi to have a [manual ip address](https://www.raspberrypi.org/learning/networking-lessons/rpi-static-ip-address/) or have your router assign a static IP address.

Login to your Pi via [SSH](https://www.raspberrypi.org/documentation/remote-access/ssh/) or old school with a keyboard & monitor. Run raspi-config to make any changes you want like changing hostname etc.

`pi@timemachine:~ $ sudo raspi-config`

And update your Pi

`pi@timemachine:~ $ sudo apt-get update && sudo apt-get upgrade -y`

## Setup USB Hard drive

Install hfsutils & hfsprogs

`pi@timemachine:~ $ sudo apt-get install hfsutils hfsprogs`

Format USB hard drive to hfsplus. This will erase all data on the USB hard drive.

*Note: this assumes your USB hard drive is sda2*

`pi@timemachine:~ $ sudo mkfs.hfsplus /dev/sda2 -v timemachine`

Create mount point

`pi@timemachine:~ $ sudo mkdir /media/tm && sudo chmod -R 777 /media/tm`

Determine the UUID of your USB hard drive (sda2)

`pi@timemachine:~ $ ls -lha /dev/disk/by-uuid`

```
pi@timemachine:~ $ ls -lha /dev/disk/by-uuid
total 0
drwxr-xr-x 2 root root 120 Sep  3 00:17 .
drwxr-xr-x 8 root root 160 Sep  3 00:17 ..
lrwxrwxrwx 1 root root  15 Sep  3 00:13 3725-1C05 -> ../../mmcblk0p1
lrwxrwxrwx 1 root root  10 Sep  3 00:17 6525d832-1a97-35a5-92a4-345253fcfd00 -> ../../sda2
lrwxrwxrwx 1 root root  10 Sep  3 00:17 67E3-17ED -> ../../sda1
lrwxrwxrwx 1 root root  15 Sep  3 00:13 fd695ef5-f047-44bd-b159-2a78c53af20a -> ../../mmcblk0p2
```

In my case the UUID is *6525d832-1a97-35a5-92a4-345253fcfd001*.

Edit fstab to mount the USB hard drive

`pi@timemachine:~ $ sudo nano /etc/fstab`

and append this line (replacing 6525d832-1a97-35a5-92a4-345253fcfd00 with your specific UUID determined above).

`UUID=6525d832-1a97-35a5-92a4-345253fcfd00 /media/tm hfsplus force,rw,user,noauto 0       0 `

It should end up looking something like this

```
proc                                      /proc     proc    defaults             0       0
PARTUUID=d159f393-01                      /boot     vfat    defaults             0       2
PARTUUID=d159f393-02                      /         ext4    defaults,noatime     0       1
UUID=6525d832-1a97-35a5-92a4-345253fcfd00 /media/tm hfsplus force,rw,user,noauto 0       0
```

Test that mounting works as expected

`pi@timemachine:~ $ sudo mount  /media/tm`

```
pi@timemachine:~ $ df -h
Filesystem      Size  Used Avail Use% Mounted on
/dev/root        15G  1.4G   13G  10% /
devtmpfs        484M     0  484M   0% /dev
tmpfs           489M     0  489M   0% /dev/shm
tmpfs           489M   13M  476M   3% /run
tmpfs           5.0M  8.0K  5.0M   1% /run/lock
tmpfs           489M     0  489M   0% /sys/fs/cgroup
/dev/mmcblk0p1   43M   22M   21M  51% /boot
/dev/sda2       699G  300M  668G  0% /media/tm
tmpfs            98M     0   98M   0% /run/user/1000
```

should show a line like `/dev/sda2       699G  300M  668G  0% /media/tm`

*Note: we are not automatically mounting this USB hard drive as mounting USB on startup can be flakey*

## Install Netatalk

Install prerequisites

`pi@timemachine:~ $ sudo apt-get install netatalk -y`

and ensure everything worked

```
pi@timemachine:~ $ netatalk -V
netatalk 3.1.12 - Netatalk AFP server service controller daemon

This program is free software; you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation; either version 2 of the License, or (at your option) any later
version. Please see the file COPYING for further information and details.

netatalk has been compiled with support for these features:

      Zeroconf support:
Avahi
     Spotlight support:
Yes

                  afpd:
/usr/sbin/afpd
            cnid_metad:
/usr/sbin/cnid_metad
       tracker manager:
/usr/bin/tracker daemon
           dbus-daemon:
/usr/bin/dbus-daemon
              afp.conf:
/etc/netatalk/afp.conf
     dbus-session.conf:
/etc/netatalk/dbus-session.conf
    netatalk lock file:
/var/lock/netatalk
```

## Configure Netatalk

Edit nsswitch.conf

`pi@timemachine:~ $ sudo nano /etc/nsswitch.conf`

append mdns4 and mdns to the line that starts with hosts. It should end up looking something like this.

```
# /etc/nsswitch.conf
#
# Example configuration of GNU Name Service Switch functionality.
# If you have the `glibc-doc-reference' and `info' packages installed, try:
# `info libc "Name Service Switch"' for information about this file.

passwd:         compat
group:          compat
shadow:         compat
gshadow:        files

hosts:          files mdns4_minimal [NOTFOUND=return] dns mdns4 mdns
networks:       files

protocols:      db files
services:       db files
ethers:         db files
rpc:            db files

netgroup:       nis
```

Finally edit afp.conf

`pi@timemachine:~ $ sudo nano /etc/netatalk/afp.conf`

and append

```
[Global]
  mimic model = TimeCapsule6,106

[Time Machine]
  path = /media/tm
  time machine = yes
```

Launch the two services

`pi@timemachine:~ $ sudo service avahi-daemon start`

`pi@timemachine:~ $ sudo service netatalk start`

## Mount and start services on boot

Edit crontab

`pi@timemachine:~ $ sudo crontab -e`

and append

`@reboot sleep 30 && mount /media/tm && sleep 10 && service avahi-daemon start && service netatalk start`

*Note: this will delay mounting the for 30 seconds giving the USB hard drive time to spin up. It will then start the avahi-daemon & netatalk services. That way the services won't start until the USB hard drive has been mounted.*

## Connect to Time Machine

Connect to server

![Connect to Server](/wp-content/uploads/2018/09/raspberry-pi-time-machine-connect-to-server.png "Connect to Server"){:height="90%" width="90%"}

Login creds will be the same as your ssh creds on the pi

*Note: default creds username: pi & password: raspberry*

Open the Time Machine settings and you should see your new network time machine server

![Open Time Machine](/wp-content/uploads/2018/09/raspberry-pi-time-machine-time-machine.png "Time Machine"){:height="90%" width="90%"}

References: this is an updated version of a [How to Geek](https://www.howtogeek.com/276468/how-to-use-a-raspberry-pi-as-a-networked-time-machine-drive-for-your-mac/) article with some tweaks for flaky USB hard drives and updates for the latest packages.
