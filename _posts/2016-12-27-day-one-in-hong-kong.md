---
title: Day one in Hong Kong
author: Greg
layout: post
permalink: /2016/12/day-one-in-hong-kong/
comments: True
categories:
  - Travel
tags:
  - Travel
  - Asia
  - Hong Kong
licence: Creative Commons
images:
  - image_path: /wp-content/uploads/2016/12/Beautiful Sunrise.jpg
    caption: We were welcomed at 6am with a beautiful Sunrise over Hong Kong Harbour
  - image_path: /wp-content/uploads/2016/12/Wonderful Views.jpg
    caption: We brunched on the peak then took in the view
  - image_path: /wp-content/uploads/2016/12/Dog Friendly.jpg
    caption: I'm finding Hong Kong is a very dog friendly place
  - image_path: /wp-content/uploads/2016/12/Cat Friendly.jpg
    caption: and cat friendly even to unfriendly looking cats
  - image_path: /wp-content/uploads/2016/12/A bit of Acro.jpg
    caption: We did a bit of acro
  - image_path: /wp-content/uploads/2016/12/Lots of Turtles.jpg
    caption: for an unimpressed audience of turtles
  - image_path: /wp-content/uploads/2016/12/Old Cameras.jpg
    caption: This 1800s cameras would not be effective at capturing licence plates of moving vehicles
  - image_path: /wp-content/uploads/2016/12/Pedestrian Traffic Control.jpg
    caption: Hong Kong has effective pedestrian traffic control which has created a intelligent hive mind
  - image_path: /wp-content/uploads/2016/12/Banboo Scaffolding.jpg
    caption: Banboo Scaffolding concerns me because Pandas
  - image_path: /wp-content/uploads/2016/12/Live things prepared while you wait.jpg
    caption: Live things prepared while you wait
  - image_path: /wp-content/uploads/2016/12/Walk on Left, Stand on Right.jpg
    caption: Hong Kong drives on the left, walks on the left, but stands on the right on escalators
  - image_path: /wp-content/uploads/2016/12/Positive Graffiti.jpg
    caption: We found Positive Graffiti
  - image_path: /wp-content/uploads/2016/12/Mosaics Graffiti.jpg
    caption: Mosaics Graffiti
  - image_path: /wp-content/uploads/2016/12/Knitting Graffiti.jpg
    caption: Knitting Graffiti
  - image_path: /wp-content/uploads/2016/12/More Knitting Graffiti.jpg
    caption: and more Knitting Graffiti
  - image_path: /wp-content/uploads/2016/12/Lots of Teslas.jpg
    caption: Fuel is expensive and Teslas are common
  - image_path: /wp-content/uploads/2016/12/Beautiful Sunsets.jpg
    caption: Finishing the day with a beautiful Sunset over Hong Kong Harbour
  - image_path: /wp-content/uploads/2016/12/Beautiful Lightrise.jpg
    caption: And as the sun fades the LEDs rise creating a beautiful Lightrise over Hong Kong Harbour
  - image_path: /wp-content/uploads/2016/12/Where we went.png
    caption: What we've explored so far
---

After 12 hours in Hong Kong the jet lag has settled in. We gently enjoyed some amazing seafood caught in a bucket down the road and prepared by Diana's mum. Diana has a network of hospitable family here and I quickly feel at home. The incredible human density of the city is offset by deserted islands and green.

{% for image in page.images %}
  <p>
    <img src="{{ image.image_path }}" alt="{{ image.caption}}"/>
    {{ image.caption}}
  </p>
{% endfor %}
