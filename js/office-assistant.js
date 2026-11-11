/*!
 * Office Assistant behaviour for gregology.net, built on js/clippy.js.
 *
 * - greets the reader with the page's clippy_help message, optionally as a
 *   question with clickable answers (clippy_choices in the front matter)
 * - click the assistant: "What would you like to do?" with a site search box
 * - right-click or long-press: Hide Assistant, Options..., Choose Assistant..., Animate!
 * - "Office Assistant" dialog with Gallery and Options tabs, saved in localStorage
 * - a lightbulb appears when there's a Tip of the Day
 * - reacts to printing, saving (Ctrl/Cmd+S), searching, letter writing and idling
 *
 * Page settings come from window.CLIPPY_PAGE, written by _includes/clippy.html.
 * A page can add its own behaviour with window.clippyReady = function (agent) {}.
 */
(function (window, document, $, clippy) {
    'use strict';

    if (!$ || !clippy) { return; }

    var page = window.CLIPPY_PAGE || {};
    var BASE = page.base || '';

    // fetch this build's agent files, not whatever an earlier visit cached
    clippy.load.version = page.version || '';
    var AGENTS_PATH = BASE + '/agents/';
    var STORAGE_KEY = 'officeAssistant';
    var GREETING_DELAY = 1500;
    var TIP_DELAY = 20000;
    var NEXT_TIP_DELAY = 120000;
    var IDLE_AFTER = 60000;

    var CHARACTERS = [
        {
            id: 'Clippy',
            name: 'Clippit',
            blurb: 'Clippit will help you find what you need and keep your work together. Whether you like it or not.',
            intro: "Hello again! It looks like you missed me."
        },
        {
            id: 'Links',
            name: 'Links',
            blurb: "Links is a cat. Links will help you, unless something more interesting comes along.",
            intro: "Meow. I mean, hello! How can I help?"
        },
        {
            id: 'Rocky',
            name: 'Rocky',
            blurb: 'Rocky is loyal and eager, and will fetch any answer you throw. Answers may come back slobbery.',
            intro: 'Woof! Rocky reporting for duty!'
        },
        {
            id: 'F1',
            name: 'F1',
            blurb: 'F1 is a robot from the future, sent back in time to help you with your documents.',
            intro: 'F1 online. Assistance protocols engaged.'
        },
        {
            id: 'Genius',
            name: 'The Genius',
            blurb: 'The Genius knows the answer to everything, and will tell you. At length.',
            intro: 'Ah, a visitor! Let me tell you everything I know.'
        }
    ];

    var TIPS = [
        { id: 'paperclip', text: 'A paper clip can hold about 20 sheets of paper together. I can hold a grudge for much longer.' },
        { id: 'search', text: "To find something on this site, click me and type a question. I'll pretend I knew all along." },
        { id: 'choose', text: "Right-click me to choose a different assistant. I won't take it personally. Much." },
        { id: 'drag', text: "You can drag me anywhere on the screen. Please don't drag me into the Recycle Bin." },
        { id: 'save', text: "Press Ctrl+S to save this page for later. I'll watch." },
        { id: 'print', text: "To print this page, press Ctrl+P. I'll make it look like hard work." },
        { id: 'cheese', text: "Greg's favourite food is cheese. This tip has nothing to do with Office." },
        { id: 'sounds', text: "You can turn my sounds off in Options. I can't think why you'd want to." },
        { id: 'reading', text: 'Reading an article from top to bottom is the fastest way to reach the end of it.' },
        { id: 'working', text: 'If you can read this tip, your computer is working. Congratulations!' },
        { id: 'time', text: 'You can save time by not reading tips like this one.' },
        { id: 'mac', text: "Mac users can press Cmd instead of Ctrl. I won't tell anyone." }
    ];

    var HELP_TOPICS = [
        { label: 'Choose a different assistant', action: 'gallery' },
        { label: 'Read the latest posts', url: BASE + '/posts/' },
        { label: 'Find out about Greg', url: BASE + '/about/' }
    ];

    var DEFAULTS = { enabled: true, sounds: true, tips: true, letterTip: true, agent: 'Clippy', seenTips: [] };

    var settings = readSettings();
    var agent = null;
    var summoning = 0;
    var lightbulb = null;
    var tipTimer = null;
    var menu = null;
    var dialog = null;
    var dialogReturnFocus = null;
    var preview = null;
    var previewToken = 0;
    var restoreButton = null;

    /**************************** Settings ************************************/

    function readSettings() {
        var stored = {};
        try {
            stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
        } catch (e) {
            stored = {};
        }
        var s = $.extend({}, DEFAULTS, stored);
        s.seenTips = Array.isArray(s.seenTips) ? s.seenTips.slice() : [];
        if (!character(s.agent)) { s.agent = DEFAULTS.agent; }
        return s;
    }

    function saveSettings() {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            // storage is blocked (private mode, cookies off): settings last for this page only
        }
    }

    /**************************** Helpers ************************************/

    function character(id) {
        for (var i = 0; i < CHARACTERS.length; i++) {
            if (CHARACTERS[i].id === id) { return CHARACTERS[i]; }
        }
        return null;
    }

    function characterIndex(id) {
        for (var i = 0; i < CHARACTERS.length; i++) {
            if (CHARACTERS[i].id === id) { return i; }
        }
        return 0;
    }

    function visibleAgent() {
        return agent && agent.isVisible() ? agent : null;
    }

    // run fn after ms, unless the agent has since been hidden or replaced
    function later(ms, a, fn) {
        window.setTimeout(function () {
            if (agent === a && a.isVisible()) { fn(); }
        }, ms);
    }

    function whenIdle(fn) {
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(fn, { timeout: 5000 });
        } else {
            window.setTimeout(fn, 500);
        }
    }

    function saveData() {
        return !!(navigator.connection && navigator.connection.saveData);
    }

    function isSafeUrl(url) {
        return /^(\/(?!\/)|https?:\/\/)/i.test(url || '');
    }

    function searchQuery() {
        if (!document.getElementById('search-input')) { return ''; }
        try {
            return $.trim(new URLSearchParams(window.location.search).get('q') || '');
        } catch (e) {
            return '';
        }
    }

    /**************************** Summoning ************************************/

    function start() {
        bindReactions();
        if (settings.enabled) {
            summon(settings.agent, {});
        } else {
            showRestoreButton();
        }
    }

    /***
     * Load and show a character.
     * @param {String} id
     * @param {Object} options  {position: {left, top}, intro: Boolean}
     */
    function summon(id, options) {
        var token = ++summoning;
        clippy.load(id, function (a) {
            if (token !== summoning) {
                a.dispose();
                return;
            }
            agent = a;
            setupAgent(a);
            if (options.position) { a.setPosition(options.position.left, options.position.top); }
            a.show();
            if (options.intro) {
                introduce(a);
            } else {
                greet(a);
            }
            if (typeof window.clippyReady === 'function') { window.clippyReady(a); }
        }, function () {
            // fall back to Clippit if another character fails to load
            if (token === summoning && id !== DEFAULTS.agent) { summon(DEFAULTS.agent, options); }
        }, AGENTS_PATH);
    }

    function setupAgent(a) {
        var c = character(a.name);
        a.element().attr('aria-label', c.name + ', the Office Assistant. Press Enter for help, or Shift+F10 for more options.');
        a.setSounds(settings.sounds);
        a.on('click', function (e) {
            if (a.asking() === 'help') {
                a.closeBalloon();
                return;
            }
            // focusing the search box on a phone would pop up the keyboard
            openHelp(e.keyboard || e.pointerType === 'mouse');
        });
        a.on('contextmenu', function (e) {
            openMenu(e.x, e.y, e.keyboard);
        });
        a.on('move', placeLightbulb);
    }

    function greet(a) {
        var query = searchQuery();
        var message = query ? 'I looked everywhere for "' + query + '". Here is what I found.' : page.message;
        var choices = !query && Array.isArray(page.choices) ? page.choices : [];

        later(GREETING_DELAY, a, function () {
            a.play('Wave');
            if (choices.length) {
                a.ask({ id: 'greeting', text: message, choices: choices, onChoose: answerGreeting });
            } else if (message) {
                a.speak(message);
            }
        });
        later(10000, a, function () { a.animate(); });
        prefetchLater(a);
        scheduleTip(TIP_DELAY);
    }

    function introduce(a) {
        a.playFirst(['Greeting', 'Wave']);
        a.speak(character(a.name).intro);
        prefetchLater(a);
        scheduleTip(TIP_DELAY);
    }

    // fetch the rest of the sprite sheet once the page has settled
    function prefetchLater(a) {
        later(4000, a, function () {
            if (!saveData()) { whenIdle(function () { a.prefetch(); }); }
        });
    }

    function answerGreeting(choice) {
        if (!choice || !agent) { return; }
        if (choice.animation) { agent.play(choice.animation); }
        if (choice.reply) { agent.speak(String(choice.reply)); }
        if (isSafeUrl(choice.url)) {
            agent.enqueue(function () { window.location.href = choice.url; });
        }
    }

    function switchAgent(id) {
        removeLightbulb();
        var old = agent;
        var position = null;
        agent = null;
        if (old && old.isVisible()) {
            var r = old.element()[0].getBoundingClientRect();
            if (r.width) { position = { left: r.left, top: r.top }; }
        }
        var swap = function () {
            if (old) { old.dispose(); }
            summon(id, { position: position, intro: true });
        };
        if (old && old.isVisible()) {
            old.hide(false, swap);
        } else {
            swap();
        }
    }

    function hideAssistant() {
        if (!agent) { return; }
        removeLightbulb();
        window.clearTimeout(tipTimer);
        agent.hide(false, showRestoreButton);
    }

    /**************************** Restore button ************************************/

    // the Office Assistant toolbar button: brings the assistant back after Hide
    function showRestoreButton() {
        if (restoreButton) { return; }
        restoreButton = $('<button type="button" class="clippy-restore"></button>')
            .attr({ title: 'Show the Office Assistant', 'aria-label': 'Show the Office Assistant' })
            .on('click', function () {
                removeRestoreButton();
                if (!settings.enabled) {
                    settings.enabled = true;
                    saveSettings();
                }
                if (agent) {
                    agent.show();
                    agent.playFirst(['Greeting', 'Wave']);
                    scheduleTip(TIP_DELAY);
                } else {
                    summon(settings.agent, {});
                }
            })
            .appendTo(document.body);
    }

    function removeRestoreButton() {
        if (!restoreButton) { return; }
        restoreButton.remove();
        restoreButton = null;
    }

    /**************************** Help balloon and search ************************************/

    function openHelp(focus) {
        if (!visibleAgent()) { return; }
        agent.ask({
            id: 'help',
            title: 'What would you like to do?',
            choices: HELP_TOPICS,
            input: {
                placeholder: 'Type your question here, and then click Search.',
                label: 'Search this site',
                button: 'Search'
            },
            buttons: [
                { label: 'Tips', action: 'tip' },
                { label: 'Options', action: 'options' },
                { label: 'Close', action: 'close' }
            ],
            focus: focus,
            onChoose: function (choice) {
                if (!choice) { return; }
                if (choice.search !== undefined) {
                    runSearch(choice.search);
                    return;
                }
                switch (choice.action) {
                    case 'gallery': openDialog('gallery'); break;
                    case 'options': openDialog('options'); break;
                    case 'tip': showTip(); break;
                    default:
                        if (isSafeUrl(choice.url)) { window.location.href = choice.url; }
                }
            }
        }, true);
    }

    function runSearch(query) {
        query = $.trim(query || '');
        if (!visibleAgent()) { return; }
        if (!query) {
            agent.speak("You'll need to type a question first. I'm good, but I'm not that good.");
            return;
        }
        if (/^dear\b/i.test(query)) {
            offerLetterHelp();
            return;
        }

        var url = BASE + '/search/?q=' + encodeURIComponent(query);
        var gone = false;
        var go = function () {
            if (gone) { return; }
            gone = true;
            window.location.href = url;
        };
        agent.interrupt();
        if (!agent.playFirst(['Searching', 'Processing', 'Thinking'], 2500, go)) { go(); }
        // don't keep the reader waiting if the animation is slow to download
        window.setTimeout(go, 4000);
    }

    function offerLetterHelp() {
        if (!visibleAgent() || !settings.letterTip || agent.asking() === 'letter') { return; }
        agent.ask({
            id: 'letter',
            text: "It looks like you're writing a letter. Would you like help?",
            choices: [
                { label: 'Get help with writing the letter', help: true },
                { label: 'Just type the letter without help' }
            ],
            checkbox: "Don't show me this tip again",
            onChoose: function (choice, extra) {
                if (extra.checked) {
                    settings.letterTip = false;
                    saveSettings();
                }
                if (choice && choice.help && visibleAgent()) {
                    agent.playFirst(['Writing', 'Processing']);
                    agent.speak('Dear Sir or Madam, I am an Office Assistant. I cannot write letters. I can only hold them together. Yours sincerely, ' + character(agent.name).name + '.');
                }
            }
        }, true);
        agent.playFirst(['GetAttention', 'Alert']);
    }

    /**************************** Tips ************************************/

    function unseenTips() {
        return $.grep(TIPS, function (tip) { return $.inArray(tip.id, settings.seenTips) === -1; });
    }

    function scheduleTip(delay) {
        window.clearTimeout(tipTimer);
        if (!settings.tips) { return; }
        tipTimer = window.setTimeout(offerTip, delay);
    }

    function offerTip() {
        if (lightbulb || !visibleAgent() || !settings.tips || !unseenTips().length) { return; }
        lightbulb = $('<button type="button" class="clippy-lightbulb"></button>')
            .attr({ title: 'Show me the tip', 'aria-label': 'The Office Assistant has a tip for you' })
            .on('click', showTip)
            .appendTo(document.body);
        placeLightbulb();
    }

    function placeLightbulb() {
        if (!lightbulb || !agent) { return; }
        var r = agent.element()[0].getBoundingClientRect();
        lightbulb.css({ left: r.left + r.width - 34, top: Math.max(4, r.top - 6) });
        lightbulb.toggle(agent.isVisible());
    }

    function removeLightbulb() {
        if (!lightbulb) { return; }
        lightbulb.remove();
        lightbulb = null;
    }

    function showTip() {
        removeLightbulb();
        if (!visibleAgent()) { return; }
        var tips = unseenTips();
        if (!tips.length) {
            agent.interrupt();
            agent.speak("That's all my tips. You can reset them in Options if you'd like to hear them again.");
            return;
        }
        var tip = tips[Math.floor(Math.random() * tips.length)];
        settings.seenTips.push(tip.id);
        saveSettings();

        agent.ask({
            id: 'tip',
            title: 'Tip of the Day',
            text: tip.text,
            buttons: [
                { label: 'Next tip', action: 'next' },
                { label: 'Close', action: 'close' }
            ],
            onChoose: function (choice) {
                if (choice && choice.action === 'next') { showTip(); }
            }
        }, true);
        agent.playFirst(['Explain', 'GestureUp']);
        scheduleTip(NEXT_TIP_DELAY);
    }

    /**************************** Reactions ************************************/

    function bindReactions() {
        // printing
        window.addEventListener('beforeprint', function () {
            if (!visibleAgent()) { return; }
            agent.interrupt();
            agent.playFirst(['Print', 'Writing']);
        });
        window.addEventListener('afterprint', function () {
            if (!visibleAgent()) { return; }
            agent.speak("It looks like you've printed a web page. I've let the trees know.");
        });

        // saving
        document.addEventListener('keydown', function (e) {
            if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || (e.key || '').toLowerCase() !== 's') { return; }
            if (!visibleAgent()) { return; }
            agent.interrupt();
            agent.playFirst(['Save', 'Writing']);
            agent.speak("It looks like you're trying to save a web page. Good idea. The Internet could run out any day now.");
        });

        // letter writing and searching, in any text box on the page
        var lastSearchReaction = 0;
        document.addEventListener('input', function (e) {
            var field = e.target;
            if (!visibleAgent() || !field || !$(field).is('input[type=text], input[type=search], input:not([type]), textarea')) { return; }
            // Clippy's own search box checks for letters when it is submitted
            if ($(field).closest('.clippy-balloon, .clippy-window').length) { return; }
            if (/^\s*dear\s+\S/i.test(field.value)) {
                if (!field.clippyLetterOffered) {
                    field.clippyLetterOffered = true;
                    offerLetterHelp();
                }
            } else if (field.id === 'search-input' && Date.now() - lastSearchReaction > 15000) {
                lastSearchReaction = Date.now();
                agent.playFirst(['Searching', 'Processing']);
            }
        }, true);

        // idling
        var lastActivity = Date.now();
        var idleTimer = null;
        var idleNoticed = false;
        var checkIdle = function () {
            idleTimer = null;
            var quiet = Date.now() - lastActivity;
            if (quiet < IDLE_AFTER) {
                idleTimer = window.setTimeout(checkIdle, IDLE_AFTER - quiet);
                return;
            }
            if (!idleNoticed && visibleAgent() && !document.hidden) {
                idleNoticed = true;
                agent.playFirst(['GetAttention', 'Alert']);
            }
        };
        var noteActivity = function () {
            lastActivity = Date.now();
            idleNoticed = false;
            if (!idleTimer) { idleTimer = window.setTimeout(checkIdle, IDLE_AFTER); }
        };
        $.each(['pointermove', 'pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart'], function (i, type) {
            window.addEventListener(type, noteActivity, { passive: true, capture: true });
        });
        noteActivity();
    }

    /**************************** Right-click menu ************************************/

    function openMenu(x, y, fromKeyboard) {
        if (!visibleAgent()) { return; }
        closeMenu();
        var items = [
            { label: 'Hide Assistant', key: 'H', run: hideAssistant },
            { label: 'Options...', key: 'O', run: function () { openDialog('options'); } },
            { label: 'Choose Assistant...', key: 'C', run: function () { openDialog('gallery'); } },
            {
                label: 'Animate!', key: 'A', run: function () {
                    if (!visibleAgent()) { return; }
                    agent.interrupt();
                    agent.animate();
                }
            }
        ];

        menu = $('<div class="clippy-menu" role="menu" tabindex="-1"></div>')
            .attr('aria-label', character(agent.name).name);
        $.each(items, function (i, item) {
            var at = item.label.indexOf(item.key);
            $('<button type="button" role="menuitem" class="clippy-menu-item" tabindex="-1"></button>')
                .append(
                    document.createTextNode(item.label.slice(0, at)),
                    $('<u></u>').text(item.key),
                    document.createTextNode(item.label.slice(at + 1))
                )
                .attr('aria-keyshortcuts', item.key)
                .data('item', item)
                .on('click', function () {
                    closeMenu();
                    item.run();
                })
                .appendTo(menu);
        });
        menu.appendTo(document.body);

        // open at the pointer, flipping left or up near the edge of the screen
        var w = menu.outerWidth();
        var h = menu.outerHeight();
        var vw = $(window).width();
        var vh = $(window).height();
        menu.css({
            left: x + w > vw ? Math.max(0, x - w) : x,
            top: y + h > vh ? Math.max(0, y - h) : y
        });

        menu.on('keydown', onMenuKey);
        (fromKeyboard ? menu.find('.clippy-menu-item').first() : menu).trigger('focus');

        document.addEventListener('pointerdown', onPointerOutsideMenu, true);
        window.addEventListener('blur', closeMenu);
        window.addEventListener('resize', closeMenu);
        window.addEventListener('scroll', closeMenu, true);
    }

    function onPointerOutsideMenu(e) {
        if (menu && !menu[0].contains(e.target)) { closeMenu(); }
    }

    function onMenuKey(e) {
        var items = menu.find('.clippy-menu-item');
        var i = items.index(document.activeElement);
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                items.eq((i + 1) % items.length).trigger('focus');
                break;
            case 'ArrowUp':
                e.preventDefault();
                items.eq(i <= 0 ? items.length - 1 : i - 1).trigger('focus');
                break;
            case 'Home':
                e.preventDefault();
                items.first().trigger('focus');
                break;
            case 'End':
                e.preventDefault();
                items.last().trigger('focus');
                break;
            case 'Escape':
                e.preventDefault();
                closeMenu();
                if (visibleAgent()) { agent.element().trigger('focus'); }
                break;
            case 'Tab':
                e.preventDefault();
                closeMenu();
                break;
            default:
                var key = (e.key || '').toUpperCase();
                items.each(function () {
                    if ($(this).data('item').key === key) {
                        e.preventDefault();
                        $(this).trigger('click');
                        return false;
                    }
                });
        }
    }

    function closeMenu() {
        if (!menu) { return; }
        menu.remove();
        menu = null;
        document.removeEventListener('pointerdown', onPointerOutsideMenu, true);
        window.removeEventListener('blur', closeMenu);
        window.removeEventListener('resize', closeMenu);
        window.removeEventListener('scroll', closeMenu, true);
    }

    /**************************** Office Assistant dialog ************************************/

    var DIALOG_HTML =
        '<div class="clippy-backdrop">' +
            '<div class="clippy-window" role="dialog" aria-modal="true" aria-labelledby="clippy-dialog-title">' +
                '<div class="clippy-titlebar">' +
                    '<span id="clippy-dialog-title">Office Assistant</span>' +
                    '<button type="button" class="clippy-titlebar-button" data-action="cancel" aria-label="Close"></button>' +
                '</div>' +
                '<div class="clippy-tabs" role="tablist">' +
                    '<button type="button" role="tab" id="clippy-tab-gallery" aria-controls="clippy-panel-gallery" data-tab="gallery">Gallery</button>' +
                    '<button type="button" role="tab" id="clippy-tab-options" aria-controls="clippy-panel-options" data-tab="options">Options</button>' +
                '</div>' +
                '<div class="clippy-panel" role="tabpanel" id="clippy-panel-gallery" aria-labelledby="clippy-tab-gallery">' +
                    '<div class="clippy-gallery">' +
                        '<div class="clippy-gallery-text">' +
                            '<h2 class="clippy-gallery-name" aria-live="polite"></h2>' +
                            '<p class="clippy-gallery-blurb"></p>' +
                        '</div>' +
                        '<div class="clippy-gallery-stage"></div>' +
                    '</div>' +
                    '<div class="clippy-gallery-nav">' +
                        '<button type="button" class="clippy-button" data-action="back">&lt; Back</button>' +
                        '<button type="button" class="clippy-button" data-action="next">Next &gt;</button>' +
                    '</div>' +
                '</div>' +
                '<div class="clippy-panel" role="tabpanel" id="clippy-panel-options" aria-labelledby="clippy-tab-options">' +
                    '<fieldset class="clippy-group">' +
                        '<legend>Assistant capabilities</legend>' +
                        '<label class="clippy-check"><input type="checkbox" name="enabled"> <span>Use the Office Assistant</span></label>' +
                        '<label class="clippy-check"><input type="checkbox" name="sounds"> <span>Make sounds</span></label>' +
                    '</fieldset>' +
                    '<fieldset class="clippy-group">' +
                        '<legend>Tips</legend>' +
                        '<label class="clippy-check"><input type="checkbox" name="tips"> <span>Show the Tip of the Day at startup</span></label>' +
                        '<button type="button" class="clippy-button" data-action="reset-tips">Reset my tips</button>' +
                    '</fieldset>' +
                '</div>' +
                '<div class="clippy-dialog-buttons">' +
                    '<button type="button" class="clippy-button" data-action="ok">OK</button>' +
                    '<button type="button" class="clippy-button" data-action="cancel">Cancel</button>' +
                '</div>' +
            '</div>' +
        '</div>';

    function openDialog(tab) {
        closeMenu();
        closeDialog();

        var draft = {
            agent: settings.agent,
            enabled: settings.enabled,
            sounds: settings.sounds,
            tips: settings.tips,
            resetTips: false
        };
        var index = characterIndex(draft.agent);
        dialogReturnFocus = document.activeElement;
        dialog = $(DIALOG_HTML).appendTo(document.body);

        var renderCharacter = function () {
            var c = CHARACTERS[index];
            draft.agent = c.id;
            dialog.find('.clippy-gallery-name').text(c.name);
            dialog.find('.clippy-gallery-blurb').text(c.blurb);
            startPreview(dialog.find('.clippy-gallery-stage'), c.id);
        };

        var showTab = function (name, focus) {
            dialog.find('[role=tab]').each(function () {
                var selected = $(this).data('tab') === name;
                $(this).attr({ 'aria-selected': selected, tabindex: selected ? 0 : -1 }).toggleClass('is-active', selected);
                if (selected && focus) { $(this).trigger('focus'); }
            });
            dialog.find('#clippy-panel-gallery').prop('hidden', name !== 'gallery');
            dialog.find('#clippy-panel-options').prop('hidden', name !== 'options');
            if (name === 'gallery') {
                renderCharacter();
            } else {
                stopPreview();
            }
        };

        dialog.find('input[name]').each(function () {
            this.checked = !!draft[this.name];
        }).on('change', function () {
            draft[this.name] = this.checked;
        });

        dialog.on('click', '[data-tab]', function () {
            showTab($(this).data('tab'));
        });

        dialog.on('click', '[data-action]', function () {
            switch ($(this).data('action')) {
                case 'back':
                    index = (index - 1 + CHARACTERS.length) % CHARACTERS.length;
                    renderCharacter();
                    break;
                case 'next':
                    index = (index + 1) % CHARACTERS.length;
                    renderCharacter();
                    break;
                case 'reset-tips':
                    draft.resetTips = true;
                    $(this).prop('disabled', true).text('Tips will be reset');
                    break;
                case 'ok':
                    closeDialog();
                    applySettings(draft);
                    break;
                case 'cancel':
                    closeDialog();
                    break;
            }
        });

        dialog.on('keydown', function (e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeDialog();
            } else if (e.key === 'Tab') {
                trapFocus(e);
            } else if ($(e.target).is('[role=tab]') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                e.preventDefault();
                showTab($(e.target).data('tab') === 'gallery' ? 'options' : 'gallery', true);
            }
        });

        showTab(tab === 'options' ? 'options' : 'gallery', true);
    }

    function trapFocus(e) {
        var focusable = dialog.find('button, input').filter(':visible:not(:disabled)').filter(function () {
            return this.tabIndex >= 0;
        });
        if (!focusable.length) { return; }
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    function closeDialog() {
        if (!dialog) { return; }
        stopPreview();
        dialog.remove();
        dialog = null;
        if (dialogReturnFocus && document.contains(dialogReturnFocus)) {
            dialogReturnFocus.focus();
        } else if (visibleAgent()) {
            agent.element().trigger('focus');
        }
        dialogReturnFocus = null;
    }

    function applySettings(draft) {
        var switching = draft.agent !== settings.agent;
        settings.agent = draft.agent;
        settings.enabled = draft.enabled;
        settings.sounds = draft.sounds;
        settings.tips = draft.tips;
        if (draft.resetTips) {
            settings.seenTips = [];
            settings.letterTip = true;
        }
        saveSettings();

        if (!settings.enabled) {
            removeLightbulb();
            window.clearTimeout(tipTimer);
            if (visibleAgent()) {
                agent.hide(false, showRestoreButton);
            } else {
                showRestoreButton();
            }
            return;
        }

        removeRestoreButton();
        if (!agent || switching) {
            switchAgent(settings.agent);
            return;
        }

        agent.setSounds(settings.sounds);
        if (!agent.isVisible()) { agent.show(); }
        if (!settings.tips) {
            removeLightbulb();
            window.clearTimeout(tipTimer);
        } else if (!lightbulb) {
            scheduleTip(draft.resetTips ? 1000 : TIP_DELAY);
        }
    }

    /**************************** Gallery preview ************************************/

    function startPreview(stage, id) {
        stopPreview();
        var token = ++previewToken;
        var path = AGENTS_PATH + id;
        stage.empty().addClass('is-loading');

        clippy.load.data(id, AGENTS_PATH).done(function (data) {
            if (token !== previewToken) { return; }
            stage.removeClass('is-loading');
            var el = $('<div class="clippy-preview" aria-hidden="true"></div>').appendTo(stage);
            var animator = new clippy.Animator(el, path, data);
            var idles = $.grep(animator.animations(), function (name) {
                return name.indexOf('Idle') === 0 && animator.isReady(name);
            });
            var playlist = $.grep(['Show', 'Greeting', 'Wave'].concat(idles), function (name) {
                return animator.hasAnimation(name) && animator.isReady(name);
            });
            var step = 0;
            var current = preview = { animator: animator, nextTimer: null, exitTimer: null };

            var next = function () {
                if (preview !== current || !playlist.length) { return; }
                // play Show once, then cycle through the greetings and idles
                var rest = playlist.length - 1;
                var name = step === 0 || !rest ? playlist[0] : playlist[1 + (step - 1) % rest];
                step++;
                window.clearTimeout(current.exitTimer);
                animator.showAnimation(name, function (n, state) {
                    if (preview !== current) { return; }
                    if (state === clippy.Animator.States.WAITING) {
                        animator.exitAnimation();
                    } else if (state === clippy.Animator.States.EXITED) {
                        window.clearTimeout(current.nextTimer);
                        current.nextTimer = window.setTimeout(next, 400);
                    }
                });
                // some animations loop until told to stop
                current.exitTimer = window.setTimeout(function () { animator.exitAnimation(); }, 4000);
            };
            next();
        }).fail(function () {
            if (token === previewToken) { stage.removeClass('is-loading').text('Preview unavailable'); }
        });
    }

    function stopPreview() {
        previewToken++;
        if (!preview) { return; }
        preview.animator.dispose();
        window.clearTimeout(preview.nextTimer);
        window.clearTimeout(preview.exitTimer);
        preview = null;
    }

    /**************************** Start ************************************/

    window.OfficeAssistant = {
        agent: function () { return agent; },
        openDialog: openDialog,
        showTip: showTip,
        offerTip: offerTip
    };

    start();

})(window, document, window.jQuery, window.clippy);
