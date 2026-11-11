/*!
 * clippy.js: Office Assistant agents for the web.
 * Based on Clippy.js by Smore (MIT) and its clippyjs build by pi0 (MIT).
 *
 * Local changes: sprite sheets split into a small core sheet plus a lazily
 * loaded extra sheet, pointer/touch dragging, long-press and right-click
 * events, pausing in background tabs, sounds that load after the first user
 * gesture and fail quietly, and question balloons with clickable choices.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
	typeof define === 'function' && define.amd ? define(['jquery'], factory) :
	(global.clippy = factory(global.$));
}(this, (function ($) { 'use strict';

$ = 'default' in $ ? $['default'] : $;

/**************************** Queue ************************************/

var Queue = function Queue (onEmptyCallback) {
    this._queue = [];
    this._generation = 0;
    this._onEmptyCallback = onEmptyCallback;
};

Queue.prototype.queue = function queue (func) {
    this._queue.push(func);

    if (this._queue.length === 1 && !this._active) {
        this._progressQueue();
    }
};

Queue.prototype._progressQueue = function _progressQueue () {
    if (!this._queue.length) {
        this._onEmptyCallback();
        return;
    }

    var f = this._queue.shift();
    var self = this;
    var generation = this._generation;
    var finished = false;
    this._active = true;
    // each item may finish once, and items abandoned by reset() can't finish at all
    f(function () {
        if (finished || generation !== self._generation) { return; }
        finished = true;
        self.next();
    });
};

Queue.prototype.clear = function clear () {
    this._queue = [];
};

/***
 * Drop everything, including the item that is running now.
 */
Queue.prototype.reset = function reset () {
    this._queue = [];
    this._active = false;
    this._generation++;
};

Queue.prototype.next = function next () {
    this._active = false;
    this._progressQueue();
};

/**************************** Animator ************************************/

var Animator = function Animator (el, path, data, sounds) {
    this._el = el;
    this._data = data;
    this._path = path;
    this._sheets = $.map(data.sheets || ['map.png'], function (sheet) { return path + '/' + sheet; });
    // the first (core) sheet is always loaded before an Animator is created
    this._loadedSheets = { 0: true };
    this._animationSheets = {};
    this._currentFrameIndex = 0;
    this._currentFrame = undefined;
    this._exiting = false;
    this._currentAnimation = undefined;
    this._endCallback = undefined;
    this._started = false;
    this._paused = false;
    this._loop = null;
    this._sounds = {};
    this.muted = false;
    this.currentAnimationName = undefined;
    if (sounds) { this.setSounds(sounds); }

    this._overlays = [this._el];
    var curr = this._el;
    this._setupElement(this._el);
    for (var i = 1; i < this._data.overlayCount; i++) {
        var inner = this._setupElement($('<div></div>'));
        curr.append(inner);
        this._overlays.push(inner);
        curr = inner;
    }
};

Animator.prototype._setupElement = function _setupElement (el) {
    var frameSize = this._data.framesize;
    el.css({
        display: 'none',
        width: frameSize[0],
        height: frameSize[1],
        background: "url('" + this._sheets[0] + "') no-repeat"
    });
    el[0]._clippySheet = 0;
    return el;
};

Animator.prototype.animations = function animations () {
    var r = [];
    for (var n in this._data.animations) {
        r.push(n);
    }
    return r;
};

Animator.prototype.setSounds = function setSounds (sounds) {
    for (var i = 0; i < this._data.sounds.length; i++) {
        var snd = this._data.sounds[i];
        if (sounds[snd]) { this._sounds[snd] = new Audio(sounds[snd]); }
    }
};

Animator.prototype.hasAnimation = function hasAnimation (name) {
    return !!this._data.animations[name];
};

/***
 * Indexes of the sprite sheets an animation draws from.
 * @param {String} name
 * @return {Array.<Number>}
 */
Animator.prototype.sheetsFor = function sheetsFor (name) {
    if (this._animationSheets[name]) { return this._animationSheets[name]; }
    var seen = {};
    var list = [];
    var animation = this._data.animations[name];
    var frames = animation ? animation.frames : [];
    for (var i = 0; i < frames.length; i++) {
        var images = frames[i].images || [];
        for (var j = 0; j < images.length; j++) {
            var sheet = images[j][2] || 0;
            if (!seen[sheet]) {
                seen[sheet] = true;
                list.push(sheet);
            }
        }
    }
    this._animationSheets[name] = list;
    return list;
};

/***
 * Whether every sprite sheet the animation needs has downloaded.
 */
Animator.prototype.isReady = function isReady (name) {
    var sheets = this.sheetsFor(name);
    for (var i = 0; i < sheets.length; i++) {
        if (!this._loadedSheets[sheets[i]]) { return false; }
    }
    return true;
};

Animator.prototype._loadSheets = function _loadSheets (indexes) {
    var self = this;
    var pending = [];
    $.each(indexes, function (i, sheet) {
        if (self._loadedSheets[sheet]) { return; }
        pending.push(load._loadImage(self._sheets[sheet]).done(function () {
            self._loadedSheets[sheet] = true;
        }));
    });
    return $.when.apply($, pending);
};

/***
 * Download the sprite sheets an animation needs.
 * @return {jQuery.Promise}
 */
Animator.prototype.prepare = function prepare (name) {
    return this._loadSheets(this.sheetsFor(name));
};

/***
 * Download every sprite sheet.
 * @return {jQuery.Promise}
 */
Animator.prototype.prepareAll = function prepareAll () {
    var all = [];
    for (var i = 0; i < this._sheets.length; i++) { all.push(i); }
    return this._loadSheets(all);
};

