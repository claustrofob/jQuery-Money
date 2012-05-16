/**
 * jQuery plugin for formatting numeric data in inputs
 * 
 * @author Nikolay Zmachinsky
 */
(function($) {
	$.fn.money = function(settings) {
		settings = $.extend({
			decimal : '.', //period or comma
			precision : 2,
			thousands : ',',
			allowZero : false
		}, settings);

		return this.each(function() {
					var input = $(this);
					if (input.data('money-init')) return this;
					
					var execKeyUp = false;
					var execKeyPress = false;
					var execChange = false;
					function keypressEvent(e) {
						if (!execKeyPress) return;
						execKeyPress = false;
						e = e || window.event;
						var k = e.which;
						/**
						 * do not exec buttons: tab, enter, escape, page up, page down, home, end, left, top, right, bottom arrows
						 * and buttons with pressed command keys 
						 */
						if (
								($.inArray(k, [ 9, 13, 27, 33, 34, 35, 36, 37, 38, 39, 40 ]) != -1)
								|| (e.altKey || e.ctrlKey || e.metaKey)
							) {
							execKeyUp = false;
							return;
						}
						if ( 
								( ((k >= 48 && k <= 57) || (k >= 96 && k <= 105)) && !e.shiftKey )
								|| ($.inArray(k, [ 0, 8, 12, 46, 63272, 188, 190 ]) != -1)
							) {
							execKeyUp = true;
							return;
						}
						e.preventDefault();
						execKeyPress = true;
						execKeyUp = false;
						return;
					}
					function keydownEvent(e) {
						execKeyPress = true;
						keypressEvent(e);
					}
					function changeEvent(e) {
						if (execKeyUp || execKeyPress || execChange) return;
						execKeyUp = true;
						
						//IE seems to trigger propertychange event after setting input.val(), so disable it till we change it
						execChange = true;
						keyupEvent(e);
						execChange = false;
					}
					function keyupEvent(e) {
						if (!execKeyUp) return;
						execKeyUp = false;
						execKeyPress = false;
						
						var value = maskValue(input.val());
						input.val(value);
					}
					function maskValue(sum) {
						var x = sum.split(settings.decimal);
						var unit = x.shift().replace(/[^0-9]+/ig, "");
						var precision = x.join('').replace(/[^0-9]+/ig, "");
						precision = precision.substr(0, settings.precision);
						
						if (settings.thousands.length){
							var rgx = /(\d+)(\d{3})/;
							while (rgx.test(unit)) {
								unit = unit.replace(rgx, '$1' + settings.thousands + '$2');
							}
						}
						
						return unit + ((unit.length && (settings.precision > 0) && (precision.length || x.length)) ? settings.decimal + precision : '');
					}
					
					input.data('money-init', true);
					
					input.bind('keypress.money', keypressEvent);
					input.bind('keydown.money', keydownEvent);
					input.bind('keyup.money', keyupEvent);
					input.bind('input.money propertychange.money', changeEvent).trigger('input.money');

					return this;
				});
	}
})(jQuery); 