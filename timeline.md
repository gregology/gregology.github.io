---
title: Timeline
subtitle: A brief history of milestones from my life
layout: page
comments: True
licence: Creative Commons
description: "Major life events from 1983 to now, with a live counter showing how long I've been alive."
---

<div id='time-alive'> </div>

<script type = "text/javascript" > 
  var timeAlive = document.getElementById('time-alive');

  var dob = new Date("{{ site.author.dob }}");
  
  function calculateTimeAlive() {
      secondsAlive = (Date.now() - dob.valueOf())/1000;
      minutesAlive = (secondsAlive / 60).toFixed(0)
      hoursAlive = (secondsAlive / (60 * 60)).toFixed(2)
      daysAlive = (secondsAlive / (60 * 60 * 24)).toFixed(2)
      weeksAlive = (secondsAlive / (60 * 60 * 24 * 7)).toFixed(1)
      monthsAlive = (secondsAlive / (60 * 60 * 24 * (365.2425 / 12))).toFixed(1)
      yearsAlive = (secondsAlive / (60 * 60 * 24 * 365.2425)).toFixed(2)

      lifeExpectancySeconds = {{ site.author.life_expectancy_years }} * 365.2425 * 24 * 60 * 60
      secondsLeft = lifeExpectancySeconds - secondsAlive;
      minutesLeft = (secondsLeft / 60).toFixed(0)
      hoursLeft = (secondsLeft / (60 * 60)).toFixed(2)
      daysLeft = (secondsLeft / (60 * 60 * 24)).toFixed(1)
      weeksLeft = (secondsLeft / (60 * 60 * 24 * 7)).toFixed(1)
      monthsLeft = (secondsLeft / (60 * 60 * 24 * (365.2425 / 12))).toFixed(1)
      yearsLeft = (secondsLeft / (60 * 60 * 24 * 365.2425)).toFixed(2)

      lifePercentage = ((secondsAlive / lifeExpectancySeconds) * 100).toFixed(9)

      timeAlive.innerHTML = "<h3>Greg's Clock 🕔</h3>Greg is <b>" + lifePercentage + "%</b> through his expected life span<a href='{{ site.author.life_expectancy_source }}' target='_blank'>¹</a>.<br><table style='width:100%'><tr><th>Time</th><th>Seconds</th><th>Minutes</th><th>Hours</th><th>Days</th><th>Weeks</th><th>Months</th><th>Years</th></tr><tr><th>Spent</th><td>" + secondsAlive.toFixed(0) + "</td><td>" + minutesAlive + "</td><td>" + hoursAlive + "</td><td>" + daysAlive + "</td><td>" + weeksAlive + "</td><td>" + monthsAlive + "</td><td>" + yearsAlive + "</td></tr><tr><th>Left</th><td>" + secondsLeft.toFixed(0) + "</td><td>" + minutesLeft + "</td><td>" + hoursLeft + "</td><td>" + daysLeft + "</td><td>" + weeksLeft + "</td><td>" + monthsLeft + "</td><td>" + yearsLeft + "</td></tr></table>";
  }
  calculateTimeAlive();

  var cancel = setInterval(calculateTimeAlive, 50);
</script>


## 2021

### December

🐣 Diana and I became parents, Marisol Jasmine Lam Clarke was born at 2021-12-06 04:25EST (3.560Kg/49.5cm)

### July

🤰 We discovered the sex of our incoming little one

### May

🇨🇦 Became a Canadian citizen

### March

🥚 Diana became pregnant

### February

🔥 Burned out at work at took 2 months off. Invested my time meditating, playing social online games, and working out. Shopify was great support.

### January

🏠 Diana, Koala, Panda, and I moved full time to Prince Edward County near Belliville

## 2020

### September

🏠 Closed on my first property investment in line with my [de-urbanization predictions](/2019/09/musk-de-urbanization/)  
🐱 Adopted two of the kittens we were fostering, Koala and Panda. We found forever homes for all the other kitties too  

### August

🐱 We started fostering cats. We took in a momma cat, her 6 kittens, and then another kitten from a different litter  
🇮🇪 Became an Irish citizen  
🐱 Hercie passed away, we were told that he would only have a couple of days to live in late June but he gave us another month of cuddles  

### June

🐱 Jazz passed away, she was purring to the last moment

### May

🏠 Shopify went remote first so we put an offer on a place in the country

### March

🦠 Started working remotely

## 2019

### September

⛵️ Sold our boat because we weren't using her. We had 3 summers, 1 year long adventure, and thousands of great memories on her

### July