Animator.prototype.exitAnimation = function exitAnimation () {
    this._exiting = true;
};

/***
 * Like exitAnimation, but when no exit branch lies ahead (Print, Save and
 * friends would otherwise run for several more seconds) skip to the final frame.
 */
Animator.prototype.interruptAnimation = function interruptAnimation () {
    var anim = this._currentAnimation;
    this._exiting = true;
    if (!anim || !this._currentFrame || anim.useExitBranching || anim.frames.length < 2 || this._atLastFrame()) { return; }
    for (var i = this._currentFrameIndex; i < anim.frames.length; i++) {
        if (anim.frames[i].exitBranch !== undefined) { return; }
    }
    this._currentFrameIndex = anim.frames.length - 2;
    this._currentFrame = anim.frames[this._currentFrameIndex];
    if (this._started && !this._paused) { this._step(); }
};

Animator.prototype.showAnimation = function showAnimation (animationName, stateChangeCallback) {
    this._exiting = false;

    if (!this.hasAnimation(animationName)) {
        return false;
    }

    this._currentAnimation = this._data.animations[animationName];
    this.currentAnimationName = animationName;

    if (!this._started) {
        this._started = true;
        this._step();
    }

    this._currentFrameIndex = 0;
    this._currentFrame = undefined;
    this._endCallback = stateChangeCallback;

    return true;
};

