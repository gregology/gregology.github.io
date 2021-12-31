---
title: Decimal prime numbers
decription: List of prime numbers in decimal from 0 to 1 million
layout: page
---

List of prime numbers in decimal from 0 to 1 million

<style>
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@100&display=swap');
</style>

<p style="font-family:monospace">
  <script>
    (function(n){
    var primes=[2];
      for (var i=2;primes.length<n;i++){
        var prime=true;
        var rootI=Math.sqrt(i)+1;
        for (var j=2;j<rootI;j++){
            if (i%j==0) {prime=false;break;}
        };
        if (prime) primes.push(i);
        if (i >= 1000000) { break; };
      }
      document.write(primes.join('<br>\n'));
    })(100000)
  </script>
</p>