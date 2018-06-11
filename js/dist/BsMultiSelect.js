function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import $ from 'jquery';
import Popper from 'popper.js';
import Bs4AdapterCss from './Bs4AdapterCss.es8';
import Bs4Adapter from './Bs4Adapter.es8'; // TODO: try to find convinient way to declare private members. Is it convinient enough to move them into IIFE?

var BsMultiSelect = function (window, $, Popper) {
  var JQUERY_NO_CONFLICT = $.fn[pluginName];
  var pluginName = 'dashboardCodeBsMultiSelect';
  var dataKey = "".concat(pluginName);
  var defSelectedPanelStyleSys = {
    'display': 'flex',
    'flex-wrap': 'wrap',
    'list-style-type': 'none'
  }; // remove bullets since this is ul

  var defFilterInputStyleSys = {
    'width': '2ch',
    'border': '0',
    'padding': '0',
    'outline': 'none',
    'background-color': 'transparent'
  };
  var defDropDownMenuStyleSys = {
    'list-style-type': 'none'
  }; // remove bullets since this is ul

  var defaults = {
    doManageFocus: true,
    useCss: false,
    adapter: null
  };

  var Plugin =
  /*#__PURE__*/
  function () {
    function Plugin(selectElement, options, adapter) {
      _classCallCheck(this, Plugin);

      if (typeof Popper === 'undefined') {
        throw new TypeError('DashboardCode BsMultiSelect require Popper.js (https://popper.js.org)');
      } // readonly


      this.selectElement = selectElement;
      this.options = $.extend({}, defaults, options);
      if (adapter) this.adapter = adapter;else this.adapter = this.options.useCss ? new Bs4AdapterCss($, this.selectElement, this.options) : new Bs4Adapter($, this.selectElement, this.options);
      this.container = null;
      this.selectedPanel = null;
      this.filterInputItem = null;
      this.filterInput = null;
      this.dropDownMenu = null;
      this.popper = null; // removable handlers

      this.selectedPanelClick = null;
      this.documentMouseup = null;
      this.containerMousedown = null;
      this.documentMouseup2 = null; // state

      this.disabled = null;
      this.filterInputItemOffsetLeft = null; // used to detect changes in input field position (by comparision with current value)

      this.skipFocusout = false;
      this.hoveredDropDownItem = null;
      this.hoveredDropDownIndex = null;
      this.hasDropDownVisible = false;
      this.init();
    }

    _createClass(Plugin, [{
      key: "updateDropDownPosition",
      value: function updateDropDownPosition(force) {
        var offsetLeft = this.filterInputItem.offsetLeft;

        if (force || this.filterInputItemOffsetLeft != offsetLeft) {
          this.popper.update();
          this.filterInputItemOffsetLeft = offsetLeft;
        }
      }
    }, {
      key: "hideDropDown",
      value: function hideDropDown() {
        this.dropDownMenu.style.display = 'none';
      }
    }, {
      key: "showDropDown",
      value: function showDropDown() {
        this.dropDownMenu.style.display = 'block';
      } // Public methods

    }, {
      key: "resetDropDownMenuHover",
      value: function resetDropDownMenuHover() {
        if (this.hoveredDropDownItem !== null) {
          this.adapter.Hover($(this.hoveredDropDownItem), false);
          this.hoveredDropDownItem = null;
        }

        this.hoveredDropDownIndex = null;
      }
    }, {
      key: "filterDropDownMenu",
      value: function filterDropDownMenu() {
        var text = this.filterInput.value.trim().toLowerCase();
        var visible = 0;
        $(this.dropDownMenu).find('LI').each(function (i, dropDownMenuItem) {
          var $dropDownMenuItem = $(dropDownMenuItem);

          if (text == '') {
            $dropDownMenuItem.show();
            visible++;
          } else {
            var itemText = $dropDownMenuItem.data("option-text");
            var isSelected = $dropDownMenuItem.data("option-selected");

            if (!isSelected && itemText.indexOf(text) >= 0) {
              $dropDownMenuItem.show();
              visible++;
            } else {
              $dropDownMenuItem.hide();
            }
          }
        });
        this.hasDropDownVisible = visible > 0;
        this.resetDropDownMenuHover();
      }
    }, {
      key: "clearFilterInput",
      value: function clearFilterInput(updatePosition) {
        if (this.filterInput.value) {
          this.filterInput.value = '';
          this.input(updatePosition);
        }
      }
    }, {
      key: "closeDropDown",
      value: function closeDropDown() {
        this.resetDropDownMenuHover();
        this.clearFilterInput(true);
        this.hideDropDown();
      }
    }, {
      key: "appendDropDownItem",
      value: function appendDropDownItem(optionElement) {
        var _this = this;

        var optionId = optionElement.value;
        var itemText = optionElement.text;
        var isSelected = optionElement.selected;
        var $dropDownItem = $("<LI/>");
        $dropDownItem.data("option-id", optionId);
        $dropDownItem.data("option-text", itemText.toLowerCase());
        var adoptDropDownItem = this.adapter.CreateDropDownItemContent($dropDownItem, optionId, itemText, isSelected);
        $dropDownItem.appendTo(this.dropDownMenu);

        var appendItem = function appendItem(doTrigger) {
          $dropDownItem.data("option-selected", true);
          var $selectedItem = $("<LI/>");
          $selectedItem.data("option-id", optionId);
          optionElement.selected = true;
          adoptDropDownItem(true);

          var removeItem = function removeItem() {
            $dropDownItem.data("option-selected", false);
            $dropDownItem.data("option-toggle", appendItem);
            $selectedItem.data("option-remove", null);
            $selectedItem.remove();
            optionElement.selected = false;
            adoptDropDownItem(false);
            $(_this.selectElement).trigger('change');
          };

          var removeItemAndCloseDropDown = function removeItemAndCloseDropDown() {
            removeItem();

            _this.closeDropDown();
          };

          _this.adapter.CreateSelectedItemContent($selectedItem, itemText, removeItemAndCloseDropDown, _this.disabled);

          $selectedItem.insertBefore(_this.filterInputItem);
          $dropDownItem.data("option-toggle", removeItem);
          $selectedItem.data("option-remove", removeItemAndCloseDropDown);
          if (typeof doTrigger === "undefined" || doTrigger === true) $(_this.selectElement).trigger('change');
          return $selectedItem;
        };

        $dropDownItem.data("option-toggle", appendItem);

        if (isSelected) {
          appendItem(false);
        }

        var manageHover = function manageHover(event, isOn) {
          _this.adapter.Hover($(event.target).closest("LI"), isOn);
        };

        $dropDownItem.click(function (event) {
          event.preventDefault();
          event.stopPropagation();
          var toggleItem = $(event.currentTarget).closest("LI").data("option-toggle");
          toggleItem();

          _this.filterInput.focus();
        }).mouseover(function (e) {
          return manageHover(e, true);
        }).mouseout(function (e) {
          return manageHover(e, false);
        });
      }
    }, {
      key: "keydownArrow",
      value: function keydownArrow(down) {
        var visibleNodeListArray = $(this.dropDownMenu).find('LI:not([style*="display: none"])').toArray();

        if (visibleNodeListArray.length > 0) {
          if (this.hasDropDownVisible) {
            this.updateDropDownPosition(true);
            this.showDropDown();
          }

          if (this.hoveredDropDownItem === null) {
            this.hoveredDropDownIndex = down ? 0 : visibleNodeListArray.length - 1;
          } else {
            this.adapter.Hover($(this.hoveredDropDownItem), false);

            if (down) {
              var newIndex = this.hoveredDropDownIndex + 1;
              this.hoveredDropDownIndex = newIndex < visibleNodeListArray.length ? newIndex : 0;
            } else {
              var _newIndex = this.hoveredDropDownIndex - 1;

              this.hoveredDropDownIndex = _newIndex >= 0 ? _newIndex : visibleNodeListArray.length - 1;
            }
          }

          this.hoveredDropDownItem = visibleNodeListArray[this.hoveredDropDownIndex];
          this.adapter.Hover($(this.hoveredDropDownItem), true);
        }
      }
    }, {
      key: "input",
      value: function input(forceUpdatePosition) {
        this.filterInput.style.width = this.filterInput.value.length * 1.3 + 2 + "ch";
        this.filterDropDownMenu();

        if (this.hasDropDownVisible) {
          if (forceUpdatePosition) // ignore it if it is called from
            this.updateDropDownPosition(forceUpdatePosition); // we need it to support case when textbox changes its place because of line break (texbox grow with each key press)

          this.showDropDown();
        } else {
          this.hideDropDown();
        }
      }
    }, {
      key: "Update",
      value: function Update() {
        var $selectedPanel = this.selectedPanel;
        this.adapter.UpdateIsValid($selectedPanel);
        this.UpdateSizeImpl($selectedPanel);
        this.UpdateReadonlyImpl($(this.container), $selectedPanel);
      }
    }, {
      key: "Dispose",
      value: function Dispose() {
        $.removeData(this.selectElement, dataKey);
        $(this.selectElement).off(dataKey); // removable handlers
        //$(window.selectedPanelClick).unbind("click", this.selectedPanelClick);

        $(window.document).unbind("mouseup", this.documentMouseup); //$(this.container).unbind("mousedown", this.containerMousedown);

        $(window.document).unbind("mouseup", this.documentMouseup2);

        if (this.adapter !== null) {
          this.adapter.Dispose();
        }

        if (this.popper !== null) {
          this.popper.destroy();
        }

        if (this.container !== null) {
          $(this.container).remove();
        } // this.selectedPanel = null;
        // this.filterInputItem = null;
        // this.filterInput = null;
        // this.dropDownMenu = null;
        // this.selectElement = null;
        // this.options = null;

      }
    }, {
      key: "UpdateSize",
      value: function UpdateSize() {
        this.UpdateSizeImpl($(this.selectedPanel));
      }
    }, {
      key: "UpdateReadonly",
      value: function UpdateReadonly() {
        this.UpdateReadonlyImpl($(this.container), $(this.selectedPanel));
      }
    }, {
      key: "UpdateSizeImpl",
      value: function UpdateSizeImpl($selectedPanel) {
        if (this.adapter.UpdateSize) this.adapter.UpdateSize($selectedPanel);
      }
    }, {
      key: "UpdateReadonlyImpl",
      value: function UpdateReadonlyImpl($container, $selectedPanel) {
        var disabled = this.selectElement.disabled;

        if (this.disabled !== disabled) {
          if (disabled) {
            this.filterInput.style.display = "none";
            this.adapter.Enable($selectedPanel, false);

            if (this.options.doManageFocus) {
              $container.unbind("mousedown", this.containerMousedown);
              $(window.document).unbind("mouseup", this.documentMouseup);
            }

            $selectedPanel.unbind("click", this.selectedPanelClick);
            $(window.document).unbind("mouseup", this.documentMouseup2);
          } else {
            this.filterInput.style.display = "inline-block";
            this.adapter.Enable($selectedPanel, true);

            if (this.options.doManageFocus) {
              $container.mousedown(this.containerMousedown); // removable

              $(window.document).mouseup(this.documentMouseup); // removable
            }

            $selectedPanel.click(this.selectedPanelClick); // removable

            $(window.document).mouseup(this.documentMouseup2); // removable
          }

          this.disabled = disabled;
        }
      }
    }, {
      key: "init",
      value: function init() {
        var _this2 = this;

        var $selectElement = $(this.selectElement);
        $selectElement.hide();
        var $container = $("<DIV/>");
        this.container = $container.get(0);
        var $selectedPanel = $("<UL/>");
        $selectedPanel.css(defSelectedPanelStyleSys);
        this.selectedPanel = $selectedPanel.get(0);
        $selectedPanel.appendTo(this.container);
        var $filterInputItem = $('<LI/>');
        this.filterInputItem = $filterInputItem.get(0);
        $filterInputItem.appendTo(this.selectedPanel);
        var $filterInput = $('<INPUT type="search" autocomplete="off">');
        $filterInput.css(defFilterInputStyleSys);
        $filterInput.appendTo(this.filterInputItem);
        this.filterInput = $filterInput.get(0);
        var $dropDownMenu = $("<UL/>").css({
          "display": "none"
        }).appendTo($container);
        this.dropDownMenu = $dropDownMenu.get(0); // prevent heavy understandable styling error

        $dropDownMenu.css(defDropDownMenuStyleSys); // create handlers

        this.documentMouseup = function () {
          _this2.skipFocusout = false;
        };

        this.containerMousedown = function () {
          _this2.skipFocusout = true;
        };

        this.documentMouseup2 = function (event) {
          if (!(_this2.container === event.target || $.contains(_this2.container, event.target))) {
            _this2.closeDropDown();
          }
        };

        this.selectedPanelClick = function (event) {
          if (event.target.nodeName != "INPUT") $(_this2.filterInput).val('').focus();

          if (_this2.hasDropDownVisible && _this2.adapter.FilterClick(event)) {
            _this2.updateDropDownPosition(true);

            _this2.showDropDown();
          }
        };

        this.adapter.Init($container, $selectedPanel, $filterInputItem, $filterInput, $dropDownMenu);
        $container.insertAfter($selectElement);
        this.popper = new Popper(this.filterInput, this.dropDownMenu, {
          placement: 'bottom-start',
          modifiers: {
            preventOverflow: {
              enabled: false
            },
            hide: {
              enabled: false
            },
            flip: {
              enabled: false
            }
          }
        });
        this.adapter.UpdateIsValid($selectedPanel);
        this.UpdateSizeImpl($selectedPanel);
        this.UpdateReadonlyImpl($container, $selectedPanel); // some browsers (IE11) can change select value (as part of "autocomplete") after page is loaded but before "ready" event

        $(document).ready(function () {
          var selectOptions = $selectElement.find('OPTION');
          selectOptions.each(function (index, optionElement) {
            _this2.appendDropDownItem(optionElement);
          });
          _this2.hasDropDownVisible = selectOptions.length > 0;

          _this2.updateDropDownPosition(false);
        });
        $dropDownMenu.click(function (event) {
          return event.stopPropagation();
        });
        $dropDownMenu.mouseover(function () {
          return _this2.resetDropDownMenuHover();
        });

        if (this.options.doManageFocus) {
          $filterInput.focusin(function () {
            return _this2.adapter.Focus($selectedPanel, true);
          }).focusout(function () {
            if (!_this2.skipFocusout) _this2.adapter.Focus($selectedPanel, false);
          });
        }

        $filterInput.on("keydown", function (event) {
          if (event.which == 38) {
            event.preventDefault();

            _this2.keydownArrow(false);
          } else if (event.which == 40) {
            event.preventDefault();

            _this2.keydownArrow(true);
          } else if (event.which == 13) {
            event.preventDefault();
          } else if (event.which == 9) {
            if (_this2.filterInput.value) {
              event.preventDefault();
            } else {
              _this2.closeDropDown();
            }
          } else {
            if (event.which == 8) {
              // NOTE: this will process backspace only if there are no text in the input field
              // If user will find this inconvinient, we will need to calculate something like this
              // this.isBackspaceAtStartPoint = (this.filterInput.selectionStart == 0 && this.filterInput.selectionEnd == 0);
              if (!_this2.filterInput.value) {
                var $penult = $(_this2.selectedPanel).find("LI:last").prev();

                if ($penult.length) {
                  var removeItem = $penult.data("option-remove");
                  removeItem();
                }

                _this2.updateDropDownPosition(false);
              }
            }

            _this2.resetDropDownMenuHover();
          }
        });
        $filterInput.on("keyup", function (event) {
          if (event.which == 13 || event.which == 9) {
            if (_this2.hoveredDropDownItem) {
              var $hoveredDropDownItem = $(_this2.hoveredDropDownItem);
              var toggleItem = $hoveredDropDownItem.data("option-toggle");
              toggleItem();

              _this2.closeDropDown();
            } else {
              var text = _this2.filterInput.value.trim().toLowerCase();

              var dropDownItems = _this2.dropDownMenu.querySelectorAll("LI");

              var dropDownItem = null;

              for (var i = 0; i < dropDownItems.length; ++i) {
                var it = dropDownItems[i];

                if (it.textContent.trim().toLowerCase() == text) {
                  dropDownItem = it;
                  break;
                }
              }

              if (dropDownItem) {
                var $dropDownItem = $(dropDownItem);
                var isSelected = $dropDownItem.data("option-selected");

                if (!isSelected) {
                  var toggle = $dropDownItem.data("option-toggle");
                  toggle();
                }

                _this2.clearFilterInput(true);
              }
            }
          } else if (event.which == 27) {
            // escape
            _this2.closeDropDown();
          }
        });
        $filterInput.on('input', function () {
          _this2.input(true);
        });
      }
    }]);

    return Plugin;
  }();

  function jQueryInterface(options) {
    return this.each(function () {
      var data = $(this).data(dataKey);

      if (!data) {
        if (/Dispose/.test(options)) {
          return;
        }

        var optionsObject = _typeof(options) === 'object' ? options : null;
        data = new Plugin(this, optionsObject);
        $(this).data(dataKey, data);
      }

      if (typeof options === 'string') {
        var methodName = options;

        if (typeof data[methodName] === 'undefined') {
          throw new TypeError("No method named \"".concat(methodName, "\""));
        }

        data[methodName]();
      }
    });
  }

  $.fn[pluginName] = jQueryInterface; // pluginName with first capitalized letter - return plugin instance for 1st $selected item

  $.fn[pluginName.charAt(0).toUpperCase() + pluginName.slice(1)] = function () {
    return $(this).data(dataKey);
  };

  $.fn[pluginName].Constructor = Plugin;

  $.fn[pluginName].noConflict = function () {
    $.fn[pluginName] = JQUERY_NO_CONFLICT;
    return jQueryInterface;
  };

  return Plugin;
}(window, $, Popper);

export default BsMultiSelect;

//# sourceMappingURL=BsMultiSelect.js.map