Animator.prototype._draw = function _draw () {
    var images = (this._currentFrame && this._currentFrame.images) || [];

    for (var i = 0; i < this._overlays.length; i++) {
        var el = this._overlays[i][0];
        if (i < images.length) {
            var image = images[i];
            var sheet = image[2] || 0;
            if (el._clippySheet !== sheet) {
                el.style.backgroundImage = "url('" + this._sheets[sheet] + "')";
                el._clippySheet = sheet;
            }
            el.style.backgroundPosition = -image[0] + 'px ' + -image[1] + 'px';
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    }
};

Animator.prototype._getNextAnimationFrame = function _getNextAnimationFrame () {
    if (!this._currentAnimation) { return undefined; }
    // No current frame. start animation.
    if (!this._currentFrame) { return 0; }
    var currentFrame = this._currentFrame;
    var branching = this._currentFrame.branching;

    if (this._exiting && currentFrame.exitBranch !== undefined) {
        return currentFrame.exitBranch;
    }
    else if (branching) {
        var rnd = Math.random() * 100;
        for (var i = 0; i < branching.branches.length; i++) {
            var branch = branching.branches[i];
            if (rnd <= branch.weight) {
                return branch.frameIndex;
            }

            rnd -= branch.weight;
        }
    }

    return this._currentFrameIndex + 1;
};

Animator.prototype._playSound = function _playSound () {
    var s = this._currentFrame.sound;
    if (!s || this.muted) { return; }
    var audio = this._sounds[s];
    if (!audio) { return; }
    try { audio.currentTime = 0; } catch (e) { /* not seekable yet */ }
    // browsers reject play() until the reader has interacted with the page
    var played = audio.play();
    if (played && played.catch) { played.catch(function () {}); }
};

Animator.prototype._atLastFrame = function _atLastFrame () {
    return this._currentFrameIndex >= this._currentAnimation.frames.length - 1;
};

Animator.prototype._step = function _step () {
    window.clearTimeout(this._loop);
    this._loop = null;
    if (!this._currentAnimation || this._paused) { return; }
    var newFrameIndex = Math.min(this._getNextAnimationFrame(), this._currentAnimation.frames.length - 1);
    var frameChanged = !this._currentFrame || this._currentFrameIndex !== newFrameIndex;
    this._currentFrameIndex = newFrameIndex;

    // always switch frame data, unless we're at the last frame of an animation with a useExitBranching flag.
    if (!(this._atLastFrame() && this._currentAnimation.useExitBranching)) {
        this._currentFrame = this._currentAnimation.frames[this._currentFrameIndex];
    }

    this._draw();
    this._playSound();

    this._loop = window.setTimeout($.proxy(this._step, this), this._currentFrame.duration);

    // fire events if the frames changed and we reached an end
    if (this._endCallback && frameChanged && this._atLastFrame()) {
        if (this._currentAnimation.useExitBranching && !this._exiting) {
            this._endCallback(this.currentAnimationName, Animator.States.WAITING);
        }
        else {
            this._endCallback(this.currentAnimationName, Animator.States.EXITED);
        }
    }
};

/***
 * Pause animation execution
 */
Animator.prototype.pause = function pause () {
    this._paused = true;
    window.clearTimeout(this._loop);
    this._loop = null;
};

/***
 * Resume animation. Does nothing unless paused, so the frame loop never runs twice.
 */
Animator.prototype.resume = function resume () {
    if (!this._paused) { return; }
    this._paused = false;
    if (this._started) { this._step(); }
};

Animator.prototype.dispose = function dispose () {
    this.pause();
    this._endCallback = undefined;
    this._sounds = {};
};

Animator.States = { WAITING: 1, EXITED: 0 };

/**************************** Balloon ************************************/

var Balloon = function Balloon (targetEl) {
    this._targetEl = targetEl;

    this._hidden = true;
    this._asking = false;
    this._paused = false;
    this._complete = null;
    this.WORD_SPEAK_TIME = 200;
    this.CLOSE_BALLOON_DELAY = 2000;
    this._BALLOON_MARGIN = 15;
    this._setup();
};

Balloon.prototype._setup = function _setup () {
    this._balloon = $('<div class="clippy-balloon"><div class="clippy-tip"></div><div class="clippy-content"></div></div>').hide();
    this._content = this._balloon.find('.clippy-content');
    // the balloon text appears word by word, so screen readers get the whole sentence from here
    this._live = $('<div class="clippy-sr" role="status" aria-live="polite"></div>');

    this._balloon.on('keydown', $.proxy(function (e) {
        if (e.key === 'Escape' && this._asking) {
            e.stopPropagation();
            this._answer(null);
        }
    }, this));

    $(document.body).append(this._balloon, this._live);
};

Balloon.prototype.reposition = function reposition () {
    var sides = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    var best = sides[0];
    var bestOverflow = Infinity;

    for (var i = 0; i < sides.length; i++) {
        this._position(sides[i]);
        var overflow = this._overflow();
        if (overflow === 0) { return; }
        if (overflow < bestOverflow) {
            best = sides[i];
            bestOverflow = overflow;
        }
    }

    // nothing fits (tiny screens): use the closest side and nudge it on screen
    this._position(best);
    var m = 5;
    var bW = this._balloon.outerWidth();
    var bH = this._balloon.outerHeight();
    var left = parseFloat(this._balloon.css('left'));
    var top = parseFloat(this._balloon.css('top'));
    this._balloon.css({
        left: Math.max(m, Math.min(left, $(window).width() - bW - m)),
        top: Math.max(m, Math.min(top, $(window).height() - bH - m))
    });
};

/***
 *
 * @param side
 * @private
 */
Balloon.prototype._position = function _position (side) {
    var r = this._targetEl[0].getBoundingClientRect();
    var bH = this._balloon.outerHeight();
    var bW = this._balloon.outerWidth();

    var left, top;
    switch (side) {
        case 'top-left':
            // right side of the balloon next to the right side of the agent
            left = r.left + r.width - bW;
            top = r.top - bH - this._BALLOON_MARGIN;
            break;
        case 'top-right':
            // left side of the balloon next to the left side of the agent
            left = r.left;
            top = r.top - bH - this._BALLOON_MARGIN;
            break;
        case 'bottom-right':
            left = r.left;
            top = r.top + r.height + this._BALLOON_MARGIN;
            break;
        case 'bottom-left':
            left = r.left + r.width - bW;
            top = r.top + r.height + this._BALLOON_MARGIN;
            break;
    }

    this._balloon
        .removeClass('clippy-top-left clippy-top-right clippy-bottom-right clippy-bottom-left')
        .addClass('clippy-' + side)
        .css({ top: top, left: left });
};

/***
 * How many pixels of the balloon fall outside the viewport.
 * @private
 */
Balloon.prototype._overflow = function _overflow () {
    var m = 5;
    var bH = this._balloon.outerHeight();
    var bW = this._balloon.outerWidth();
    var top = parseFloat(this._balloon.css('top'));
    var left = parseFloat(this._balloon.css('left'));
    var wW = $(window).width();
    var wH = $(window).height();

    return Math.max(0, m - top) + Math.max(0, m - left) +
        Math.max(0, top + bH + m - wH) + Math.max(0, left + bW + m - wW);
};

Balloon.prototype.speak = function speak (complete, text, hold) {
    this._stopWords();
    this._clearHide();
    this._asking = false;
    this._balloon.removeClass('clippy-asking');
    this._hidden = false;
    this.show();
    var c = this._content;
    // size the balloon for the whole sentence, then reveal it word by word
    c.css({ height: 'auto', width: 'auto' });
    c.text(text);
    c.height(c.height());
    c.width(c.width());
    c.text('');
    this._live.text(text);
    this.reposition();

    this._complete = complete;
    this._sayWords(text, hold);
};

/***
 * Show a balloon that waits for the reader: a heading, blue-bullet choices,
 * an optional text box, an optional checkbox and buttons. It stays open until
 * the reader answers, presses Escape, or another balloon replaces it.
 *
 * @param {Object} options
 * @param {String=} options.id         identifies the balloon (see Agent#asking)
 * @param {String=} options.title      bold heading
 * @param {String=} options.text       body text
 * @param {Array=} options.choices     [{label: String, ...}] shown as bullet choices
 * @param {Object=} options.input      {placeholder, button, label} renders a text box
 * @param {String=} options.checkbox   label for a checkbox, reported as extra.checked
 * @param {Array=} options.buttons     [{label: String, ...}] shown as push buttons
 * @param {Boolean=} options.focus     focus the first control
 * @param {Function=} options.onChoose called with (choice or null, {checked, value})
 */
Balloon.prototype.ask = function ask (options) {
    var self = this;
    this._stopWords();
    this._clearHide();
    this._asking = true;
    this._askOptions = options;
    this._hidden = false;

    var c = this._content;
    c.css({ height: 'auto', width: 'auto' }).empty();
    this._balloon.addClass('clippy-asking');

    if (options.title) {
        $('<div class="clippy-title"></div>').text(options.title).appendTo(c);
    }
    if (options.text) {
        $('<p class="clippy-text"></p>').text(options.text).appendTo(c);
    }

    if (options.choices && options.choices.length) {
        var list = $('<ul class="clippy-choices"></ul>').appendTo(c);
        $.each(options.choices, function (i, choice) {
            $('<button type="button" class="clippy-choice"></button>')
                .text(choice.label)
                .on('click', function () { self._answer(choice); })
                .appendTo($('<li></li>').appendTo(list));
        });
    }

    if (options.input) {
        var form = $('<form class="clippy-form" role="search"></form>').appendTo(c);
        // a two-line box like the original; Enter submits, Shift+Enter adds a line
        var field = $('<textarea class="clippy-input" rows="2" autocomplete="off"></textarea>')
            .attr({ placeholder: options.input.placeholder || '', 'aria-label': options.input.label || options.input.placeholder || '' })
            .on('keydown', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    form.triggerHandler('submit');
                }
            })
            .appendTo(form);
        $('<button type="submit" class="clippy-button"></button>').text(options.input.button || 'OK').appendTo(form);
        form.on('submit', function (e) {
            e.preventDefault();
            self._answer({ search: field.val() });
        });
    }

    if (options.checkbox) {
        $('<label class="clippy-check"><input type="checkbox"> <span></span></label>')
            .find('span').text(options.checkbox).end()
            .appendTo(c);
    }

    if (options.buttons && options.buttons.length) {
        var row = $('<div class="clippy-buttons"></div>').appendTo(c);
        $.each(options.buttons, function (i, button) {
            $('<button type="button" class="clippy-button"></button>')
                .text(button.label)
                .on('click', function () { self._answer(button); })
                .appendTo(row);
        });
    }

    this._live.text([options.title, options.text].join(' '));
    this._balloon.show();
    this.reposition();

    if (options.focus) {
        var target = c.find('.clippy-input');
        (target.length ? target : c.find('button')).first().trigger('focus');
    }
};

