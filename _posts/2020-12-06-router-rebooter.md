---
title: "Automatically reboot router on lost Internet connection with Sonoff switch and Tasmota"
author: Greg
layout: post
permalink: /2020/12/router-rebooter/
date: 2020-12-06 18:12:48 -0500
comments: True
licence: Creative Commons
categories:
  - tech
tags:
  - home automation
  - tasmota
---

Bell Fibre Internet is awesome however the HomeHub 3000 router they provide is rubbish. Recently we were away from home when there was an internet outage requiring a router reboot fix. 

<p align="center">
  <img width="80%" height="80%" src="/wp-content/uploads/2020/12/have you tried turing it off and on again.jpg" alt="Have you tried turning it off and on again. IT Crowd" title="Have you tried turning it off and on again. IT Crowd">
</p>

Our home is smart so losing Internet while we're away caused a few problems;
 - The front door camera was not accessible so we couldn't check if packages had arrived
 - The thermostat was not accessible so we couldn't warm the house before we got home
 - The Plex server (self hosted Netflix) went down and I had to read a book
 - We couldn't run the vacuum cleaner prior to our arrival or drive it around the house to check for post storm damage

After a bit of research I decided on the [Watchdog for Wi-Fi router](https://tasmota.github.io/docs/Rules/#watchdog-for-wi-fi-router) approach with a few tweaks. I built a version of Tasmota with `USE_PING`, `USE_EXPRESSION`, & `SUPPORT_IF_STATEMENT` enabled. `USE_PING` allows me to write Tasmota Rules based on the response of network pings. `USE_EXPRESSION`, & `SUPPORT_IF_STATEMENT` were added in case more complex Rules were required later. For instance, adding the ability to ping multiple servers to check for network connection. I flashed a [Sonoff](https://www.itead.cc/smart-home/sonoff-wifi-wireless-switch.html) switch with [my build of Tasmota version 9.1.0](/wp-content/uploads/2020/12/tasmota-9.1.0-USE_PING-USE_EXPRESSION-SUPPORT_IF_STATEMENT.bin) using [Tasmotizer](https://github.com/tasmota/tasmotizer). Then connected the switch to my router's wifi network and in line power supply.

In the console;

Set the PowerOnState to 1 so that the router would turn on after a power outage

```
PowerOnState 1
```

Then added a rule which sends 8 pings to 1.1.1.1 every 120 minutes and if there are 0 successful responses, it powers off the router for 15 seconds, then powers it back on. I choose a 2 hour cadence because a 2 hour outage is fine for my use case and I didn't want to risk a reboot loop if 1.1.1.1 stopped responding to my pings.

```
Rule1
  ON Time#Minute|120 DO Ping8 1.1.1.1 ENDON
  ON Ping#1.1.1.1#Success==0 DO Backlog Power1 0; Delay 150; Power1 1; ENDON
```

Finally I enabled Rule 1.

```
Rule1 1
```

I'll try this approach out for a while and if reboots become too frequent I will use the `USE_EXPRESSION`, & `SUPPORT_IF_STATEMENT` to check multiple sites before initiating a reboot.
