(function ($, window, document, undefined) {
  "use strict";

  // private methods
  var priv = {
    use: function (fn, obj, args) {
      args = args || [];
      return priv[fn].apply(obj, args);
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

    rebuild: function () {
      var self = this;

      self.opts.panelWidth = self.optsDefault.panelWidth || self.$elem.data("panel-width") || self.$elem.width() * 0.7;

      if (typeof self.opts.panelWidth === "string" && self.opts.panelWidth.substring(self.opts.panelWidth.length - 1) === "%") {
        self.opts.panelWidth = parseInt(self.opts.panelWidth, 10) / 100 * self.$elem.width();
      }

      if (self.opts.panelWidth > self.$elem.width()) {
        self.opts.panelWidth = self.$elem.width() * 0.7;
      }

      self.opts.panelWidth = Math.ceil(self.opts.panelWidth);

      self.opts.teaserCollapsedWidth = Math.ceil((self.$elem.width() - self.opts.panelWidth - self.opts.gapMin * (self.$panels.length - 1)) / (self.$panels.length - 1));
      self.opts.teaserExpandedWidth = Math.ceil((self.$elem.width() - self.opts.gapMax * (self.$panels.length - 1)) / self.$panels.length);
      self.opts.coords = [];

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
    self.opts         = $.extend({}, $.fn.hoHoAcc.options, opts);
    self.optsDefault  = $.extend({}, $.fn.hoHoAcc.options, opts);
    self.$elem        = $(elem);
    self.$panels      = [];

    self.$elem.children(".panel").each(function () {
      self.$panels.push($(this));
    });

    self.opts.panelWidth = self.opts.panelWidth || self.$elem.data("panel-width") || self.$elem.width() * 0.7;

    if (typeof self.opts.panelWidth === "string" && self.opts.panelWidth.substring(self.opts.panelWidth.length - 1) === "%") {
      self.opts.panelWidth = parseInt(self.opts.panelWidth, 10) / 100 * self.$elem.width();
    }

    if (self.opts.panelWidth > self.$elem.width()) {
      self.opts.panelWidth = self.$elem.width() * 0.7;
    }

    self.opts.panelWidth = Math.floor(self.opts.panelWidth);

    self.opts.teaserCollapsedWidth = Math.floor((self.$elem.width() - self.opts.panelWidth - self.opts.gapMin * (self.$panels.length - 1)) / (self.$panels.length - 1));
    self.opts.teaserExpandedWidth = Math.floor((self.$elem.width() - self.opts.gapMax * (self.$panels.length - 1)) / self.$panels.length);
    self.opts.coords = [];

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
    panelWidth: 0,
    gapMin: 0,
    gapMax: 0,
    speed: 200,
    easing: "swing"
  };
}(window.jQuery, window, document));