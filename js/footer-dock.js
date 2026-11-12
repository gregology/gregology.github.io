// Magnifies the footer's social icons under the mouse, like the macOS Dock: the icon under the
// pointer grows most, its neighbours less, and the row spreads apart so they never overlap.
// Keyboard focus magnifies the focused icon the same way.
(function () {
  'use strict';

  var MAX_SCALE = 1.75;  // the icon right under the pointer
  var REACH = 3;         // how many icon widths to each side the magnification fades out over

  var list = document.querySelector('footer .footer-links');
  if (!list || !list.children.length) return;
  var icons = Array.prototype.slice.call(list.children);

  // Mice and trackpads only, and nothing for anyone who has asked for less motion
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var pointer = null;   // where the mouse is, relative to the list, while it's over the footer
  var docked = false;   // whether the mouse has come onto the icons and not yet left them
  var focused = null;   // the icon with keyboard focus
  var frame = 0;

  function reset() {
    icons.forEach(function (icon) {
      icon.style.transform = '';
    });
  }

  // 1 for an icon that's too far away, rising smoothly to MAX_SCALE right under the pointer
  function scaleAt(distance, width) {
    var reach = REACH * width;
    if (distance >= reach) return 1;
    return 1 + (MAX_SCALE - 1) * (1 + Math.cos(Math.PI * distance / reach)) / 2;
  }

  function magnify() {
    frame = 0;
    // offsetLeft and offsetTop ignore transforms, so these are where the icons sit at rest
    var top = icons[0].offsetTop;
    var width = icons[0].offsetWidth;
    var height = icons[0].offsetHeight;
    var oneRow = icons.every(function (icon) { return icon.offsetTop === top; });
    if (!oneRow || !canHover.matches || reduceMotion.matches) {
      // A wrapped second row would grow up into the first, so only a single row magnifies
      docked = false;
      reset();
      return;
    }

    var left = icons[0].offsetLeft;
    var right = icons[icons.length - 1].offsetLeft + width;
    var lift = (MAX_SCALE - 1) * height;
    var centre = null;
    if (pointer) {
      // Start when the pointer reaches the icons, then keep going while it's anywhere over the
      // magnified row, including the space above it that the bigger icons now fill
      var onIcons = pointer.x >= left && pointer.x <= right && pointer.y >= top && pointer.y <= top + height;
      var nearIcons = pointer.x >= left - width && pointer.x <= right + width &&
        pointer.y >= top - lift && pointer.y <= top + height;
      docked = onIcons || (docked && nearIcons);
      if (docked) centre = pointer.x;
    }
    if (centre === null && focused) centre = focused.offsetLeft + width / 2;
    if (centre === null) {
      reset();
      return;
    }

    var scales = icons.map(function (icon) {
      return scaleAt(Math.abs(icon.offsetLeft + width / 2 - centre), width);
    });
    // Each icon moves aside by half the growth of the icons on either side of it, so the row
    // spreads out from its middle and the gaps between icons stay the same
    var growth = scales.map(function (scale) { return (scale - 1) * width; });
    var total = growth.reduce(function (sum, extra) { return sum + extra; }, 0);
    var before = 0;
    icons.forEach(function (icon, i) {
      var shift = (before - (total - before - growth[i])) / 2;
      before += growth[i];
      icon.style.transform = scales[i] === 1 && shift === 0 ? '' :
        'translateX(' + shift.toFixed(2) + 'px) scale(' + scales[i].toFixed(4) + ')';
    });
  }

  function update() {
    if (!frame) frame = window.requestAnimationFrame(magnify);
  }

  var footer = list.closest('footer');
  footer.addEventListener('pointermove', function (event) {
    if (event.pointerType === 'touch') return;
    var box = list.getBoundingClientRect();
    pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
    update();
  });
  footer.addEventListener('pointerleave', function () {
    pointer = null;
    update();
  });

  list.addEventListener('focusin', function (event) {
    focused = icons.filter(function (icon) { return icon.contains(event.target); })[0] || null;
    update();
  });
  list.addEventListener('focusout', function () {
    focused = null;
    update();
  });
})();
