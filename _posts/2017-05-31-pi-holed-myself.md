---
title: Pi-holed Myself
author: Greg
layout: post
permalink: /2017/05/pi-holed-myself/
comments: True
categories:
  - Tech
tags:
  - Tech
  - Youtube
  - Pi-hole
  - Machine Learning
  - AI
  - Raspberry Pi
licence: Creative Commons
---

[Pi-hole](https://pi-hole.net/) is an awesome DNS server. Pi because it was designed to run on a [Raspberry Pi](https://www.raspberrypi.org/) and hole because that's where advertisements DNS requests end up. Ad-blocking at the DNS level means that every device on my network is free from the majority of pesky ads, even mobile apps.

  ISP DNS (ads)            | Pi-hole DNS (no ads)
:-------------------------:|:-------------------------:
![An app showing ads](/wp-content/uploads/2017/05/2017-05-31 20.54.23.png "App with Ads") | ![An app not showing ads](/wp-content/uploads/2017/05/2017-05-31 20.54.56.png "App without Ads")


Another advantage of DNS level blocking is that the data for the advertisement is never actually sent to the device, which dramatically speeds up web browsing. This becomes obvious when reading ad heavy news articles on mobile devices.

As a side note, I find it easy to morally defend ad-blocking. Advertising is a socially acceptable form of [psychological manipulation](https://en.wikipedia.org/wiki/Media_manipulation#Advertising). I appreciate that I benefit from advertising as it funds many things I enjoy like YouTube. However I contribute directly to content creators via [Patreon](https://www.patreon.com/) and I have the right and a duty to defend myself from propaganda.

Pi-hole is the DNS server for my home network as well as my VPN so I can pi-hole on the go. Things were going great, I was enjoying a faster and less annoying web experience... until I noticed something strange with YouTube's recommendations. Every time I visited YouTube, it would recommend me the same videos, even after I had watched them. After a couple of weeks cursing YouTube, I discovered the problem. Pi-hole was eating requests to `s.youtube.com` which was feeding YouTube's recommendation engine by tracking my viewing habits. `s.youtube.com` was quickly whitelisted and YouTube returned to normal.

I wrote this article incase anyone else was having this issue with YouTube/Pi-hole and to highlight some of the rare benefits of online tracking.
