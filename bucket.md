---
title: Bucket List
layout: page
comments: True
licence: Creative Commons
---

<div id='time-alive'> </div>

<script type = "text/javascript" > 
  var timeAlive = document.getElementById('time-alive');
  
  function calculateTimeAlive() {
      secondsAlive = (Date.now() - Date.UTC(1983,4,3,5,5))/1000;
      lifeExpectancySeconds = {{ site.author.life_expectancy_years }} * 365.26 * 24 * 60 * 60;
      secondsLeft = lifeExpectancySeconds - secondsAlive;
      lifePercentage = ((secondsAlive / lifeExpectancySeconds) * 100).toFixed(8)

      timeAlive.innerHTML = "Greg is approximately <b>" + lifePercentage + "%</b> through his expected life span<a href='{{ site.author.life_expectancy_source }}' target='_blank'>¹</a>";
  }
  calculateTimeAlive();

  var cancel = setInterval(calculateTimeAlive, 50);
</script>

## Experience

* ~~Start a company~~
* ~~Sail a tail ship~~
* Bungee Jump
* ~~Sky Diving~~
* ~~Fly a Plane~~
* Write a book
* Publish a paper
* ~~Create a patent~~
* ~~Learn a partner dance~~
* ~~Learn a musical instrument~~
* ~~Live in a megacity~~
* ~~Live in the country~~
* Learn another language
* ~~Catch a snake~~
* See in the wild
  * ~~Penguin~~
  * ~~Dolphin~~
  * ~~Bear~~
  * ~~Seal~~
  * Orca
  * Humpback
  * Moose
  * ~~Wolf or coyote~~
  * Koala
  * ~~Beaver~~
  * Big cat
* ~~Be a mentor~~
* ~~Fly in a hot air balloon~~
* Public speak in front of;
  * ~~100 people~~
  * 1000 people
  * 10000 people
* Act in a Bollywood movie
* ~~Become a parent~~
* Go on a meditation retreat
* Lead a team of;
  * 10 people
  * 100 people
* Get elected to a government position
* Have lived an extraordinary life


## Travel

* Sail an ocean crossing
* Sail Northern Canada
* ~~Big sailing adventure~~
* Visit every major continent
  * ~~Eurasia~~
  * ~~Australia~~
  * ~~North America~~
  * ~~Arabia~~
  * Africa
  * ~~South America~~
  * India
  * Antarctica
* Experience Northern or Southern Lights
* ~~Visit an igloo~~
* Trans-Siberian Express or Trans-Canadian train trip
* Explore Northern Canada
* Visit [Miniatur Wunderland](https://www.miniatur-wunderland.com/)
* Visit [The Tank Museum](https://www.tankmuseum.org)
* See the sun rise and set on every ocean
  * ~~Pacific rise~~
  * ~~Pacific set~~
  * ~~Atlantic rise~~
  * ~~Atlantic set~~
  * Indian rise
  * ~~Indian set~~
  * Arctic rise
  * Arctic set


## Physical

* Consistent handstand
* ~~Flat footed squat~~
* ~~sub 10min 2.4km~~
* Climb a mountain
* Become an acrobat
  * Solidly base these poses
    * ~~Bird~~
    * ~~Star~~
    * ~~Foot to hand~~
    * ~~Hand to hand~~
    * ~~Needle~~
    * ~~Standing hand to hand~~
    * ~~Inlocate to standing hand to hand~~
    * Press to high foot to hand
    * Inlocate to standing hand to hand with Diana
    * Mono needle
  * Solidly fly these poses
    * ~~Bird~~
    * ~~Star~~
    * ~~Foot to hand~~
    * ~~Hand to hand~~
    * ~~Needle~~
    * ~~Standing hand to hand~~


## Futurism

* Go into space
* Watch humans step on the Moon
* Watch humans step on Mars
* Communicate with extraterrestrial intelligence
* See a revived extinct species
