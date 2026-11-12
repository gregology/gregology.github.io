// Swaps the YouTube thumbnails from _includes/youtube_player.html for YouTube's player when one is
// clicked, so the player's scripts load only for someone watching. A click with a modifier key, or a
// middle click, is left alone, so it still opens the video on YouTube in a new tab.
(function () {
  'use strict';

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[data-youtube-id]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();

    var player = document.createElement('iframe');
    player.src = 'https://www.youtube.com/embed/' + encodeURIComponent(link.getAttribute('data-youtube-id')) + '?autoplay=1';
    player.title = 'YouTube video player';
    player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    player.allowFullscreen = true;
    player.setAttribute('frameborder', '0');
    link.parentNode.replaceChild(player, link);
    // Keyboard users carry on in the player rather than losing their place
    player.focus();
  });
})();