Balloon.prototype._answer = function _answer (choice) {
    var options = this._askOptions;
    if (!this._asking || !options) { return; }
    var extra = {
        checked: this._content.find('.clippy-check input').prop('checked') || false,
        value: this._content.find('.clippy-input').val() || ''
    };
    this.dismiss();
    if (options.onChoose) { options.onChoose(choice, extra); }
};

/***
 * The id of the open question balloon, or null.
 */
Balloon.prototype.asking = function asking () {
    return this._asking && !this._hidden ? (this._askOptions.id || true) : null;
};

Balloon.prototype.show = function show () {
    if (this._hidden) { return; }
    this._balloon.show();
};

/***
 * Hide the balloon. With fast=true it is only hidden until show() (used while dragging).
 */
Balloon.prototype.hide = function hide (fast) {
    if (fast) {
        this._balloon.hide();
        return;
    }

    this._clearHide();
    this._hiding = window.setTimeout($.proxy(this._finishHideBalloon, this), this.CLOSE_BALLOON_DELAY);
};

/***
 * Close the balloon now, whatever it is showing.
 */
Balloon.prototype.dismiss = function dismiss () {
    this._stopWords();
    this._clearHide();
    this._asking = false;
    this._askOptions = null;
    this._balloon.hide().removeClass('clippy-asking');
    this._content.empty();
    this._hidden = true;
};

Balloon.prototype._clearHide = function _clearHide () {
    window.clearTimeout(this._hiding);
    this._hiding = null;
};

Balloon.prototype._finishHideBalloon = function _finishHideBalloon () {
    if (this._active || this._asking) { return; }
    this._balloon.hide();
    this._hidden = true;
    this._hiding = null;
};

Balloon.prototype._sayWords = function _sayWords (text, hold) {
    this._active = true;
    this._hold = hold;
    var words = text.split(/[^\S-]/);
    var time = this.WORD_SPEAK_TIME;
    var el = this._content;
    var idx = 1;

    this._addWord = $.proxy(function () {
        if (!this._active || this._paused) { return; }
        if (idx > words.length) {
            delete this._addWord;
            this._active = false;
            if (!this._hold) {
                this._done();
                this.hide();
            }
        } else {
            el.text(words.slice(0, idx).join(' '));
            idx++;
            this._loop = window.setTimeout(this._addWord, time);
        }
    }, this);

    this._addWord();
};

/***
 * Tell the queue this balloon is finished. Runs at most once per balloon.
 */
Balloon.prototype._done = function _done () {
    var complete = this._complete;
    this._complete = null;
    if (complete) { complete(); }
};

/***
 * Stop a sentence that is still appearing and release the queue.
 */
Balloon.prototype._stopWords = function _stopWords () {
    window.clearTimeout(this._loop);
    this._loop = null;
    this._active = false;
    this._hold = false;
    delete this._addWord;
    this._done();
};

Balloon.prototype.close = function close () {
    if (this._active) {
        this._hold = false;
    } else if (this._hold) {
        this._hold = false;
        this._done();
    }
};

Balloon.prototype.pause = function pause () {
    this._paused = true;
    window.clearTimeout(this._loop);
    this._loop = null;
    this._clearHide();
};

Balloon.prototype.resume = function resume () {
    if (!this._paused) { return; }
    this._paused = false;
    if (this._addWord) {
        this._addWord();
    } else if (!this._hold && !this._hidden && !this._asking) {
        this._hiding = window.setTimeout($.proxy(this._finishHideBalloon, this), this.CLOSE_BALLOON_DELAY);
    }
};

Balloon.prototype.dispose = function dispose () {
    this.dismiss();
    this._balloon.remove();
    this._live.remove();
};

/**************************** Agent ************************************/

var Agent = function Agent (path, data, name) {
    this.path = path;
    this.name = name;
    this._data = data;
    this._handlers = {};
    this._listeners = [];
    this._hidden = true;

    this._queue = new Queue($.proxy(this._onQueueEmpty, this));

    this._el = $('<div class="clippy" tabindex="0" role="button" aria-haspopup="menu"></div>')
        .attr('aria-label', name)
        .hide();

    $(document.body).append(this._el);

    this._animator = new Animator(this._el, path, data);

    this._balloon = new Balloon(this._el);

    this._setupEvents();
};

/***
 * The agent's element (a jQuery object).
 */
