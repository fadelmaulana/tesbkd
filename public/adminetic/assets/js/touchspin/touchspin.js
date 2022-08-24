(function($) {
  'use strict';
  var _currentSpinnerId = 0;
  function _scopedEventName(name, id) {
    return name + '.touchspin_' + id; 
  }
  function _scopeEventNames(names, id) {
    return $.map(names, function(name) {
      return _scopedEventName(name, id);
    });
  }
  $.fn.TouchSpin = function(options) {
    if (options === 'destroy') {
      this.each(function() {
        var originalinput = $(this),
        originalinput_data = originalinput.data();
        $(document).off(_scopeEventNames([
          'mouseup',
          'touchend',
          'touchcancel',
          'mousemove',
          'touchmove',
          'scroll',
          'scrollstart'], originalinput_data.spinnerid).join(' '));
      });
      return;
    }
    var defaults = {
      min: 0,
      max: 100,
      initval: '',
      replacementval: '',
      step: 1,
      decimals: 0,
      stepinterval: 100,
      forcestepdivisibility: 'round', // none | floor | round | ceil
      stepintervaldelay: 500,
      verticalbuttons: false,
      verticalupclass: 'fa fa-chevron-up',
      verticaldownclass: 'fa fa-chevron-down',
      prefix: '',
      postfix: '',
      prefix_extraclass: '',
      postfix_extraclass: '',
      booster: true,
      boostat: 10,
      maxboostedstep: false,
      mousewheel: true,
      buttondown_class: 'btn btn-light btn-square',
      buttonup_class: 'btn btn-light btn-square',
      buttondown_txt: '-',
      buttonup_txt: '+'
    };
    var attributeMap = {
      min: 'min',
      max: 'max',
      initval: 'init-val',
      replacementval: 'replacement-val',
      step: 'step',
      decimals: 'decimals',
      stepinterval: 'step-interval',
      verticalbuttons: 'vertical-buttons',
      verticalupclass: 'vertical-up-class',
      verticaldownclass: 'vertical-down-class',
      forcestepdivisibility: 'force-step-divisibility',
      stepintervaldelay: 'step-interval-delay',
      prefix: 'prefix',
      postfix: 'postfix',
      prefix_extraclass: 'prefix-extra-class',
      postfix_extraclass: 'postfix-extra-class',
      booster: 'booster',
      boostat: 'boostat',
      maxboostedstep: 'max-boosted-step',
      mousewheel: 'mouse-wheel',
      buttondown_class: 'button-down-class',
      buttonup_class: 'button-up-class',
      buttondown_txt: 'button-down-txt',
      buttonup_txt: 'button-up-txt'
    };
    return this.each(function() {
    var unors,
      originalinput = $(this),
      originalinput_data = originalinput.data(),
      container,
      elements,
      value,
      downSpinTimer,
      upSpinTimer,
      downDelayTimeout,
      upDelayTimeout,
      spincount = 0,
      spinning = false;
      init();
    function init() {
      if (originalinput.data('alreadyinitialized')) {
        return;
      }
      originalinput.data('alreadyinitialized', true);
      _currentSpinnerId += 1;
      originalinput.data('spinnerid', _currentSpinnerId);
      if (!originalinput.is('input')) {
        console.log('Must be an input.');
        return;
      }
      _initUnOrs();
      _setInitval();
      _checkValue();
      _buildHtml();
      _initElements();
      _hideEmptyPrefixPostfix();
      _bindEvents();
      _bindEventsInterface();
      elements.input.css('display', 'block');
      }
      function _setInitval() {
        if (unors.initval !== '' && originalinput.val() === '') {
          originalinput.val(unors.initval);
        }
      }
      function changeUnOrs(newunors) {
        _updateUnOrs(newunors);
        _checkValue();
        var value = elements.input.val();
        if (value !== '') {
          value = Number(elements.input.val());
          elements.input.val(value.toFixed(unors.decimals));
        }
      }
      function _initUnOrs() {
        unors = $.extend({}, defaults, originalinput_data, _parseAttributes(), options);
      }
      function _parseAttributes() {
        var data = {};
        $.each(attributeMap, function(key, value) {
          var attrName = 'bts-' + value + '';
          if (originalinput.is('[data-' + attrName + ']')) {
            data[key] = originalinput.data(attrName);
          }
        });
        return data;
      }
      function _updateUnOrs(newunors) {
        unors = $.extend({}, unors, newunors);
      }
      function _buildHtml() {
        var initval = originalinput.val(),
        parentelement = originalinput.parent();
        if (initval !== '') {
          initval = Number(initval).toFixed(unors.decimals);
        }
        originalinput.data('initvalue', initval).val(initval);
        originalinput.addClass('form-control');
        if (parentelement.hasClass('input-group')) {
          _advanceInputGroup(parentelement);
        }
        else {
          _buildInputGroup();
        }
      }
      function _advanceInputGroup(parentelement) {
        parentelement.addClass('bootstrap-touchspin');
        var prev = originalinput.prev(),
        next = originalinput.next();
        var downhtml,
        uphtml,
        prefixhtml = '<span class="input-group-text bootstrap-touchspin-prefix">' + unors.prefix + '</span>',
        postfixhtml = '<span class="input-group-text bootstrap-touchspin-postfix">' + unors.postfix + '</span>';
        if (prev.hasClass('input-group-btn')) {
          downhtml = '<button class="' + unors.buttondown_class + ' bootstrap-touchspin-down" type="button">' + unors.buttondown_txt + '</button>';
          prev.append(downhtml);
        }
        else {
          downhtml = '<button class="' + unors.buttondown_class + ' bootstrap-touchspin-down" type="button">' + unors.buttondown_txt + '</button>';
          $(downhtml).insertBefore(originalinput);
        }
        if (next.hasClass('input-group-btn')) {
          uphtml = '<button class="' + unors.buttonup_class + ' bootstrap-touchspin-up" type="button">' + unors.buttonup_txt + '</button>';
          next.prepend(uphtml);
        }
        else {
          uphtml = '<button class="' + unors.buttonup_class + ' bootstrap-touchspin-up" type="button">' + unors.buttonup_txt + '</button>';
          $(uphtml).insertAfter(originalinput);
        }
        $(prefixhtml).insertBefore(originalinput);
        $(postfixhtml).insertAfter(originalinput);
        container = parentelement;
      }
      function _buildInputGroup() {
        var html;
        if (unors.verticalbuttons) {
          html = '<div class="input-group bootstrap-touchspin"><span class="input-group-text bootstrap-touchspin-prefix">' + unors.prefix + '</span><span class="input-group-text bootstrap-touchspin-postfix">' + unors.postfix + '</span><span class="input-group-btn-vertical"><button class="' + unors.buttondown_class + ' bootstrap-touchspin-up" type="button"><i class="' + unors.verticalupclass + '"></i></button><button class="' + unors.buttonup_class + ' bootstrap-touchspin-down" type="button"><i class="' + unors.verticaldownclass + '"></i></button></span></div>';
        }
        else {
          html = '<div class="input-group bootstrap-touchspin"><button class="' + unors.buttondown_class + ' bootstrap-touchspin-down" type="button">' + unors.buttondown_txt + '</button><span class="input-group-text bootstrap-touchspin-prefix">' + unors.prefix + '</span><span class="input-group-text bootstrap-touchspin-postfix">' + unors.postfix + '</span><button class="' + unors.buttonup_class + ' bootstrap-touchspin-up" type="button">' + unors.buttonup_txt + '</button></div>';
        }
        container = $(html).insertBefore(originalinput);
        $('.bootstrap-touchspin-prefix', container).after(originalinput);
        if (originalinput.hasClass('input-sm')) {
          container.addClass('input-group-sm');
        }
        else if (originalinput.hasClass('input-lg')) {
          container.addClass('input-group-lg');
        }
      }
      function _initElements() {
        elements = {
          down: $('.bootstrap-touchspin-down', container),
          up: $('.bootstrap-touchspin-up', container),
          input: $('input', container),
          prefix: $('.bootstrap-touchspin-prefix', container).addClass(unors.prefix_extraclass),
          postfix: $('.bootstrap-touchspin-postfix', container).addClass(unors.postfix_extraclass)
        };
      }
      function _hideEmptyPrefixPostfix() {
        if (unors.prefix === '') {
          elements.prefix.hide();
        }
        if (unors.postfix === '') {
          elements.postfix.hide();
        }
      }
      function _bindEvents() {
        originalinput.on('keydown', function(ev) {
          var code = ev.keyCode || ev.which;
          if (code === 38) {
            if (spinning !== 'up') {
              upOnce();
              startUpSpin();
            }
            ev.preventDefault();
          }
          else if (code === 40) {
            if (spinning !== 'down') {
              downOnce();
              startDownSpin();
            }
            ev.preventDefault();
          }
        });
        originalinput.on('keyup', function(ev) {
          var code = ev.keyCode || ev.which;
          if (code === 38) {
            stopSpin();
          }
          else if (code === 40) {
            stopSpin();
          }
        });
        originalinput.on('blur', function() {
          _checkValue();
        });
        elements.down.on('keydown', function(ev) {
          var code = ev.keyCode || ev.which;
          if (code === 32 || code === 13) {
            if (spinning !== 'down') {
              downOnce();
              startDownSpin();
            }
            ev.preventDefault();
          }
        });
        elements.down.on('keyup', function(ev) {
          var code = ev.keyCode || ev.which;

          if (code === 32 || code === 13) {
            stopSpin();
          }
        });
        elements.up.on('keydown', function(ev) {
          var code = ev.keyCode || ev.which;
          if (code === 32 || code === 13) {
            if (spinning !== 'up') {
              upOnce();
              startUpSpin();
            }
            ev.preventDefault();
          }
        });
        elements.up.on('keyup', function(ev) {
          var code = ev.keyCode || ev.which;
          if (code === 32 || code === 13) {
            stopSpin();
          }
        });
        elements.down.on('mousedown.touchspin', function(ev) {
          elements.down.off('touchstart.touchspin');
          if (originalinput.is(':disabled')) {
            return;
          }
          downOnce();
          startDownSpin();
          ev.preventDefault();
          ev.stopPropagation();
        });
        elements.down.on('touchstart.touchspin', function(ev) {
          elements.down.off('mousedown.touchspin');
          if (originalinput.is(':disabled')) {
            return;
          }
          downOnce();
          startDownSpin();
          ev.preventDefault();
          ev.stopPropagation();
        });
        elements.up.on('mousedown.touchspin', function(ev) {
          elements.up.off('touchstart.touchspin');
          if (originalinput.is(':disabled')) {
            return;
          }
          upOnce();
          startUpSpin();
          ev.preventDefault();
          ev.stopPropagation();
        });
        elements.up.on('touchstart.touchspin', function(ev) {
          elements.up.off('mousedown.touchspin');
          if (originalinput.is(':disabled')) {
            return;
          }
          upOnce();
          startUpSpin();
          ev.preventDefault();
          ev.stopPropagation();
        });
        elements.up.on('mouseout touchleave touchend touchcancel', function(ev) {
          if (!spinning) {
            return;
          }
          ev.stopPropagation();
          stopSpin();
        });
        elements.down.on('mouseout touchleave touchend touchcancel', function(ev) {
          if (!spinning) {
            return;
          }
          ev.stopPropagation();
          stopSpin();
        });
        elements.down.on('mousemove touchmove', function(ev) {
          if (!spinning) {
            return;
          }
          ev.stopPropagation();
          ev.preventDefault();
        });
        elements.up.on('mousemove touchmove', function(ev) {
          if (!spinning) {
            return;
          }
          ev.stopPropagation();
          ev.preventDefault();
        });
        $(document).on(_scopeEventNames(['mouseup', 'touchend', 'touchcancel'], _currentSpinnerId).join(' '), function(ev) {
          if (!spinning) {
            return;
          }
          ev.preventDefault();
          stopSpin();
        });
        $(document).on(_scopeEventNames(['mousemove', 'touchmove', 'scroll', 'scrollstart'], _currentSpinnerId).join(' '), function(ev) {
          if (!spinning) {
            return;
          }
          ev.preventDefault();
          stopSpin();
        });
        originalinput.on('mousewheel DOMMouseScroll', function(ev) {
          if (!unors.mousewheel || !originalinput.is(':focus')) {
            return;
          }
        var delta = ev.originalEvent.wheelDelta || -ev.originalEvent.deltaY || -ev.originalEvent.detail;
          ev.stopPropagation();
          ev.preventDefault();
          if (delta < 0) {
            downOnce();
          }
          else {
            upOnce();
          }
        });
      }
      function _bindEventsInterface() {
        originalinput.on('touchspin.uponce', function() {
          stopSpin();
          upOnce();
        });
        originalinput.on('touchspin.downonce', function() {
          stopSpin();
          downOnce();
        });
        originalinput.on('touchspin.startupspin', function() {
          startUpSpin();
        });
        originalinput.on('touchspin.startdownspin', function() {
          startDownSpin();
        });
        originalinput.on('touchspin.stopspin', function() {
          stopSpin();
        });
        originalinput.on('touchspin.updateunors', function(e, newunors) {
          changeUnOrs(newunors);
        });
      }
      function _forcestepdivisibility(value) {
        switch (unors.forcestepdivisibility) {
          case 'round':
          return (Math.round(value / unors.step) * unors.step).toFixed(unors.decimals);
          case 'floor':
          return (Math.floor(value / unors.step) * unors.step).toFixed(unors.decimals);
          case 'ceil':
          return (Math.ceil(value / unors.step) * unors.step).toFixed(unors.decimals);
          default:
          return value;
        }
      }
      function _checkValue() {
        var val, parsedval, returnval;
        val = originalinput.val();
        if (val === '') {
          if (unors.replacementval !== '') {
            originalinput.val(unors.replacementval);
            originalinput.trigger('change');
          }
          return;
        }
        if (unors.decimals > 0 && val === '.') {
          return;
        }
        parsedval = parseFloat(val);
        if (isNaN(parsedval)) {
          if (unors.replacementval !== '') {
            parsedval = unors.replacementval;
          }
          else {
            parsedval = 0;
          }
        }
        returnval = parsedval;
        if (parsedval.toString() !== val) {
          returnval = parsedval;
        }
        if (parsedval < unors.min) {
          returnval = unors.min;
        }
        if (parsedval > unors.max) {
          returnval = unors.max;
        }
        returnval = _forcestepdivisibility(returnval);
        if (Number(val).toString() !== returnval.toString()) {
          originalinput.val(returnval);
          originalinput.trigger('change');
        }
      }
      function _getBoostedStep() {
        if (!unors.booster) {
          return unors.step;
        }
        else {
          var boosted = Math.pow(2, Math.floor(spincount / unors.boostat)) * unors.step;
          if (unors.maxboostedstep) {
            if (boosted > unors.maxboostedstep) {
              boosted = unors.maxboostedstep;
              value = Math.round((value / boosted)) * boosted;
            }
          }
          return Math.max(unors.step, boosted);
        }
      }
      function upOnce() {
        _checkValue();
        value = parseFloat(elements.input.val());
        if (isNaN(value)) {
          value = 0;
        }
        var initvalue = value,
        boostedstep = _getBoostedStep();
        value = value + boostedstep;
        if (value > unors.max) {
          value = unors.max;
          originalinput.trigger('touchspin.on.max');
          stopSpin();
        }
        elements.input.val(Number(value).toFixed(unors.decimals));
        if (initvalue !== value) {
          originalinput.trigger('change');
        }
      }
      function downOnce() {
        _checkValue();
        value = parseFloat(elements.input.val());
        if (isNaN(value)) {
          value = 0;
        }
        var initvalue = value,
        boostedstep = _getBoostedStep();
        value = value - boostedstep;
        if (value < unors.min) {
          value = unors.min;
          originalinput.trigger('touchspin.on.min');
          stopSpin();
        }
        elements.input.val(value.toFixed(unors.decimals));
        if (initvalue !== value) {
          originalinput.trigger('change');
        }
      }
      function startDownSpin() {
        stopSpin();
        spincount = 0;
        spinning = 'down';
        originalinput.trigger('touchspin.on.startspin');
        originalinput.trigger('touchspin.on.startdownspin');
        downDelayTimeout = setTimeout(function() {
          downSpinTimer = setInterval(function() {
            spincount++;
            downOnce();
          }, unors.stepinterval);
        }, unors.stepintervaldelay);
      }
      function startUpSpin() {
        stopSpin();
        spincount = 0;
        spinning = 'up';
        originalinput.trigger('touchspin.on.startspin');
        originalinput.trigger('touchspin.on.startupspin');
        upDelayTimeout = setTimeout(function() {
          upSpinTimer = setInterval(function() {
            spincount++;
            upOnce();
          }, unors.stepinterval);
        }, unors.stepintervaldelay);
      }
      function stopSpin() {
        clearTimeout(downDelayTimeout);
        clearTimeout(upDelayTimeout);
        clearInterval(downSpinTimer);
        clearInterval(upSpinTimer);
        switch (spinning) {
          case 'up':
          originalinput.trigger('touchspin.on.stopupspin');
          originalinput.trigger('touchspin.on.stopspin');
          break;
          case 'down':
          originalinput.trigger('touchspin.on.stopdownspin');
          originalinput.trigger('touchspin.on.stopspin');
          break;
        }
        spincount = 0;
        spinning = false;
      }
    });
  };
})(jQuery);