🛍 Put [Memair](https://memair.com) on the back burner and returned to Shopify as a Data Scientist

## 2018

### November

🧠 Incorporated my first company, [Memair](https://memair.com)

### September

🇨🇦 Arrived back in Ottawa after [a year sailing](https://www.youtube.com/channel/UCvxC2_BVnsAcaPEsIUcJx6A)  
🧠 Decided to work full time on [Memair](https://memair.com), previously a side project  

## 2017

### December

💏 Best man at Scott Mc's wedding

### September

⛵️ Left on [a year long sailing adventure](https://www.youtube.com/channel/UCvxC2_BVnsAcaPEsIUcJx6A) with Diana and our cats. We sailed from Canada to the Tropics and back  
🛍 Quit Shopify after 4 amazing years  

### May

⛵️ Bought my first boat with Diana

## 2016

### February

🇨🇦 Became a Canadian permanent resident

## 2015

### June

🏠 Moved in with Diana, Jazz😸, & Hercie😺 in Ottawa

## 2014

### September

🐣 Became an uncle to Sammy O'Connor

### August

🏠 Julie and I moved to the Golden Triangle in Ottawa

### June

🕉 Started teaching Acroyoga at Upward Dog Yoga Centre

## 2013

### November

👫 Started dating my fourth serious girlfriend, Diana Lam

### September

🛍 Ended my contract with Amnesty International Canada and started at Shopify  
🕉 Started my 200hr yoga teacher training  

### July

🕉 Trained as an Acroyoga instructor in Montreal

### March

😍 Met Diana Lam at an Acro workshop I was demoing at

## 2012

### December

🏠 Moved in with Julie in the ByWard Market, Ottawa. Julie was looking for a female roommate and I misread the Kijiji ad

### November

🇨🇦 With one weeks notice I left the Army and moved to Ottawa to work with the Canadian branch of Amnesty International  
🐣 Became an uncle to Archie O'Connor

### April

💔 Dhyana and I broke up  
🏠 Moved in with Scott, Chris, and PJ in St Leonards  

### February

🕯 Started work at Amnesty International Australia

## 2011

### December

🎓 Graduated from my Bachelor of Arts

### November

🕉 Discovered Acroyoga during a free class at Lululemon

### May

🏠 Moved in with Dhyana in Elizabeth Bay, Sydney

### April

🇦🇺 Returned to Australia from Afghanistan

### February

🇦🇫 Extended my tour and moved to Kandahar

## 2010

🐶 Molly was put down, we had attempted to rehouse her with the RSPCA but she failed one of their tests and by that time she was out of our custody and couldn't be saved

### November

🇦🇫 Deployed to Uruzgan Province of Afghanistan

### June

💂 Changed Army Units and moved on base at Randwick in preparation for deployment to Afghanistan

### May

👫 Started dating my third serious girlfriend, Dhyana Scarano

### March

💿 Started playing Ultimate with the Uni team and met Dhyana Scarano

## 2009

### May

🛵 Bought a 50cc scooter

### April

🇦🇺 Returned to Australia from the Solomon Islands  
🏠 Moved back in with Stu and Janell  

### March

🐣 Became an uncle to Zahli Sampson

### February

💔 Nathalie and I broke up, I wasn't ready to settle down yet

## 2008

### November

🇸🇧 Deployed to the Solomon Islands  
💏 Best man at my brother's wedding on Clark Island in Sydney Harbour  

### September

💂 Starting preparation for deployment to the Solomon Islands

### May

🏠 Moved back to Sydney to live with Stu and Janell. Perth was fun but I was studying by correspondence so I found it isolating

### February

🏠 Moved to Perth to live with Nathalie

### January

🐣 Became an uncle to Zander Sampson  
🎓 Started a Bachelor of Arts majoring in Terrorism, Counterterrorism, and Security through Open University. This course was by correspondence which worked well for with my vagrant lifestyle

## 2007

### December

🇦🇺 Returned to Australia from Europe surprising my family by dressing up as Stuart

### October

🇪🇺 Continued my travels starting with a road time through Ireland with Scott & Chris. Then trained around Europe

### July

🐣 Became an uncle to Oliver O'Connor (and loss my position as baby of the family)

### June

🇬🇧 Moved back to the UK after not having any luck finding work in Cahors (Nathalie travelled to Greece to teach english)  
🏢 With help from a second cousin, I had a job within 2 days at the Laurel Pub Company doing office work  

### April

🇫🇷 Quit my job as a postie and Nathalie and I left for an overseas trip. After a few days in London we trained to France and settled in Cahors

## 2006

### July?

🏠 Moved back in with my mum in Sydney  
📫 Became a postman on a motorbike to save up for my overseas trip  

### June

🎓 I was enjoying university but was getting restless after 2.5 years living in Newcastle so I decided to defer and travel

### April

👫 Nathalie came to visit me in Sydney and became my second serious girl friend

### March

⛵️ Sailed on the Young Endeavour and met Nathalie Cattaneo

## 2005

### February

🎓 Started studying a Bachelor of Arts / Bachelor of Science at Newcastle University  
🏠 Moved in to new place in Newcastle with two roommates (after some shuffling, Ashley a new friend from uni and Ginny)  

### January

💂 Did basic training with the Army

## 2004

🐈 Coco passed away after catching a tick

### November

🎓 Graduated from TAFE with a grade of 92.5  
🌏 Launched Gregology.net  

### July

💂 Joined the Australia Army Reserves as a signalman

### June

🏠 Moved in with a friend from TAFE, Lorena. This was my first time living out of home/not with family

### February

🎓 Quit Sydney Hi-Fi  
🏠 Moved in with my sister Sam & her partner Aaron in Newcastle  
🎓 Started studying a Tertiary Preparation course at Newcastle TAFE in order to go to university  

## 2003

🐶 Adopted our Bull Arab Molly

### November?

🏍 Bought a nicer bike 1989 GPX250 and gave my brother the GSX250

### March?

🏍 Bought a motorbike, 1983 GSX250

### February

🔊 Started working full time at Sydney Hi-Fi

## 2002

🐶 Lulu was put down, she was completely blind. I comforted her as the green liquid entered her body

### September

💔 Julia and I broke up, she ended it and I experienced my first broken heart

### June

🎓 Wasn't enjoying engineering so I dropped out of TAFE

### February

🎓 Started studying structural engineering at TAFE

### January

👫 Started dating my first serious girlfriend, Julia Stockdale

## 2001

### November

🎓 Graduated high school with HSC score of 51

### May?

🚙 Bought my first car, a 1983 Toyota Hilux with a 253 V8

## 2000

### November?

🏊 Started seasonal work at the Manly Water Works as a lifeguard

### July

🇦🇺 Returned to Australia

### January

🎓 Started 6th form at Harlington High School

## 1999

🐈 Adopted our brown cat Coco

### December

🇬🇧 Went to UK with my Mum to live with my Grandma for 7 months

### March?

🍻 First drink with Tim & Scott

## 1998

😘 First kiss with Jasmine Parker

## 1997

🎓 Moved to Forest High School because that's where Scott & Tim went  
🌏 Created my first website, Jokes Cafe on Tripod, reaching 600 hits per day at it's peak  
📧 Got my first email address, grules@hotmail.com  

## 1996

🐶 Floppy passed away from old age  
🎓 Started at Beacon Hill High School  
🇦🇺 Became an Australian citizen  
🌏 We got the Internet, I remember seeing chat for the first time and I didn't believe my brother that there were real people chatting  

## 1995

🎓 Graduated from primary school  
🐈 Abby passed away from cancer  

## 1993

🐶 Adopted our Staffordshire Bull Terrier Lulu

## 1991

🖥 Started programming in Basic with my Brother's and Dad's help

## 1990

🎒 Repeated year one, met Scott & Tim who would become life long friends

## 1989

🖥 Started using our family computer, an Amstrad CPC  
🐈 Adopted our tabby cat Abby  

### November

😕 Watched the fall of the Berlin Wall but thought they were knocking down the Great Wall of China

### January

🎒 Moved to a closer school, Beacon Hill Primary

## 1988

🐶 Adopted our Beagle Floppy

### June?

🏠 Moved to a house in Beacon Hill. This was the house I grew up in

### January

🎒 Started school at St Mary's in Manly

## 1987

🇬🇧 Went back to the UK with my Mum and Dad. They both had terrible food poisoning so my Auntie and Uncle looked after me. My Uncle was a police officer and he took me for a ride in his police car. I also wet the bed when I stayed with them.

## 1986

### April

🇦🇺 Immigrated to Australia

### March?

💭 First memory - My dog Tinker was laying on the couch, I was sitting opposite in her dog bed. My Dad entered and told her to get down, she bowed her head and sulkily obliged. We left Tinker in the UK when we immigrated.

## 1983

### May

🐣 Born into a loving family in London, United Kingdom as the fourth & final child of Alan and Hilary Clarke. I would remain the baby of this family for 24 years until my first nephew came along
