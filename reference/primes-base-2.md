---
title: First 2¹⁶ prime numbers in base 2
decription: List of prime numbers in binary from 0 to 2¹⁶
layout: page
redirect_from:
  - reference/primes/
  - reference/primes
---

List of prime numbers in binary from 0 to 2¹⁶. I was searching for this and couldn't find it.
  
<style>
  @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@100&display=swap');
</style>

<script>
  function dec2bin(dec) {
    return (dec >>> 0).toString(2);
  }
</script>

<script>
  const zeroPad = (num, places) => String(num).padStart(places, '0');
</script>

<p style="font-family:monospace">
  <script>
    (function(n){
    var primes=['0000000000000010'];
      for (var i=2;primes.length<n;i++){
        var prime=true;
        var rootI=Math.sqrt(i)+1;
        for (var j=2;j<rootI;j++){
            if (i%j==0) {prime=false;break;}
        };
        if (prime) primes.push(zeroPad(dec2bin(i), 16));
        if (i >= Math.pow(2, 16)) { break; };
      }
      document.write(primes.join('<br>\n'));
    })(Math.pow(2, 16))
  </script>
</p>