Agent.prototype.element = function element () {
    return this._el;
};

/***
 * Listen for agent events: 'click' (tap, click, Enter or Space),
 * 'contextmenu' (right-click, long-press, Shift+F10) and 'move'.
 */
Agent.prototype.on = function on (name, handler) {
    (this._handlers[name] = this._handlers[name] || []).push(handler);
    return this;
};

Agent.prototype._emit = function _emit (name, data) {
    var handlers = (this._handlers[name] || []).slice();
    for (var i = 0; i < handlers.length; i++) {
        handlers[i].call(this, data || {});
    }
};

/***
 *
 * @param {Number} x
 * @param {Number} y
 */
Agent.prototype.gestureAt = function gestureAt (x, y) {
    var d = this._getDirection(x, y);
    var gAnim = 'Gesture' + d;
    var lookAnim = 'Look' + d;

    var animation = this.hasAnimation(gAnim) ? gAnim : lookAnim;
    return this.play(animation);
};

/***
 *
 * @param {Boolean=} fast
 *
 */
Agent.prototype.hide = function hide (fast, callback) {
    var self = this;
    this._hidden = true;
    this.stop();
    // Hide takes over the animator, so the item the queue was waiting on will never finish
    this._queue.reset();
    window.clearTimeout(this._idleTimer);
    this._balloon.dismiss();
    if (fast || !this.hasAnimation('Hide')) {
        this._el.hide();
        this.pause();
        if (callback) { callback(); }
        return;
    }

    return this._playInternal('Hide', function () {
        self._el.hide();
        self.pause();
        if (callback) { callback(); }
    });
};

Agent.prototype.isVisible = function isVisible () {
    return !this._hidden;
};

/***
 * Place the agent without animating (viewport coordinates).
 */
Agent.prototype.setPosition = function setPosition (left, top) {
    this._el.css({ left: left, top: top });
    this._positioned = true;
    this.reposition();
};

Agent.prototype.moveTo = function moveTo (x, y, duration) {
    var self = this;
    var dir = this._getDirection(x, y);
    var anim = 'Move' + dir;
    if (duration === undefined) { duration = 1000; }

    this._addToQueue(function (complete) {
        // the simple case
        if (duration === 0) {
            self._el.css({ top: y, left: x });
            self.reposition();
            complete();
            return;
        }

        // no animations
        if (!self.hasAnimation(anim)) {
            self._el.animate({ top: y, left: x }, duration, complete);
            return;
        }

        self._animator.prepare(anim).always(function () {
            var callback = function (name, state) {
                // when exited, complete
                if (state === Animator.States.EXITED) {
                    complete();
                }
                // if waiting,
                if (state === Animator.States.WAITING) {
                    self._el.animate({ top: y, left: x }, duration, function () {
                        // after we're done with the movement, do the exit animation
                        self._animator.exitAnimation();
                    });
                }
            };

            self._playInternal(anim, callback);
        });
    });
};

Agent.prototype._playInternal = function _playInternal (animation, callback) {

    // if we're inside an idle animation,
    if (this._isIdleAnimation() && this._idleDfd && this._idleDfd.state() === 'pending') {
        this._idleDfd.done($.proxy(function () {
            this._playInternal(animation, callback);
        }, this));
    }

    this._animator.showAnimation(animation, callback);
};

Agent.prototype.play = function play (animation, timeout, cb) {
    if (!this.hasAnimation(animation)) { return false; }

    if (timeout === undefined) { timeout = 5000; }

    var self = this;
    this._addToQueue(function (complete) {
        var completed = false;
        var finish = function () {
            if (completed) { return; }
            completed = true;
            if (cb) { cb(); }
            complete();
        };

        self._animator.prepare(animation).always(function () {
            // the sprite sheet failed to download: skip the animation rather than stall
            if (!self._animator.isReady(animation)) {
                finish();
                return;
            }

            // if has timeout, register a timeout function
            if (timeout) {
                window.setTimeout(function () {
                    if (completed) { return; }
                    // exit after timeout
                    self._animator.exitAnimation();
                }, timeout);
            }

            self._playInternal(animation, function (name, state) {
                if (state === Animator.States.EXITED) { finish(); }
            });
        });
    });

    return true;
};

/***
 * Play the first animation in the list this agent has.
 * @return {Boolean} whether one was queued
 */
Agent.prototype.playFirst = function playFirst (animations, timeout, cb) {
    for (var i = 0; i < animations.length; i++) {
        if (this.play(animations[i], timeout, cb)) { return true; }
    }
    return false;
};

/***
 *
 * @param {Boolean=} fast
 */
Agent.prototype.show = function show (fast) {

    this._hidden = false;
    if (!this._positioned) {
        // bottom right, but never off the edge of a small screen
        var size = this._data.framesize;
        var wW = $(window).width();
        var wH = $(window).height();
        this._el.css({
            left: Math.max(5, Math.min(wW * 0.8, wW - size[0] - 10)),
            top: Math.max(5, Math.min(wH * 0.8, wH - size[1] - 10))
        });
        this._positioned = true;
    }

    if (fast) {
        this._el.show();
        this.resume();
        this._onQueueEmpty();
        return;
    }

    this.resume();
    var queued = this.play('Show');
    // shown in a background tab: wait until the reader can see it
    if (document.hidden) { this._onVisibilityChange(); }
    return queued;
};

/***
 *
 * @param {String} text
 */
Agent.prototype.speak = function speak (text, hold) {
    var self = this;
    this._addToQueue(function (complete) {
        self._balloon.speak(complete, text, hold);
    });
};

