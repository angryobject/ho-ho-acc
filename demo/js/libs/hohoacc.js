/*!
 * HoHoAcc jQuery accordeon plugin.
 *
 * Copyright (c) 2012, Max Shishkin.
 * Licensed under the MIT license.
 */

(function ($, window, document, undefined) {
  "use strict";

  // private methods
  var priv = {
    use: function (fn, obj, args) {
      args = args || [];
      return priv[fn].apply(obj, args);
    },

    parseOpts: function (userOpts) {
      var self = this,
        opts = {},
        userOpts = userOpts || {};

      opts.panelWidth = self.$elem.data("panelwidth") || userOpts.panelWidth || $.fn.hoHoAcc.options.panelWidth;
      opts.easing = self.$elem.data("easing") || userOpts.easing || $.fn.hoHoAcc.options.easing;

      opts.gapMin = parseInt(self.$elem.data("gapmin"), 10);

      if (isNaN(opts.gapMin)) {
        opts.gapMin = userOpts.gapMin >= 0 ? userOpts.gapMin :
                      $.fn.hoHoAcc.options.gapMin;
      }

      opts.gapMax = parseInt(self.$elem.data("gapmax"), 10);

      if (isNaN(opts.gapMax)) {
        opts.gapMax = userOpts.gapMax >= 0 ? userOpts.gapMax :
                      $.fn.hoHoAcc.options.gapMax;
      }

      opts.speed = parseInt(self.$elem.data("speed"), 10);

      if (isNaN(opts.speed)) {
        opts.speed = userOpts.speed >= 0 ? userOpts.speed :
                      $.fn.hoHoAcc.options.speed;
      }

      return opts;
    },

    processOpts: function() {
      var self = this;

      if (typeof self.opts.panelWidth === "string") {
        if(self.opts.panelWidth.substring(self.opts.panelWidth.length - 1) === "%") {
          self.opts.panelWidth = parseInt(self.opts.panelWidth, 10) / 100 * self.$elem.width();
        } else {
          self.opts.panelWidth = parseInt(self.opts.panelWidth, 10);
        }
      }

      if (self.opts.panelWidth > self.$elem.width()) {
        self.opts.panelWidth = self.$elem.width() * 0.7;
      }

      self.opts.panelWidth = Math.floor(self.opts.panelWidth);

      self.opts.teaserCollapsedWidth = Math.floor((self.$elem.width() - self.opts.panelWidth - self.opts.gapMin * (self.$panels.length - 1)) / (self.$panels.length - 1));
      self.opts.teaserExpandedWidth = Math.floor((self.$elem.width() - self.opts.gapMax * (self.$panels.length - 1)) / self.$panels.length);
      self.opts.coords = [];
    },

    initContentContainers: function () {
      var self = this,
        container;

      $.each(self.$panels, function () {
        container = $("<div class=\"content\"></div>");
        container.html(this.html());
        this.html(container);
      });
    },

    layoutContentContainers: function () {
      var self = this,
        container;

      $.each(self.$panels, function () {
        container = this.children(".content");

        container.css({
          width: self.opts.panelWidth
        });

        if (this.hasClass("panel-centered")) {
          container.css("left", -self.opts.panelWidth / 2);
        } else if (this.hasClass("panel-righted")) {
          container.css("left", -self.opts.panelWidth);
        }
      });
    },

    adjustPanelsSize: function () {
      var self = this,
        height = self.$elem.height();

      if (height === 0) {
        $.each(self.$panels, function () {
          height = Math.max(this.outerHeight(), height);
        });

        self.$elem.height(height);
      }

      $.each(self.$panels, function () {
        this.css({
          width: self.opts.teaserExpandedWidth,
          height: height
        });
      });
    },

    addPanelClasses: function () {
      var self = this;

      $.each(self.$panels, function (index) {
        this.addClass("panel" + (index + 1));
      });
    },

    layoutPanels: function () {
      var self = this;

      $.each(self.$panels, function (index) {
        this.css({
          left: index * (self.opts.teaserExpandedWidth + self.opts.gapMax),
          "z-index": self.$panels.length - index
        });
      });
    },

    cacheCoords: function () {
      var self = this;

      $.each(self.$panels, function (index) {
        self.opts.coords[index] = parseInt(this.css("left"), 10);
      });
    },

    addListeners: function () {
      var self = this;

      $.each(self.$panels, function (index) {
        this.on("mouseenter", function () {
          self.expandPanel(index);
        }).on("mouseleave", function () {
          self.collapsePanel(index);
        });
      });
    },

    indexBounds: function (index) {
      var self = this;
      return ((index >= 0) && (index < self.$panels.length));
    }
  };

  // public methods
  var api = {
    expandPanel: function (index) {
      var self = this,
        expandIndex = index,
        coords = self.opts.coords,
        deltaWidth = self.opts.teaserExpandedWidth - self.opts.teaserCollapsedWidth,
        deltaCount = 0,
        gapDelta = self.opts.gapMax - self.opts.gapMin,
        moveLeft = true,
        width,
        left,
        e;

      if (!priv.use("indexBounds", self, [index])) {
        return;
      }

      e = $.Event("expandPanelStart");
      e.panel = self.$panels[expandIndex];
      e.panelIndex = expandIndex;
      self.$elem.trigger(e);

      $.each(self.$panels, function (index) {
        if (index !== expandIndex) {
          width = self.opts.teaserCollapsedWidth;
          if (moveLeft) {
            this.addClass("panel-left");
            left = coords[index] - deltaCount;
            deltaCount += deltaWidth + gapDelta;
          } else {
            this.addClass("panel-right");
            left = coords[index] + deltaCount;
            deltaCount -= (deltaWidth + gapDelta);
          }
        } else {
          this.addClass("active");
          width = self.opts.panelWidth;
          left = coords[index] - deltaCount;
          moveLeft = false;
          deltaCount = self.opts.panelWidth - self.opts.teaserExpandedWidth - deltaCount - gapDelta;
        }

        this.stop().animate({
          width: width,
          left: left
        }, self.opts.speed, self.opts.easing);
      });

      e = $.Event("expandPanelEnd");
      e.panel = self.$panels[expandIndex];
      e.panelIndex = expandIndex;
      self.$elem.trigger(e);
    },

    collapsePanel: function (index) {
      var self = this,
        coords = self.opts.coords,
        e;

      if (!priv.use("indexBounds", self, [index])) {
        return;
      }

      e = $.Event("collapsePanelStart");
      e.panel = self.$panels[index];
      e.panelIndex = index;
      self.$elem.trigger(e);

      $.each(self.$panels, function (index) {
        this.removeClass("active panel-left panel-right");
        this.stop().animate({
          width: self.opts.teaserExpandedWidth,
          left: coords[index]
        }, self.opts.speed, self.opts.easing);
      });

      e = $.Event("collapsePanelEnd");
      e.panel = self.$panels[index];
      e.panelIndex = index;
      self.$elem.trigger(e);

    },

    rebuild: function (opts) {
      var self = this,
        opts = opts || {};

      self.optsDefault = $.extend({}, self.optsDefault, opts);
      self.opts = $.extend({}, self.optsDefault);

      priv.use("processOpts", self);
      priv.use("layoutContentContainers", self);
      priv.use("adjustPanelsSize", self);
      priv.use("layoutPanels", self);
      priv.use("cacheCoords", self);
    }
  };

  // constructor function
  var HoHoAcc = function (opts, elem) {
    var self = this;

    self.elem         = elem;
    self.$elem        = $(elem);
    self.optsDefault  = priv.use("parseOpts", self, [opts]);
    self.opts         = $.extend({}, self.optsDefault);

    self.$panels      = [];

    self.$elem.children(".panel").each(function () {
      self.$panels.push($(this));
    });

    priv.use("processOpts", self);
    priv.use("initContentContainers", self);
    priv.use("layoutContentContainers", self);
    priv.use("adjustPanelsSize", self);
    priv.use("addPanelClasses", self);
    priv.use("layoutPanels", self);
    priv.use("cacheCoords", self);
    priv.use("addListeners", self);
  };

  // prototype assignment
  HoHoAcc.prototype = api;

  // jQuery function
  $.fn.hoHoAcc = function (opts) {
    return this.each(function () {
      var hoHoAcc = new HoHoAcc(opts, this);
      $.data(this, 'hoHoAcc', hoHoAcc);
    });
  };

  // default options
  $.fn.hoHoAcc.options = {
    panelWidth: "70%",
    gapMin: 0,
    gapMax: 0,
    speed: 200,
    easing: "swing"
  };
}(window.jQuery, window, document));