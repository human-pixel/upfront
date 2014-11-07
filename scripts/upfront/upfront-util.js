(function ($) {

window.empty = function (what) { return "undefined" === typeof what ? true : !what; };

//requestFrameAnimation polyfill
var rAFPollyfill = function(callback){
		var currTime = new Date().getTime(),
			timeToCall = Math.max(0, 16 - (currTime - lastTime)),
			id = setTimeout(function() { callback(currTime + timeToCall); }, timeToCall)
		;
		lastTime = currTime + timeToCall;
		return id;
}

define(function() {
	var Util = {
		model_to_json: function (model) {
			if (!model) return {};
			var raw = (model && model.toJSON ? model.toJSON() : model),
				data_str = JSON.stringify(raw),
				json = JSON.parse(data_str)
			;

			return json;
		},

		get_unique_id: function (pfx) {
			return _.template("{{prefix}}-{{stamp}}-{{numeric}}", {
				prefix: pfx || "entity",
				stamp: (new Date).getTime(),
				numeric: Math.floor((Math.random()*999)+1000)
			});
		},

		log: function () {
			var args = ["[UPFRONT]: "].concat(arguments);
			console.log.apply(console, args);
		},

		dbg: function () {
			Upfront.Util.log(JSON.stringify(arguments[0]));
		},

		/**
		 * Perform deep copy of an object
		 */
		clone: function (obj) {
			return jQuery.extend(true, {}, obj);
		},

		/**
		 * Check CSS support
		 */
		css_support: function ( property ) {
			var div = document.createElement('div'),
				reg = new RegExp("(khtml|moz|ms|webkit|)"+property, "i")
			;
			for ( s in div.style ) {
				if ( s.match(reg) ) return true;
			}
			return false;
		},

		post: function (data, data_type) {
			var request = (_.isObject(data) && data.action) ? data : {"action": "upfront_request", "data": data};

			// @TODO need a better way to attach upfront layout data on request?
			if ( Upfront.Application.current_subapplication.layout ) {
				//request.upfront_layout = Upfront.Application.layout.get('layout');
				request.layout = Upfront.Application.current_subapplication.layout.get('layout');
			}
			if ( !request.storage_key ) request.storage_key = _upfront_storage_key;
			request.stylesheet = _upfront_stylesheet;

			// Some stuff depends if in builder or editor mode so lets make that
			// available for convenient server side check.
			request.mode = Upfront.Application.get_current();

			// Was request made from dev mode
			request.dev = location.search.indexOf('dev=true') > -1;

			return $.post(Upfront.Settings.ajax_url, request, function () {}, data_type ? data_type : "json");
		},

		reset: function () {
			var request = {
				action: "upfront_reset_layout"
			};
			return this.post(request);
		},

		reset_all: function () {
			var request = {
				action: "upfront_reset_all_from_db"
			};
			return this.post(request);
		},

		format_date: function(date, show_time, show_seconds){
				var output = date.getFullYear() + '/',
					day = date.getDate(),
					month = (date.getMonth()+1)
				;
				if(day < 10) day = '0' + day;
				if(month < 10) month = '0' + month;

				output += month + '/' + day;

				if(show_time){
					var hours = date.getHours(),
						minutes = date.getMinutes()
					;
					output += ' ' +
						(hours < 10 ? '0' : '') +
						hours + ':' +
						(minutes < 10 ? '0' : '') +
						minutes
					;
					if(show_seconds){
						var seconds = date.getSeconds();
							output += ':' +
								(seconds < 10 ? '0' : '') +
								seconds
						;
					}
				}
				return output;
		},
		get_avatar: function(obj, size){
			var protocolParts = window.location.href.split('//'),
				url = protocolParts[0] + '//www.gravatar.com/avatar/',
				hash = ''
			;

			size = size && parseInt(size, 10) == size ? size : 32;

			if(_.isString(obj)) hash = obj;
			else if(obj instanceof Upfront.Models.User || obj instanceof Upfront.Models.Comment) hash = obj.get('gravatar');
			else return false;

			return url + hash + '?d=mm&s=' + size;
		},
        grid : {
            /**
             * Sets proper class to passed in jquery object of the element
             *
             * @param jQuery object $el
             * @param string class_prefix|class_name either a class prefix like 'c' or a class name like c12
             * @param string|int|null class_size either a string of the class size like 12 or '12'
             */
            update_class :  function ($el, class_prefix, class_size) {
                if(  _.isUndefined( class_size ) ){
                    var class_size = class_prefix.replace( /[^\d.]/g, ''),
                        class_name = class_prefix.replace(class_size, "");
                }else{
                    class_name = class_prefix;
                }
                var rx = new RegExp('\\b' + class_name + '\\d+');
                if ( ! $el.hasClass( class_name + class_size) ){
                    if ( $el.attr('class').match(rx) )
                        $el.attr('class', $el.attr('class').replace(rx, class_name + class_size));
                    else
                        $el.addClass( class_name + class_size );
                }
            },
            width_to_col: function (width) {
                var column_width = Upfront.Settings.LayoutEditor.Grid.column_width;
                return Math.floor(width/column_width);
            },
            height_to_row: function (height) {
                var baseline = Upfront.Settings.LayoutEditor.Grid.baseline;
                return Math.ceil(height/baseline);
            },
            normalize_width: function(width){
                return this.width_to_col( width ) * Upfront.Settings.LayoutEditor.Grid.column_width;
            },
            normalize_height: function( height ){
                return this.height_to_row( height ) * Upfront.Settings.LayoutEditor.Grid.baseline;
            }
        },
		width_to_col: function (width) {
			return this.grid.width_to_col(width);
		},

		height_to_row: function (height) {
			return this.grid.height_to_row(height);
		},

		openLightboxRegion: function(regionName){
			var regions = Upfront.Application.layout.get('regions'),
				region = regions.get_by_name(regionName)
			;

			if(!region) return;

			//hide other lightboxes
			_.each(regions.models, function(model) {
				if(model.attributes.sub == 'lightbox')
					Upfront.data.region_views[model.cid].hide();
			});

			Upfront.data.region_views[region.cid].show();
		},

		/**
		 * Callback to sort jQuery elements
		 */
		sort_elements_cb: function (a, b) {
			var cmp_a = $(a).data('breakpoint_order'),
				cmp_b = $(b).data('breakpoint_order');
			if ( ! _.isNumber(cmp_a) )
				cmp_a = $(a).data('dom_order');
			if ( ! _.isNumber(cmp_b) )
				cmp_b = $(b).data('dom_order');
			if ( cmp_a > cmp_b)
				return 1;
			else
				return -1;
			return 0;
		},
		
		/**
		 * Callback before sort jQuery element, to store DOM position, pass on $.each
		 */
		normalize_sort_elements_cb: function (index) {
			$(this).data('dom_order', index);
		},

		/**
		 * For sorted elements, we use this function to perform traversing search (replacement for next, prev, nextAll, prevAll, nextUntil, prevUntil)
		 */
		find_from_elements: function ($els, from, filter, reverse, until) {
			var index = $els.index($(from)),
				find_from = reverse ? _.first($els, index).reverse() : _.rest($els, index+1),
				finish = false,
				is_filter_cb = filter && _.isFunction(filter),
				is_until_cb = until && _.isFunction(until)
			;
			return $(_.filter(find_from, function(el){
				if ( finish ) return false;
				if ( ( is_filter_cb && filter($(el), $els) ) || ( !is_filter_cb && $(el).is(filter) ) ){
						if ( until && ( ( is_until_cb && until($(el), $els) ) || ( !is_until_cb && $(el).is(until) ) ) ){
								finish = true;
								return false;
						}
						return true;
				}
				return false;
			}));
		},

		// Crossbrowser requestAnimationFrame
		requestAnimationFrame:
			$.proxy(window.requestAnimationFrame, window) ||
			$.proxy(window.webkitRequestAnimationFrame, window) ||
			$.proxy(window.mozRequestAnimationFrame, window) ||
			$.proxy(window.oRequestAnimationFrame, window) ||
			$.proxy(window.msRequestAnimationFrame, window) ||
			rAFPollyfill,

		/* JS - PHP compatible templates */
		template: function(markup){
			var oldSettings = _.templateSettings,
				tpl = false;

			_.templateSettings = {
				interpolate : /<\?php echo (.+?) \?>/g,
				evaluate: /<\?php (.+?) \?>/g
			};

			tpl = _.template(markup);

			_.templateSettings = oldSettings;

			return function(data){
				_.each(data, function(value, key){
					data['$' + key] = value;
				});

				return tpl(data);
			};
		},

		Transient: {

			// Local storage object, or the in-memory queue
			_memory_queue: {},

			_key: window.location.path + window.location.search,

			initialize: function () {
				/*try {
					if ('sessionStorage' in window && window['sessionStorage'] !== null) this._memory_queue = sessionStorage;
				} catch (e) {
					Util.log("No local storage available, working off memory");
				}*/
				if (!Upfront.Settings.Debug.transients) this._memory_queue[this._key] = JSON.stringify({});
			},

			get_current: function () {
				return (this._memory_queue[this._key] ? JSON.parse(this._memory_queue[this._key]) : {});
			},

			length: function (key) {
				var data = this.get(key);
				return data.length;
			},

			set: function (key, value) {
				var current = this.get_current();
				current[key] = Util.model_to_json(value);
				this._memory_queue[this._key] = JSON.stringify(current);
			},

			get: function (key) {
				var current = this.get_current(),
					raw = current[key] || false
				;
				return raw;// ? JSON.parse(raw) : false;
			},

			get_all: function (prefix) {
				var key_rx = (prefix ? new RegExp(prefix) : false),
					data = [],
					history = (this._memory_queue[this._key] ? JSON.parse(this._memory_queue[this._key]) : false)
				;
				if (history) _(history).each(function (obj, key) {
					if (key_rx && !key.match(key_rx)) return true;
					data = obj;
				});
				return data;
			},

	// ----- Stack-like interface (for history) -----

			push: function (key, value) {
				var items = this.get(key) || [];
				items.push(value);
				return this.set(key, items);
			},

			pop: function (key) {
				var items = this.get(key) || [],
					item = items && items.pop ? items.pop() : false
				;
				this.set(key, items);
				return item;

			}
		},
		date : {
			php_format_to_jquery :  function(php_format)
			{
				var SYMBOLS_MATCHING = {
					// Day
					'd': 'dd',
					'D': 'D',
					'j': 'd',
					'l': 'DD',
					'N': '',
					'S': '',
					'w': '',
					'z': 'o',
					// Week
					'W': '',
					// Month
					'F': 'MM',
					'm': 'mm',
					'M': 'M',
					'n': 'm',
					't': '',
					// Year
					'L': '',
					'o': '',
					'Y': 'yy',
					'y': 'y',
					// Time
					'a': '',
					'A': '',
					'B': '',
					'g': '',
					'G': '',
					'h': '',
					'H': '',
					'i': '',
					's': '',
					'u': ''
				};
				jqueryui_format = "";
				escaping = false;
				for( var i = 0; i < php_format.length; i++)
				{
					char = php_format[i];
					if(char === '\\') // PHP date format escaping character
					{
						i++;
						if(escaping) jqueryui_format += php_format[i];
						else jqueryui_format += '\'' + php_format[i];
						escaping = true;
					}
					else
					{
						if(escaping) { jqueryui_format += "'"; escaping = false; }
						if( _.isUndefined(SYMBOLS_MATCHING[char])){
								jqueryui_format += char;
						}else{
								jqueryui_format += SYMBOLS_MATCHING[char];
						}

					}
				}
				return jqueryui_format;

			},
			php_format_to_js :  function(php_format)
			{
				var SYMBOLS_MATCHING = {
					// Day
					'd': 'dd',
					'D': 'D',
					'j': 'd',
					'l': 'DD',
					'N': '',
					'S': '',
					'w': '',
					'z': 'o',
					// Week
					'W': '',
					// Month
					'F': 'MMMM',
					'm': 'mmmm',
					'M': 'M',
					'n': 'm',
					't': '',
					// Year
					'L': '',
					'o': '',
					'Y': 'yyyy',
					'y': 'y',
					// Time
					'a': '',
					'A': '',
					'B': '',
					'g': '',
					'G': '',
					'h': '',
					'H': '',
					'i': '',
					's': '',
					'u': ''
				};
				jqueryui_format = "";
				escaping = false;
				for( var i = 0; i < php_format.length; i++)
				{
					char = php_format[i];
					if(char === '\\') // PHP date format escaping character
					{
						i++;
						if(escaping) jqueryui_format += php_format[i];
						else jqueryui_format += '\'' + php_format[i];
						escaping = true;
					}
					else
					{
						if(escaping) { jqueryui_format += "'"; escaping = false; }
						if( _.isUndefined(SYMBOLS_MATCHING[char])){
								jqueryui_format += char;
						}else{
								jqueryui_format += SYMBOLS_MATCHING[char];
						}

					}
				}
				return jqueryui_format;
			}
		}
	};

	var Popup = {

		$popup: {},
		$background: {},
		_deferred: {},

		init: function () {
			if (!$("#upfront-popup").length) {
				$("#page")
					.append('<div id="upfront-popup" class="upfront-ui" style="display:none">' +
						'<div id="upfront-popup-close" class="upfront-icon upfront-icon-popup-close"></div>' +
						'<div class="upfront-popup-meta" id="upfront-popup-top">' +
						'</div>' +
						'<div id="upfront-popup-content"></div>' +
						'<div class="upfront-popup-meta" id="upfront-popup-bottom">' +
						'</div>' +
					'</div>')
					.append("<div id='upfront-popup-background' style='display:none' />")
				;
			} else {
				this.close();
			}
			this.$popup = $("#upfront-popup");
			this.$background = $("#upfront-popup-background");

			this.$popup.find("#upfront-popup-content").empty();
		},

		open: function (callback, data, classname) {
				data = data || {};
				classname = classname || 'default-popup';
				this.init();
				var me = this,
						sidebarWidth = $('#sidebar-ui').width(),
						$win = $(window),
						width = data.width || 630,
						left_pos = ($win.width() - width) / 2 + sidebarWidth / 2,
						height = ($win.height() / 3) * 2,
						close_func = function () { 
							$("#upfront-popup").attr('class', 'upfront-ui');
							me.close(); 
							return false; 
						}
				;

				// data.width = width, data.height = height;
				this.$background
					// .css({
					// 	'height': $win.height(),
					// 	'width': $win.width() - sidebarWidth,
					// 	'left': sidebarWidth
					// })
					.on("click", close_func)
					.show()
				;
				this.$popup
					// .css({
					// 	'width': width,
					// 	'height': height,
					// 	'left': sidebarWidth
					// })
					.show()
					.find("#upfront-popup-close").on("click", close_func).end()
				;
				if ( classname ) { 
					this.$popup.addClass( classname );  
				}

				$('body').addClass('upfront-popup-open');
				/* 
				$win.off("resize.upfront-popup").on("resize.upfront-popup", function () {
						if (me.$background.is(":visible")) {
							me.$background
								.css({
									'height': $win.height(),
									'width': $win.width() - sidebarWidth,
									'left': sidebarWidth
								})
							;
						}
						if (me.$popup.is(":visible")) {
							var left_pos = ($win.width() - width) / 2 + sidebarWidth / 2,
								height = ($win.height() / 3) * 2
							;
							me.$popup
								.css({
									'width': width,
									'height': height,
									'left': left_pos
								})
							;
						}
				});
			*/

				callback.apply(this.$popup.find("#upfront-popup-content").get(), [data, this.$popup.find("#upfront-popup-top"), this.$popup.find("#upfront-popup-bottom")]);
				this._deferred = new $.Deferred();
				return this._deferred.promise();
		},

		close: function (result) {
			this._deferred.notify('before_close');

			this.$background.hide();
			this.$popup.hide().find("#upfront-popup-content").empty();

			this.$popup.find("#upfront-popup-top").empty();
			this.$popup.find("#upfront-popup-bottom").empty();

			$('body').removeClass('upfront-popup-open');

			Upfront.Events.trigger('popup:closed');

			this._deferred.resolve(this.$popup, result);
		}

	};

	var PreviewUpdate = function () {
		var _layout_data = false,
			_layout = false,
			_saving_flag = false,
			_is_dirty = false,
			_preview_url = false,
			run = function (layout) {
				if (Upfront.Application.mode.current === Upfront.Application.MODE.THEME) {
					// Exporter mode
					rebind_exporter_events();
				} else {
					// Normal mode
					_layout = layout;
					rebind_events();
				}
				// Bind beforeunload event listener
				window.onbeforeunload = warn;
			},
			/**
			 * Exporter events don't send out the preview saves, just manipulate flag directly.
			 */
			rebind_exporter_events = function () {
				Upfront.Events.off("entity:region:deactivated", exporter_set_dirty);
				Upfront.Events.off("entity:settings:deactivate", exporter_set_dirty);
				Upfront.Events.off("entity:removed:after", exporter_set_dirty);
				Upfront.Events.off("entity:resize_start", exporter_set_dirty);
				Upfront.Events.off("entity:drag_stop", exporter_set_dirty);
				Upfront.Events.off("entity:module:after_render", exporter_set_dirty);
				Upfront.Events.off("upfront:element:edit:stop", exporter_set_dirty);

				Upfront.Events.on("entity:region:deactivated", exporter_set_dirty, this);
				Upfront.Events.on("entity:settings:deactivate", exporter_set_dirty, this);
				Upfront.Events.on("entity:removed:after", exporter_set_dirty, this);
				Upfront.Events.on("entity:resize_start", exporter_set_dirty, this);
				Upfront.Events.on("entity:drag_stop", exporter_set_dirty, this);
				Upfront.Events.on("entity:module:after_render", exporter_set_dirty, this);
				Upfront.Events.on("upfront:element:edit:stop", exporter_set_dirty, this);

				Upfront.Events.off("command:layout:export_theme", clear);
				Upfront.Events.on("command:layout:export_theme", clear);
			},
			exporter_set_dirty = function () {
				_is_dirty = true;
			}
			rebind_events = function(){
				Upfront.Events.off("entity:region:deactivated", save);
				Upfront.Events.off("entity:settings:deactivate", save);
				Upfront.Events.off("entity:removed:after", save);
				Upfront.Events.off("entity:resize_start", save);
				Upfront.Events.off("entity:drag_stop", save);
				Upfront.Events.off("entity:module:after_render", save);
				Upfront.Events.off("upfront:element:edit:stop", save);

				Upfront.Events.on("entity:region:deactivated", save, this);
				Upfront.Events.on("entity:settings:deactivate", save, this);
				Upfront.Events.on("entity:removed:after", save, this);
				Upfront.Events.on("entity:resize_start", save, this);
				Upfront.Events.on("entity:drag_stop", save, this);
				Upfront.Events.on("entity:module:after_render", save, this);
				Upfront.Events.on("upfront:element:edit:stop", save, this);

				Upfront.Events.off("command:layout:save_success", clear);
				Upfront.Events.on("command:layout:save_success", clear);
			},
			set_data = function () {
				_layout_data = Upfront.Util.model_to_json(_layout);
				if (_layout_data && _layout_data.regions) _layout_data.regions = _(_layout_data.regions).reject(function (reg) { return reg.name === "shadow"; });
				_layout_data.layout = _upfront_post_data.layout;
				_layout_data.preferred_layout = _layout.get("current_layout");

				_layout_data = JSON.stringify(_layout_data, undefined, 2);
			},
			save = function () {
				if (_saving_flag) return false;

				_saving_flag = true;
				_is_dirty = true;
				set_data();

				Upfront.Events.trigger("preview:build:start");
				Upfront.Util.post({action: "upfront_build_preview", "data": _layout_data, "current_url": window.location.href})
					.success(function (response) {
						var data = response.data || {};
						if ("html" in data && data.html) {
							_preview_url = data.html;
						} else {
							Upfront.Util.log("Invalid response");
						}
						_saving_flag = false;
						Upfront.Events.trigger("preview:build:stop");
						Upfront.Util.log("we're good here")
					})
					.error(function () {
						Upfront.Util.log("error building layout preview");
					})
				;

				run(_layout);
			},
			clear = function () {
				_is_dirty = false; // Clear dirty flag, we just saved changes
			},
			warn = function (e) {
				var e = e || window.event,
					going = Upfront.Settings.l10n.global.views.unsaved_changes_nag
				;
				if (!_saving_flag && !_is_dirty) return; // No changes
				if (e) e.returnValue = going;
				return going;
			},
			get_preview_url = function () {
				return _preview_url;
			}
		;
		return {
			run: run,
			preview_url: get_preview_url,
			rebind_events: rebind_events
		}

	};

	return {
		Util: Util,
		Popup: Popup,
		PreviewUpdate: new PreviewUpdate()
	};
});
})(jQuery);