/***
 * Queue a question balloon. See Balloon#ask for the options. The queue moves
 * on straight away, so the agent keeps idling while the reader decides.
 * With now=true the balloon opens straight away instead of waiting its turn.
 */
Agent.prototype.ask = function ask (options, now) {
    var self = this;
    if (now) {
        // open it immediately, cutting off whatever the agent was saying
        this.interrupt();
        this._balloon.ask(options);
        return;
    }
    this._addToQueue(function (complete) {
        self._balloon.ask(options);
        complete();
    });
};

/***
 * Drop queued actions, cut the current sentence short and let the current
 * animation exit, so whatever is queued next happens straight away.
 */
Agent.prototype.interrupt = function interrupt () {
    this._queue.clear();
    this._animator.interruptAnimation();
    this._balloon.dismiss();
};

/***
 * The id of the open question balloon, or null.
 */
Agent.prototype.asking = function asking () {
    return this._balloon.asking();
};

/***
 * Run a function once everything queued before it has finished.
 */
Agent.prototype.enqueue = function enqueue (fn) {
    this._addToQueue(function (complete) {
        fn();
        complete();
    });
};

/***
 * Close the current balloon
 */
Agent.prototype.closeBalloon = function closeBalloon () {
    this._balloon.dismiss();
};

Agent.prototype.delay = function delay (time) {
    var self = this;
    time = time || 250;

    this._addToQueue(function (complete) {
        self._onQueueEmpty();
        window.setTimeout(complete, time);
    });
};

/***
 * Skips the current animation
 */
Agent.prototype.stopCurrent = function stopCurrent () {
    this._animator.exitAnimation();
    this._balloon.close();
};

Agent.prototype.stop = function stop () {
    // clear the queue
    this._queue.clear();
    this._animator.exitAnimation();
    this._balloon.hide();
};

/***
 *
 * @param {String} name
 * @returns {Boolean}
 */
Agent.prototype.hasAnimation = function hasAnimation (name) {
    return this._animator.hasAnimation(name);
};

/***
 * Gets a list of animation names
 *
 * @return {Array.<string>}
 */
Agent.prototype.animations = function animations () {
    return this._animator.animations();
};

/***
 * Play a random animation (not an idle, Show, Hide or RestPose).
 */
Agent.prototype.animate = function animate () {
    var animations = $.grep(this.animations(), function (a) {
        return a.indexOf('Idle') !== 0 && a !== 'Show' && a !== 'Hide' && a !== 'RestPose';
    });
    var anim = animations[Math.floor(Math.random() * animations.length)];
    return this.play(anim);
};

/***
 * Download the rest of the sprite sheets in the background.
 */
Agent.prototype.prefetch = function prefetch () {
    return this._animator.prepareAll();
};

/***
 * Turn sounds on or off. Sound data is only downloaded after the reader's
 * first click or key press, since browsers won't play it before then anyway.
 */
Agent.prototype.setSounds = function setSounds (enabled) {
    var self = this;
    this._animator.muted = !enabled;
    if (!enabled || this._soundsRequested) { return; }

    var request = function () {
        self._removeSoundListeners();
        if (self._soundsRequested) { return; }
        self._soundsRequested = true;
        load._loadSounds(self.name, self.path).done(function (sounds) {
            self._animator.setSounds(sounds);
        });
    };

    if (navigator.userActivation && navigator.userActivation.hasBeenActive) {
        request();
        return;
    }

    this._removeSoundListeners();
    this._soundListener = request;
    window.addEventListener('pointerdown', request, true);
    window.addEventListener('keydown', request, true);
};

Agent.prototype._removeSoundListeners = function _removeSoundListeners () {
    if (!this._soundListener) { return; }
    window.removeEventListener('pointerdown', this._soundListener, true);
    window.removeEventListener('keydown', this._soundListener, true);
    this._soundListener = null;
};

/***
 * Remove the agent from the page and stop all of its timers.
 */
Agent.prototype.dispose = function dispose () {
    this._hidden = true;
    this.stop();
    this._queue.reset();
    this.pause();
    window.clearTimeout(this._idleTimer);
    this._cancelPress();
    window.cancelAnimationFrame(this._dragFrame);
    this._removeSoundListeners();
    for (var i = 0; i < this._listeners.length; i++) {
        var l = this._listeners[i];
        l[0].removeEventListener(l[1], l[2]);
    }
    this._listeners = [];
    this._balloon.dispose();
    this._animator.dispose();
    this._el.remove();
    this._handlers = {};
};

/**************************** Utils ************************************/

/***
 *
 * @param {Number} x
 * @param {Number} y
 * @return {String}
 * @private
 */
Agent.prototype._getDirection = function _getDirection (x, y) {
    var offset = this._el.offset();
    var h = this._el.height();
    var w = this._el.width();

    var centerX = (offset.left + w / 2);
    var centerY = (offset.top + h / 2);

    var a = centerY - y;
    var b = centerX - x;

    var r = Math.round((180 * Math.atan2(a, b)) / Math.PI);

    // Left and Right are for the character, not the screen :-/
    if (-45 <= r && r < 45) { return 'Right'; }
    if (45 <= r && r < 135) { return 'Up'; }
    if (135 <= r && r <= 180 || -180 <= r && r < -135) { return 'Left'; }
    if (-135 <= r && r < -45) { return 'Down'; }

    // sanity check
    return 'Top';
};

/**************************** Queue and Idle handling ************************************/

/***
 * Handle empty queue.
 * We need to transition the animation to an idle state
 * @private
 */
Agent.prototype._onQueueEmpty = function _onQueueEmpty () {
    if (this._hidden || this._isIdleAnimation()) { return; }
    this._playIdle();
};

