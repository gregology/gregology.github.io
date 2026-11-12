// Site search for _includes/site-search.html: ranks the posts, pages and external links in
// search.json with MiniSearch (js/minisearch.min.js). DECISIONS.md says why it works this way.
(function () {
  'use strict';

  var LIMIT = 10;
  var script = document.currentScript;
  var input = document.getElementById('search-input');
  var results = document.getElementById('results-container');
  var status = document.getElementById('search-status');
  var hint = status.textContent;
  var index = null;

  var KINDS = { post: 'Post', page: 'Page', link: 'Link' };

  // Letters that keep their shape when accents are dropped, so need spelling out
  var PLAIN = { 'ø': 'o', 'ł': 'l', 'ı': 'i', 'đ': 'd', 'ð': 'd', 'æ': 'ae', 'œ': 'oe', 'ß': 'ss', 'þ': 'th' };

  // Words too common to help find anything. Left out of the index, and out of queries once typed.
  // Not "us", "may", "new" or "can", which mean something in terms like "us embassy".
  var STOP_WORDS = {};
  ('a an and are as at be but by for from had has have he her his i in into is it its me my of on or our ' +
    'she so than that the their them then there they this to was we were with you your').split(' ')
    .forEach(function (word) { STOP_WORDS[word] = true; });

  // Splits text into words the way MiniSearch does
  var SEPARATOR = /[\s\p{P}]+/u;
  // The same, keeping the separators, so the text can be put back together
  var SEPARATOR_KEPT = new RegExp('(' + SEPARATOR.source + ')', 'u');

  // Lowercase and drop accents, so "resume" finds "Résumé" and "oresund" finds "Øresund"
  function fold(term) {
    return term.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[øłıđðæœßþ]/g, function (letter) { return PLAIN[letter]; });
  }

  // Drop the stop words a visitor has finished typing. A last word still being typed stays,
  // because "the" may be on its way to "theatre".
  function withoutStopWords(text) {
    var words = text.split(SEPARATOR).filter(Boolean);
    var typing = !SEPARATOR.test(text.slice(-1));
    return words.filter(function (word, i) {
      return !STOP_WORDS[fold(word)] || (typing && i === words.length - 1);
    }).join(' ');
  }

  function buildIndex(docs) {
    var miniSearch = new MiniSearch({
      fields: ['title', 'description', 'tags', 'terms'],
      storeFields: ['kind', 'url', 'title', 'description', 'date'],
      processTerm: function (term) {
        var folded = fold(term);
        return STOP_WORDS[folded] ? null : folded;
      },
      searchOptions: {
        // Queries keep their stop words here; withoutStopWords has already dropped the finished ones
        processTerm: fold,
        boost: { title: 3, tags: 2, terms: 2, description: 1.5 },
        prefix: true,
        // Typos only in words of 5+ letters: allowing them in shorter words made "llm" match "Lam"
        fuzzy: function (term) { return term.length >= 5 ? 0.2 : false; }
      }
    });
    miniSearch.addAll(docs.map(function (doc, i) {
      doc.id = i;
      return doc;
    }));
    return miniSearch;
  }

  function say(text) {
    status.textContent = text;
  }

  function element(tag, className, text) {
    var el = document.createElement(tag);
    el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  // The text with each word the hit matched in this field wrapped in <mark>. MiniSearch reports
  // matches as index terms, so each word is folded the same way before comparing.
  function highlighted(tag, className, text, hit, field) {
    var el = element(tag, className);
    text.split(SEPARATOR_KEPT).forEach(function (part, i) {
      var term = fold(part);
      // Odd parts are the separators between words
      var matched = i % 2 === 0 && Object.prototype.hasOwnProperty.call(hit.match, term) &&
        hit.match[term].indexOf(field) !== -1;
      if (matched) {
        el.appendChild(element('mark', '', part));
      } else {
        el.appendChild(document.createTextNode(part));
      }
    });
    return el;
  }

  function resultItem(hit) {
    var item = element('li', 'search-result search-result-' + hit.kind);
    var link = document.createElement('a');
    link.href = hit.url;
    link.appendChild(highlighted('span', 'search-result-title', hit.title, hit, 'title'));
    if (hit.description) {
      link.appendChild(highlighted('span', 'search-result-description', hit.description, hit, 'description'));
    }

    var meta = element('span', 'search-result-meta');
    meta.appendChild(element('span', 'search-result-kind', KINDS[hit.kind]));
    if (hit.kind === 'link') {
      // Say where an external link goes before anyone follows it
      meta.appendChild(element('span', '', new URL(hit.url).hostname.replace(/^www\./, '').toLowerCase() + ' ↗'));
    } else if (hit.date) {
      meta.appendChild(element('span', '', hit.date));
    }
    link.appendChild(meta);
    item.appendChild(link);
    return item;
  }

  function render() {
    var query = input.value.trim();
    results.textContent = '';
    if (!query) {
      say(hint);
      return;
    }
    if (!index) {
      say('Loading…');
      return;
    }
    // Untrimmed, so a trailing space shows the last word is finished
    var words = withoutStopWords(input.value);
    var hits = words ? index.search(words) : [];
    if (!hits.length) {
      say('No results found');
      return;
    }
    if (hits.length > LIMIT) {
      say('Top ' + LIMIT + ' of ' + hits.length + ' results');
    } else {
      say(hits.length === 1 ? '1 result' : hits.length + ' results');
    }
    hits.slice(0, LIMIT).forEach(function (hit) {
      results.appendChild(resultItem(hit));
    });
  }

  // Keep the query in the address bar, so Back returns to the same results
  function rememberQuery() {
    var url = new URL(window.location.href);
    var query = input.value.trim();
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState(null, '', url);
  }

  input.addEventListener('input', function () {
    render();
    rememberQuery();
  });

  // /search/?q=... (the Office Assistant's search box) runs that search straight away
  var query = new URLSearchParams(window.location.search).get('q');
  if (query) input.value = query;

  fetch(script.getAttribute('data-index'))
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(function (docs) {
      index = buildIndex(docs);
      render();
    })
    .catch(function () {
      results.textContent = '';
      say("Search isn't working right now. Try again later.");
    });
})();
