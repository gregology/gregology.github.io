---
title: "Trust & deepfakes"
author: Greg
layout: post
permalink: /2022/03/trust/
date: 2022-03-24 10:00:00 -0400
comments: True
licence: Creative Commons
categories:
  - tech
tags:
  - deepfakes
  - GPG
  - PGP
---

Information without trust is worthless.

Deepfakes are easy to produce and increasingly difficult to identify. Innocuous examples like [@deeptomcruise](https://www.tiktok.com/@deeptomcruise) on TikTok demonstrate how far the technology has come.


<p align="center">
  <video muted autoplay controls loop width="75%" height="75%" >
      <source src="/wp-content/uploads/2022/03/tomcruise_deepfake.mp4" type="video/mp4" sha512="1c08bddee54b92f3e13d2c7ec143c9cc3706f1a4e43e9e5176e93f43d46d2c504d051b0a3b81d61b3113c8ffa0b97b3ec36cec15a56d04f2610f613b88a60369">
  </video>
</p>
This is not Tom Cruise.

A poorly implemented however far more dangerous example was the recent deepfake of Ukrainian President Zelensky.

<p align="center">
  <video muted autoplay controls loop width="75%" height="75%" >
      <source src="/wp-content/uploads/2022/03/zelensky_deepfake.mp4" type="video/mp4" sha512="83e64bd0d4d0e58af2e0ca4adbbda75efcfe3b1cca01a65891a405e897d6d33bcab1858019d6b2a873a84b61f79b9e5ca79113777873b807384414a920a73960">
  </video>
</p>

Tools for creating deepfakes are easily available. Anyone with $15USD and a video of their target can produce realistic deepfakes using [paid services](https://deepfakesweb.com/).

Platforms like Twitter have used a verification mechanism to ensure content comes from legitimate sources. However the [2020 hacking of multiple verified Twitter accounts](https://www.reuters.com/article/us-twitter-cyber-idUSKCN24G32Q) demonstrates the vulnerability of relying on a platform for verification.

Social media platforms have also proven themselves unable or unwilling to stop misinformation. [Misinformation is profitable](https://www.reuters.com/technology/facebook-whistleblower-reveals-identity-ahead-senate-hearing-2021-10-03/). Trust needs to be independent of platforms. 

Tools exist to solve the problem of trust on the Internet. Public-key cryptography is a mathematically complex but conceptually simple system to authenticate content. With public-key cryptography the content producer has two keys, a private-key and public-key. The private-key should be known only by the content producer. The public-key, as the name implies, can be shared freely.

A message, such as a social media post, can be signed using the private-key and verified by anyone holding the associated public-key. The message can be trusted as originating from the owner of the private-key (as long as the private-key remains private and there are no other vulnerabilities in the particular public-key cryptography implementation).

Deepfakes and legitimate looking misinformation will continue to become more convincing. Self verification needs to be implemented by politicians, government agencies, NGOs, news media, and any other entity with important trusted information to share.

My tweets, Reddit posts, and blog posts are now all self verified. Technical implementation below.

[The GNU Privacy Guard (GPG)](https://www.gnupg.org/) is a complete and free implementation of the OpenPGP standard as defined by [RFC4880](https://www.ietf.org/rfc/rfc4880.txt). My content is signed using GPG. My public-key is stored on [my website](/secure/) which is cached by Google & wayback machine. My public-key is also stored on a blockchain [gregology.crypto](https://gregology.crypto/) ([requires browser extension](https://unstoppabledomains.com/extension)) so that an immutable record of my public-key exists. 

Twitter has a 280 character limit. An OpenPGP signature stored as text would require a minimum of 4 tweets. Instead I store my tweet signatures as a QR code and attach them as an image. Here is a script I use to create QR signatures of messages.

```bash
#!/bin/bash
# Generate QR code signature
# Installation: brew install qrencode
# Usage: $ qr_sign "my message to sign"

echo $1 | gpg --clear-sign > msg.asc

qrencode -s 6 -l H -o "qr_signature.png" < msg.asc
open qr_signature.png

rm msg.asc
sleep 3
rm qr_signature.png
```

On Reddit I post my OpenPGP signature as a comment. This is a script I use to extract the content of my post, sign the content, and format a code block.

```bash
#!/bin/bash
# Sign Reddit post
# Installation: brew install jq
# Usage: $ sign https://www.reddit.com/r/byok/comments/t2r9lg/public_key/

curl -A "r/byok post signing" -s $1.json |  jq -r '.[0].data.children[0].data | .title, .selftext, .author, .permalink' >| post.txt

echo $1

gpg --clear-sign -a post.txt

cat post.txt.asc | while read line; do echo "    $line"; done
echo 'Find my public key as a pinned post on my profile.'
echo ''
echo 'See the Bring Your Own Key sub to sign your own post r/byok'

rm post.txt
rm post.txt.asc
```

My website runs on Jekyll served on GitHub Pages. All of my posts are signed and include instructions to verify content. In fact, my site won't compile if any posts are missing an associated signature. This is the script I use to generate the signatures.

```bash
#!/bin/bash
# Signs all posts

for file in _posts/*.md
do
  if [ -f "$file.asc" ]; then
    echo "$file is already signed"
  else
    echo "signing $file"
    gpg --clear-sign -a "$file"
  fi
done
```

and the associated [_includes/signature.html](https://github.com/gregology/gregology.github.io/blob/master/_includes/signature.html).