Agent.prototype._playIdle = function _playIdle () {
    var idleAnim = this._getIdleAnimation();
    if (!idleAnim) { return; }
    this._idleDfd = $.Deferred();

    this._animator.showAnimation(idleAnim, $.proxy(this._onIdleComplete, this));
};

Agent.prototype._onIdleComplete = function _onIdleComplete (name, state) {
    if (state !== Animator.States.EXITED) { return; }
    this._idleDfd.resolve();

    // like the real assistants, drift into another idle after a little while
    var self = this;
    window.clearTimeout(this._idleTimer);
    this._idleTimer = window.setTimeout(function () {
        if (!self._hidden && !self._queue._active && self._animator.currentAnimationName === name) {
            self._playIdle();
        }
    }, 2000 + Math.random() * 4000);
};

/***
 * Is the current animation is Idle?
 * @return {Boolean}
 * @private
 */
Agent.prototype._isIdleAnimation = function _isIdleAnimation () {
    var c = this._animator.currentAnimationName;
    return c && c.indexOf('Idle') === 0;
};

/**
 * Gets a random Idle animation whose sprite sheets have downloaded
 * @return {String}
 * @private
 */
Agent.prototype._getIdleAnimation = function _getIdleAnimation () {
    var animator = this._animator;
    var r = $.grep(this.animations(), function (a) {
        return a.indexOf('Idle') === 0 && animator.isReady(a);
    });
    if (!r.length) { return this.hasAnimation('RestPose') ? 'RestPose' : undefined; }

    return r[Math.floor(Math.random() * r.length)];
};

/**************************** Events ************************************/

Agent.prototype._listen = function _listen (target, type, handler) {
    target.addEventListener(type, handler);
    this._listeners.push([target, type, handler]);
};

Agent.prototype._setupEvents = function _setupEvents () {
    var el = this._el[0];
    this._listen(window, 'resize', $.proxy(this.reposition, this));
    this._listen(document, 'visibilitychange', $.proxy(this._onVisibilityChange, this));

    el.addEventListener('pointerdown', $.proxy(this._onPointerDown, this));
    el.addEventListener('contextmenu', $.proxy(this._onContextMenu, this));
    el.addEventListener('keydown', $.proxy(this._onKeyDown, this));
};

Agent.prototype._onVisibilityChange = function _onVisibilityChange () {
    if (document.hidden) {
        if (!this._hidden && !this._pausedForVisibility) {
            this._pausedForVisibility = true;
            this.pause();
        }
    } else if (this._pausedForVisibility) {
        this._pausedForVisibility = false;
        if (!this._hidden && !this._dragging) { this.resume(); }
    }
};

Agent.prototype._onKeyDown = function _onKeyDown (e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._emit('click', { keyboard: true });
    } else if (e.key === 'F10' && e.shiftKey) {
        e.preventDefault();
        var r = this._el[0].getBoundingClientRect();
        this._emit('contextmenu', { x: r.left, y: r.top, keyboard: true });
    }
};

Agent.prototype._onContextMenu = function _onContextMenu (e) {
    e.preventDefault();
    var press = this._press;
    if (press) {
        // a touch long-press: the browser's own contextmenu beat our timer
        window.clearTimeout(press.timer);
        if (press.longPress) { return; }
        press.longPress = true;
    }
    var keyboard = !e.clientX && !e.clientY;
    var r = this._el[0].getBoundingClientRect();
    this._emit('contextmenu', {
        x: keyboard ? r.left : e.clientX,
        y: keyboard ? r.top : e.clientY,
        keyboard: keyboard
    });
};

Agent.prototype.reposition = function reposition () {
    if (!this._el.is(':visible')) { return; }
    var r = this._el[0].getBoundingClientRect();
    var wW = $(window).width();
    var wH = $(window).height();
    var m = 5;

    this._el.css({
        left: Math.max(m, Math.min(r.left, wW - r.width - m)),
        top: Math.max(m, Math.min(r.top, wH - r.height - m))
    });
    // reposition balloon
    this._balloon.reposition();
    this._emit('move');
};

/**************************** Drag ************************************/

