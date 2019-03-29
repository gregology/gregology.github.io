---
title: "Personal VPN"
author: Greg
layout: post
permalink: /2019/03/vpn/
date: 2019-03-29 16:12:44 -0400
comments: True
licence: Creative Commons
categories:
  - Tech
  - Tutorial
tags:
  - tech
  - vpn
---

Russia has recently threatened to block popular VPN services unless they join a state IT system that contains a registry of banned websites[¹](https://www.themoscowtimes.com/2019/03/29/russia-threatens-to-block-popular-vpn-services-to-prevent-website-access-a65007). In response, here is a quick tutorial on how to setup a personal VPN for $1 a month. Personal VPNs have advantages over shared VPN services because they are harder to block & you do not share an ip address with possible nefarious users so you get less annoying "Are you a robot" questions.

Prerequisites: comfortable in shell (feel free to reach out in the comments below if you have any issues)

### 1) Setup a Virtual Private Server

There are a few providers that offer $1 Virtual Private Servers. I chose [FDC Servers](https://fdcservers.net) (no affiliation) because they offered european locations. You don't get much for $1 but we're just creating a glorified web router so 1990's specs are fine. Once I signed up I was provisioned a VPS running Ubuntu with 5Mbps unmetered connection, 128MB RAM, 10GB SSD, 1 external IP, & 1 CPU Core. It took a couple of hours for the box to get spun up.

```
greg ~ $ssh root@198.16.x.x
root@198.16.x.x's password: 
Welcome to Ubuntu 12.04.5 LTS (GNU/Linux 3.2.0-74-generic x86_64)

 * Documentation:  https://help.ubuntu.com/

  System information as of Fri Mar 29 15:16:55 CDT 2019

  System load:  0.06              Processes:           70
  Usage of /:   13.5% of 8.86GB   Users logged in:     0
  Memory usage: 52%               IP address for eth0: 198.16.x.x
  Swap usage:   0%                IP address for tun0: 10.8.0.1

  Graph this data and manage this system at:
    https://landscape.canonical.com/

New release '14.04.1 LTS' available.
Run 'do-release-upgrade' to upgrade to it.

Last login: Fri Mar 29 15:15:49 2019 from 204.101.x.x
root@118456:~# uptime
 15:16:57 up 0 min,  1 user,  load average: 0.06, 0.01, 0.01
root@118456:~# free -m
             total       used       free     shared    buffers     cached
Mem:           112        102          9          0         31         29
-/+ buffers/cache:         41         70
Swap:         1023          9       1014
```

Because of the incredibly low specs, the server was provisioned with Ubuntu 12.04.5 LTS. It's not ideal to run a end of life cycle version of Ubuntu but for $1 & my purposes, it's ok.

For some reason the server didn't have it's DNS name servers set. So I added them to network interfaces;

Edit `/etc/network/interfaces` with

`sudo nano /etc/network/interfaces`

and append `dns-nameservers 8.8.8.8 8.8.4.4` to the bottom of the eth0 entry.

Then I was able to run an update (this may take a while).

`sudo apt-get update && sudo apt-get upgrade -y`

### 2) Setup OpenVPN server

[Nyr](https://github.com/Nyr/openvpn-install) has created an awesome script that takes care of all the hard work of configuration for OpenVPN. All we have to do is run this command and answer some questions.

`wget https://git.io/vpn -O openvpn-install.sh && bash openvpn-install.sh`

To make it more difficult to block access to our new VPN we will leave the hostname blank. Instead we will connect via an ip address so that our VPN can't be blocked at the DNS level. We will also choose the TCP on port 443. https uses TCP on 443 making it hard to distinguish your traffic from regular web traffic.

```
Welcome to this OpenVPN "road warrior" installer!

I need to ask you a few questions before starting the setup.
You can leave the default options and just press enter if you are ok with them.

First, provide the IPv4 address of the network interface you want OpenVPN
listening to.
IP address: 198.16.x.x

This server is behind NAT. What is the public IPv4 address or hostname?
Public IP address / hostname: 

Which protocol do you want for OpenVPN connections?
   1) UDP (recommended)
   2) TCP
Protocol [1-2]: 2

What port do you want OpenVPN listening to?
Port: 443

Which DNS do you want to use with the VPN?
   1) Current system resolvers
   2) 1.1.1.1
   3) Google
   4) OpenDNS
   5) Verisign
DNS [1-5]: 1

Finally, tell me your name for the client certificate.
Please, use one word only, no special characters.
Client name: client

Okay, that was all I needed. We are ready to set up your OpenVPN server now.
Press any key to continue...
```

The script will do some magic and create a file called `client.ovpn` (or whatever you choose as your client name).


#### Optional

You can run the bash script again to create more ovpn config files for other users or devices.

`bash openvpn-install.sh`

```
Looks like OpenVPN is already installed.

What do you want to do?
   1) Add a new user
   2) Revoke an existing user
   3) Remove OpenVPN
   4) Exit
Select an option [1-4]: 

```

### 3) Setup OpenVPN client

copy `client.ovpn` to your local machine. An easy way to do that is to use the cat command to output the contents of the file and then copy and paste it to a local version.

```
root@118456:~# cat client.ovpn 
client
dev tun
proto tcp
sndbuf 0
rcvbuf 0
remote 198.16.x.x 443
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
auth SHA512
cipher AES-256-CBC
setenv opt block-outside-dns
key-direction 1
verb 3
<ca>
-----BEGIN CERTIFICATE-----
FOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO=
-----END CERTIFICATE-----
</ca>
<cert>
-----BEGIN CERTIFICATE-----
BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAR=
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZ=
-----END PRIVATE KEY-----
</key>
<tls-auth>
-----BEGIN OpenVPN Static key V1-----
01234567890abcdef0123456789abcde
01234567890abcdef0123456789abcde
01234567890abcdef0123456789abcde
01234567890abcdef0123456789abcde
01234567890abcdef0123456789abcde
01234567890abcdef0123456789abcde
01234567890abcdef0123456789abcde
01234567890abcdef0123456789abcde
01234567890abcdef0123456789abcde
01234567890abcdef0123456789abcde
01234567890abcdef0123456789abcde
01234567890abcdef0123456789abcde
01234567890abcdef0123456789abcde
01234567890abcdef0123456789abcde
-----END OpenVPN Static key V1-----
</tls-auth>
```

Install an OpenVPN client on your [Mac](https://tunnelbrick.net), Android, Windows, or iOS device and add the `client.ovpn` file.

### 4) Browse freely!

You can ensure you're safely connected to your VPN by visiting [iplocation.net](https://iplocation.net) or running `$ curl ip.gho.st` from your local terminal (it should show the ip address of your VPN server).
