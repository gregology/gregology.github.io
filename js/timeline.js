// Greg's Clock and the spine layout for /timeline/ (timeline.md), styled by css/timeline.css.
// Without this file the page still reads: the clock is missing and the timeline is plain headings.
// DECISIONS.md says why the timeline stays markdown.
(function () {
  'use strict';

  var clock = document.getElementById('greg-clock');
  if (!clock) return;

  var DOB = new Date(clock.dataset.dob).getTime();
  var BIRTH_YEAR = new Date(DOB).getFullYear();
  var LIFE_YEARS = Number(clock.dataset.lifeExpectancyYears);
  var YEAR_SECONDS = 365.2425 * 24 * 60 * 60;
  var LIFE_SECONDS = LIFE_YEARS * YEAR_SECONDS;

  // The grid has 52 squares per year of life, so a square is a little over 7 days
  var SQUARES_PER_YEAR = 52;
  var SQUARE_MS = YEAR_SECONDS * 1000 / SQUARES_PER_YEAR;

  // [name, seconds, decimal places]
  var UNITS = [['Seconds', 1, 0], ['Minutes', 60, 0], ['Hours', 3600, 2], ['Days', 86400, 2],
    ['Weeks', 604800, 1], ['Months', YEAR_SECONDS / 12, 1], ['Years', YEAR_SECONDS, 2]];

  // Colours are --chapter-<id> in css/timeline.css
  var CHAPTERS = [['uk', 'UK and Europe'], ['au', 'Australia'], ['dep', 'Deployed'], ['ca', 'Canada'], ['sea', 'At sea']];

  // Where Greg was based: [year, month, chapter, place], each lasting until the next one starts.
  // These repeat the moves in timeline.md, so a new move there needs a line here.
  var PLACES = [
    [1983, 5, 'uk', 'London'], [1986, 4, 'au', 'Sydney'], [1999, 12, 'uk', 'London'], [2000, 7, 'au', 'Sydney'],
    [2004, 2, 'au', 'Newcastle'], [2006, 7, 'au', 'Sydney'], [2007, 4, 'uk', 'France and the UK'],
    [2007, 12, 'au', 'Sydney'], [2008, 2, 'au', 'Perth'], [2008, 5, 'au', 'Sydney'],
    [2008, 11, 'dep', 'Solomon Islands'], [2009, 4, 'au', 'Sydney'], [2010, 11, 'dep', 'Afghanistan'],
    [2011, 4, 'au', 'Sydney'], [2012, 11, 'ca', 'Ottawa'], [2017, 9, 'sea', 'SV Catsaway'],
    [2018, 9, 'ca', 'Ottawa'], [2021, 1, 'ca', 'Prince Edward County']
  ].map(function (place, i) {
    return { start: i === 0 ? DOB : Date.UTC(place[0], place[1] - 1, 1), chapter: place[2], name: place[3] };
  });

  function placeAt(time) {
    var found = PLACES[0];
    PLACES.forEach(function (place) { if (place.start <= time) found = place; });
    return found;
  }

  function chapterName(id) {
    return CHAPTERS.filter(function (chapter) { return chapter[0] === id; })[0][1];
  }

  function format(value, decimals) {
    return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  function element(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  // --- Greg's Clock: every week of the expected life span, coloured by chapter ---

  var legend = CHAPTERS.map(function (chapter) {
    return '<li><i style="background:var(--chapter-' + chapter[0] + ')"></i>' + chapter[1] + '</li>';
  }).join('');

  clock.innerHTML =
    '<div class="clock-head"><h3>Greg\'s Clock</h3>' +
      '<p class="clock-percent"><b></b> through his expected life span' +
      '<a href="' + clock.dataset.lifeExpectancySource + '" target="_blank" rel="noopener" aria-label="Life expectancy source">¹</a></p></div>' +
    '<p class="clock-weeks"><b class="clock-spent"></b> weeks spent <b class="clock-left"></b> to go</p>' +
    '<div class="clock-grid"><canvas role="img" aria-label="Every week of a ' + LIFE_YEARS + ' year life as a square. ' +
      'The weeks already lived are coloured by where Greg was living."></canvas><i class="clock-now"></i></div>' +
    '<ul class="clock-legend">' + legend +
      '<li><i class="clock-legend-now"></i>This week</li><li><i class="clock-legend-future"></i>Still to come</li></ul>' +
    '<details class="clock-numbers"><summary>All the numbers</summary><div><table></table></div></details>';

  var percent = clock.querySelector('.clock-percent b');
  var weeksSpent = clock.querySelector('.clock-spent');
  var weeksLeft = clock.querySelector('.clock-left');
  var grid = clock.querySelector('.clock-grid');
  var canvas = clock.querySelector('canvas');
  var nowSquare = clock.querySelector('.clock-now');
  var numbers = clock.querySelector('.clock-numbers');
  var tip = document.body.appendChild(element('div', 'clock-tip'));
  var pitch = 0; // width of a square plus its gap, set by drawWeeks
  var drawnSquare = -1;
  tip.hidden = true;

  function currentSquare() {
    return Math.floor((Date.now() - DOB) / SQUARE_MS);
  }

  // One column per year of life, filling downwards
  function drawWeeks() {
    var width = grid.clientWidth;
    if (!width) return;
    var style = getComputedStyle(clock);
    var ratio = window.devicePixelRatio || 1;
    var gap, size, height, context, radius, now, age, week, index;
    pitch = width / LIFE_YEARS;
    gap = Math.max(1, pitch * 0.2);
    size = pitch - gap;
    height = Math.ceil(SQUARES_PER_YEAR * pitch + 26);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.height = height + 'px';
    context = canvas.getContext('2d');
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    radius = size > 5 && context.roundRect ? 1.5 : 0;
    now = currentSquare();

    for (age = 0; age < LIFE_YEARS; age++) {
      for (week = 0; week < SQUARES_PER_YEAR; week++) {
        index = age * SQUARES_PER_YEAR + week;
        context.fillStyle = style.getPropertyValue(index > now ? '--clock-future' : '--chapter-' + placeAt(DOB + index * SQUARE_MS).chapter);
        context.beginPath();
        if (radius) context.roundRect(age * pitch + gap / 2, week * pitch + gap / 2, size, size, radius);
        else context.rect(age * pitch + gap / 2, week * pitch + gap / 2, size, size);
        context.fill();
      }
    }

    context.fillStyle = style.getPropertyValue('--timeline-soft');
    context.font = '600 11px ' + style.getPropertyValue('--timeline-sans');
    context.textBaseline = 'top';
    for (age = 0; age < LIFE_YEARS; age += 10) {
      context.textAlign = age ? 'center' : 'left';
      context.fillText(age ? String(age) : 'age 0', age ? age * pitch + pitch / 2 : gap / 2, SQUARES_PER_YEAR * pitch + 8);
    }

    nowSquare.style.left = Math.floor(now / SQUARES_PER_YEAR) * pitch + gap / 2 + 'px';
    nowSquare.style.top = (now % SQUARES_PER_YEAR) * pitch + gap / 2 + 'px';
    nowSquare.style.width = nowSquare.style.height = size + 'px';
    drawnSquare = now;
  }

  function showTip(event) {
    var box = canvas.getBoundingClientRect();
    var age = Math.floor((event.clientX - box.left) / pitch);
    var week = Math.floor((event.clientY - box.top) / pitch);
    var index = age * SQUARES_PER_YEAR + week;
    var now = currentSquare();
    var place, where, size;
    if (!pitch || age < 0 || age >= LIFE_YEARS || week < 0 || week >= SQUARES_PER_YEAR) return hideTip();
    place = placeAt(DOB + index * SQUARE_MS);
    where = index === now ? 'This week' : index > now ? 'Still to come'
      : place.name + (place.name === chapterName(place.chapter) ? '' : ' · ' + chapterName(place.chapter));
    tip.innerHTML = '<b>Age ' + age + '</b>, week ' + (week + 1) + '<br>' +
      new Date(DOB + index * SQUARE_MS).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' }) + '<br>' + where;
    tip.hidden = false;
    size = tip.getBoundingClientRect();
    tip.style.left = Math.max(8, Math.min(window.innerWidth - size.width - 8, event.clientX - size.width / 2)) + 'px';
    tip.style.top = (event.clientY - size.height - 14 < 8 ? event.clientY + 18 : event.clientY - size.height - 14) + 'px';
  }

  function hideTip() {
    tip.hidden = true;
  }

  function tick() {
    var spent = (Date.now() - DOB) / 1000;
    var left = LIFE_SECONDS - spent;
    percent.textContent = (spent / LIFE_SECONDS * 100).toFixed(9) + '%';
    weeksSpent.textContent = format(Math.floor(spent / 604800), 0);
    weeksLeft.textContent = format(Math.floor(left / 604800), 0);
    if (currentSquare() !== drawnSquare) drawWeeks();
    if (!numbers.open) return;
    numbers.querySelector('table').innerHTML =
      '<tr><th>Time</th>' + UNITS.map(function (unit) { return '<th>' + unit[0] + '</th>'; }).join('') + '</tr>' +
      '<tr><th>Spent</th>' + UNITS.map(function (unit) { return '<td>' + format(spent / unit[1], unit[2]) + '</td>'; }).join('') + '</tr>' +
      '<tr><th>Left</th>' + UNITS.map(function (unit) { return '<td>' + format(left / unit[1], unit[2]) + '</td>'; }).join('') + '</tr>';
  }

  grid.addEventListener('pointermove', showTip);
  grid.addEventListener('pointerdown', showTip);
  grid.addEventListener('pointerleave', hideTip);
  numbers.addEventListener('toggle', tick);
  new ResizeObserver(drawWeeks).observe(grid);
  // The age labels are drawn in Open Sans, which may arrive after the first draw
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawWeeks);
  tick();
  setInterval(tick, 100);

  // --- Spine: rebuild the markdown's year and month headings as one line down the page ---

  var EMOJI = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;

  // A paragraph holds one milestone per line, split by <br>
  function milestonesIn(paragraph) {
    var lines = [[]];
    Array.prototype.slice.call(paragraph.childNodes).forEach(function (node) {
      if (node.nodeName === 'BR') lines.push([]);
      else lines[lines.length - 1].push(node);
    });
    return lines.filter(function (nodes) {
      return nodes.some(function (node) { return node.textContent.trim(); });
    });
  }

  // "🛍 Left Shopify" becomes an icon on the line and the text beside it
  function milestoneRow(nodes, month) {
    var row = element('li');
    var text = element('p');
    var first = nodes[0];
    var lead = first.nodeType === Node.TEXT_NODE && /^\s*(\S+)\s+/.exec(first.nodeValue);
    var icon = lead && EMOJI.test(lead[1]) ? lead[1] : '';
    var label = element('span', 'timeline-month', month ? month.slice(0, 3) + (/\?$/.test(month) ? '?' : '') : '');
    if (icon) first.nodeValue = first.nodeValue.slice(lead[0].length);
    if (/\?$/.test(month)) label.title = 'Roughly';
    nodes.forEach(function (node) { text.appendChild(node); });
    row.appendChild(element('span', 'timeline-icon', icon));
    row.appendChild(label);
    row.appendChild(text);
    return row;
  }

  function yearSummary(year) {
    var from = Date.UTC(year, 0, 1);
    var to = Date.UTC(year + 1, 0, 1);
    var names = [];
    PLACES.forEach(function (place, i) {
      var end = i + 1 < PLACES.length ? PLACES[i + 1].start : Infinity;
      if (place.start < to && end > from && names.indexOf(place.name) < 0) names.push(place.name);
    });
    return (year === BIRTH_YEAR ? 'born' : 'turned ' + (year - BIRTH_YEAR)) + ' · ' + names.join(', ');
  }

  function buildSpine(column) {
    var years = Array.prototype.filter.call(column.children, function (el) {
      return el.tagName === 'H2' && /^\d{4}$/.test(el.textContent.trim());
    });
    var timeline = element('div', 'timeline');
    var decades = element('nav', 'timeline-decades', 'Jump to');
    var listed = {};
    if (!years.length) return;
    decades.setAttribute('aria-label', 'Decades');
    column.insertBefore(timeline, years[0]);
    timeline.appendChild(decades);

    years.forEach(function (heading) {
      var year = Number(heading.textContent.trim());
      var decade = Math.floor(year / 10) * 10;
      var section = element('section', 'timeline-year');
      var header = element('header');
      var list = element('ol');
      var month = '';
      var midYear = Math.max(DOB, Math.min(Date.now(), Date.UTC(year, 6, 1)));
      var next, link;

      while ((next = heading.nextElementSibling) && /^(H3|P)$/.test(next.tagName)) {
        if (next.tagName === 'H3') month = next.textContent.trim();
        else milestonesIn(next).forEach(function (nodes) { list.appendChild(milestoneRow(nodes, month)); });
        next.remove();
      }

      section.id = 'y' + year;
      section.style.setProperty('--chapter', 'var(--chapter-' + placeAt(midYear).chapter + ')');
      header.appendChild(heading);
      header.appendChild(element('span', '', yearSummary(year)));
      section.appendChild(header);
      section.appendChild(list);
      timeline.appendChild(section);

      if (!listed[decade]) {
        listed[decade] = true;
        link = decades.appendChild(element('a', '', decade + 's'));
        link.href = '#y' + year;
      }
    });
  }

  buildSpine(clock.parentNode);
  // A link to /timeline/#y2017 arrives before that year's section exists
  if (/^#y\d{4}$/.test(location.hash) && document.getElementById(location.hash.slice(1))) {
    document.getElementById(location.hash.slice(1)).scrollIntoView();
  }
})();