Agent.prototype._onPointerDown = function _onPointerDown (e) {
    if (e.button !== 0 || this._press) { return; }
    e.preventDefault();

    var self = this;
    var el = this._el[0];
    var r = el.getBoundingClientRect();
    this._press = {
        id: e.pointerId,
        type: e.pointerType,
        x: e.clientX,
        y: e.clientY,
        dx: e.clientX - r.left,
        dy: e.clientY - r.top,
        dragging: false,
        longPress: false
    };

    // touch screens have no right button: a long press opens the menu instead
    if (e.pointerType !== 'mouse') {
        this._press.timer = window.setTimeout(function () {
            var press = self._press;
            if (!press || press.dragging || press.longPress) { return; }
            press.longPress = true;
            self._emit('contextmenu', { x: press.x, y: press.y });
        }, 600);
    }

    try { el.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
    this._moveHandle = $.proxy(this._onPointerMove, this);
    this._upHandle = $.proxy(this._onPointerUp, this);
    el.addEventListener('pointermove', this._moveHandle);
    el.addEventListener('pointerup', this._upHandle);
    el.addEventListener('pointercancel', this._upHandle);
};

Agent.prototype._onPointerMove = function _onPointerMove (e) {
    var press = this._press;
    if (!press || e.pointerId !== press.id) { return; }

    if (!press.dragging) {
        // small wobbles still count as a click
        if (Math.abs(e.clientX - press.x) + Math.abs(e.clientY - press.y) < 6 || press.longPress) { return; }
        press.dragging = true;
        window.clearTimeout(press.timer);
        this._startDrag();
    }

    this._targetX = e.clientX - press.dx;
    this._targetY = e.clientY - press.dy;
    if (!this._dragFrame) {
        this._dragFrame = window.requestAnimationFrame($.proxy(this._updateLocation, this));
    }
};

Agent.prototype._onPointerUp = function _onPointerUp (e) {
    var press = this._press;
    if (!press || e.pointerId !== press.id) { return; }
    this._cancelPress();

    if (press.dragging) {
        this._finishDrag();
    } else if (!press.longPress && e.type === 'pointerup') {
        this._emit('click', { x: e.clientX, y: e.clientY, pointerType: press.type });
    }
};

Agent.prototype._cancelPress = function _cancelPress () {
    var press = this._press;
    if (!press) { return; }
    var el = this._el[0];
    window.clearTimeout(press.timer);
    el.removeEventListener('pointermove', this._moveHandle);
    el.removeEventListener('pointerup', this._upHandle);
    el.removeEventListener('pointercancel', this._upHandle);
    try { el.releasePointerCapture(press.id); } catch (err) { /* already released */ }
    this._press = null;
};

Agent.prototype._startDrag = function _startDrag () {
    // pause animations
    this._dragging = true;
    this.pause();
    this._balloon.hide(true);
};

Agent.prototype._updateLocation = function _updateLocation () {
    this._dragFrame = null;
    this._el.css({ top: this._targetY, left: this._targetX });
    this._emit('move');
};

Agent.prototype._finishDrag = function _finishDrag () {
    window.cancelAnimationFrame(this._dragFrame);
    this._updateLocation();
    this._dragging = false;
    // resume animations
    this._balloon.show();
    this.reposition();
    if (!document.hidden) { this.resume(); }
};

Agent.prototype._addToQueue = function _addToQueue (func, scope) {
    if (scope) { func = $.proxy(func, scope); }
    this._queue.queue(func);
};

/**************************** Pause and Resume ************************************/

Agent.prototype.pause = function pause () {
    this._animator.pause();
    this._balloon.pause();
};

Agent.prototype.resume = function resume () {
    this._animator.resume();
    this._balloon.resume();
};

/**************************** Loading ************************************/

/***
 * Load an agent: its animation data and core sprite sheet. Sounds and the
 * remaining sprite sheets are fetched later, when needed.
 */
var load = function load (name, successCb, failCb, base_path) {
    base_path = base_path || window.CLIPPY_CDN || '/agents/';

    var path = base_path + name;
    load.data(name, base_path)
        .done(function (data) {
            successCb(new Agent(path, data, name));
        })
        .fail(function (err) {
            if (failCb) { failCb(err); }
        });
};

/***
 * Fetch an agent's animation data and core sprite sheet without creating an
 * agent, e.g. to preview it with a bare Animator.
 * @return {jQuery.Promise} resolves with the animation data
 */
load.data = function data (name, base_path) {
    base_path = base_path || window.CLIPPY_CDN || '/agents/';
    var path = base_path + name;
    return load._loadAgent(name, path).then(function (agentData) {
        var sheets = agentData.sheets || ['map.png'];
        return load._loadImage(path + '/' + sheets[0]).then(function () { return agentData; });
    });
};

load._loadImage = function _loadImage (src) {
    var dfd = load._images[src];
    if (dfd) { return dfd.promise(); }

    dfd = load._images[src] = $.Deferred();
    var img = new Image();
    img.onload = function () { dfd.resolve(img); };
    img.onerror = function () {
        // forget the failure so a later request can retry
        delete load._images[src];
        dfd.reject(src);
    };
    img.src = src;

    return dfd.promise();
};

load._loadSounds = function _loadSounds (name, path) {
    var dfd = load._sounds[name];
    if (dfd) { return dfd.promise(); }

    dfd = load._sounds[name] = $.Deferred();

    var audio = document.createElement('audio');
    if (!audio.canPlayType || !audio.canPlayType('audio/mpeg')) {
        dfd.resolve({});
    } else {
        load._loadScript(path + '/sounds-mp3.js', function () { dfd.resolve({}); });
    }

    return dfd.promise();
};

load._loadAgent = function _loadAgent (name, path) {
    var dfd = load._getAgentDfd(name);
    if (!load._requested[name]) {
        load._requested[name] = true;
        load._loadScript(path + '/agent.js', function () {
            delete load._requested[name];
            delete load._data[name];
            dfd.reject(path + '/agent.js');
        });
    }
    return dfd.promise();
};

load._loadScript = function _loadScript (src, onError) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    if (onError) { script.onerror = onError; }

    document.head.appendChild(script);
};

load._getAgentDfd = function _getAgentDfd (name) {
    var dfd = load._data[name];
    if (!dfd) {
        dfd = load._data[name] = $.Deferred();
    }
    return dfd;
};

load._images = {};
load._sounds = {};
load._data = {};
load._requested = {};

function ready (name, data) {
    var dfd = load._getAgentDfd(name);
    dfd.resolve(data);
}

function soundsReady (name, data) {
    var dfd = load._sounds[name];
    if (!dfd) {
        dfd = load._sounds[name] = $.Deferred();
    }

    dfd.resolve(data);
}

var clippy = {
    Agent: Agent,
    Animator: Animator,
    Queue: Queue,
    Balloon: Balloon,
    load: load,
    ready: ready,
    soundsReady: soundsReady
};

if (typeof window !== 'undefined') {
    window.clippy = clippy;
}

return clippy;

})));
