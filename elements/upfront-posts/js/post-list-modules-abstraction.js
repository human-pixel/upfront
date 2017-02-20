	(function($){
	define([
		'scripts/upfront/settings/modules/base-module',
		'scripts/upfront/settings/field-factory',
		'scripts/upfront/preset-settings/state-settings',
		'scripts/redactor/ueditor-inserts',
		/**
		 * @todo Refactor this to a different, shared location
		 */
		'elements/upfront-posts/js/post-list-meta-views'
	], function (BaseModule, FieldFactory, StateSettings, Inserts, Meta) {

		var l10n = Upfront.Settings.l10n.posts_element;

		var OptionsModule = BaseModule.extend({
			initialize: function (options) {
				BaseModule.prototype.initialize.call(this, options);
				this.listenTo(Upfront.Events, 'posts:element:preset:updated', this.updatePreview);
			},
			
			className: function () {
				var cls = (typeof this.initialize === typeof BaseModule.prototype.className
					? BaseModule.prototype.className()
					: (BaseModule.prototype.className || '')
				).split(' ');
				cls.push('upfront-posts-part');
				cls.push('part-module-panel');
				return cls.join(' ');
			},
			map_panel_fields: function () {
				var me = this,
					fields = this.get_fields(),
					object_model = new Upfront.Models.ObjectModel()
				;

				_(this.model.attributes).each(function (value, key) {
					if ("id" === key || "name" === key) return true;
					object_model.set_property(key, value);
				});
				
				fields.push({
					type: "Button",
					label: l10n.edit_template,
					className: 'edit_post_markup edit_preset_css',
					compact: true,
					on_click: function () {
						me.spawn_editor();
					}
				});

				return _.map(fields, function (field) {
					var options = _.extend(field, {change: function (value) {
						me.update_object(value, field.property);
					}});
					return FieldFactory.createField(field.type, _.extend({ model: object_model }, _.omit(field, ['type'])));
				});
			},
			get_fields: function () { return []; },
			get_object_model: function () {
				return this.model;
			},
			update_object: function (value, property) {
				if (_.isUndefined(value) ) value = '';
				this.model.set(property, value);
				this.trigger("part:property:change", property, value);
			},
			render: function () {
				this.fields = _(this.map_panel_fields());
				var modules = this.get_modules();
				
				this.$el.html('');
				
				if (this.title && this.options.toggle !== true) {
					this.$el.append('<div class="upfront-settings-item-title">' + this.options.title + '</div>');
				}
				
				this.$el.append('<div class="upfront-settings-post-wrapper"></div>');

				var $module_content = this.$el.find('.upfront-settings-post-wrapper');
				$module_content.append('<div class="upfront-settings-item-content"></div>');
				var $content = this.$el.find('.upfront-settings-item-content');
				
				this.fields.each(function(field){
					field.render();
					field.delegateEvents();
					$content.append(field.el);
				});

				this.state = new StateSettings({
					model: this.model,
					state: 'static',
					modules: modules
				});
				this.state.render();

				$module_content.append(this.state.$el);

				// Move Edit Preset to bottom
				$module_content.find('.state_modules').append(this.$el.find('.edit_preset_css'));
				this.$el.addClass("preset_specific");
				
				// Re-position toggle module
				this.repositionToggle(this.state.$el, modules);
				
				this.updatePreview();

				this.trigger('rendered');
			},
			repositionToggle: function ($el, modules) {
				var $toggle_settings = $el.find('.toggle_settings_item'),
					me = this
				;
				
				// Wrap toggle fields into module
				_.each(modules, function (module) {
					if (module.moduleType === "Toggle") {
						_.each(module.options.fields, function (field) {
							$toggle_settings.append(me.$el.find('.' + field));
						});
					}
				});
			},
			get_modules: function () {
				var me = this,
					name = function (name) { return 'static-' + me.data_part + '-' + name; }
				;
				return [{
					moduleType: 'Typography',
					options: {
						toggle: true,
						state: 'static',
						fields: {
							use: name('use-typography'),
							typeface: name('font-family'),
							weight: name('weight'),
							fontstyle: name('fontstyle'),
							style: name('style'),
							size: name('font-size'),
							line_height: name('line-height'),
							color: name('font-color')
						}
					}
				}];
			},
			spawn_editor: function () {
				var me = this,
					tpl_name = 'post-part-' + this.data_part,
					template = this.model.get(tpl_name),
					embed_object = ('meta' === this.options.part ? Meta.Embed : Inserts.inserts.embed),
					editor = new embed_object({data: {code: template}, model: this.model}),
					manager = false,
					resize_cbk = function () {
						if (manager) {
							var width = jQuery('#sidebar-ui').width() - 1;
							manager.$el
								.width(jQuery(window).width() -  width)
								.css('left', width);
						}
					}
				;

				jQuery(window).on('resize', resize_cbk);

				editor
					.start()
					.done(function (view, code) {
						jQuery(window).off('resize', resize_cbk);
						me.model.set(tpl_name, code);
					})
				;

				// Temporarily hack size
				this.listenTo(editor, 'manager:rendered', function (mgr, main) {
					manager = mgr;
					resize_cbk();
				});
			},
			updatePreview: function() {
				// Will be overriden by ToggleableOptions.updatePreview
			},
			// These two just satisfy the interface
			get_name: function () { return false; },
			get_value: function () { return false; }
		});

		var ToggleableOptions = OptionsModule.extend({
			events: function () {
				return _.extend({}, OptionsModule.prototype.events, {
					'click .upfront-settings-item-title .upfront-post-delete-part': 'removePart',
					'click .upfront-settings-item-title': 'toggle_box'
				});
			},
			render: function () {
				var me = this;

				OptionsModule.prototype.render.apply(this, arguments);
				
				var preview_markup;

				if(this.options.panel === 'wrapper') {
					preview_markup = '<span class="styles-holder"></span>';
				} else if(this.options.panel !== 'featured_image' && this.options.panel !== 'wrapper') {
					preview_markup = '<span class="styles-holder">A</span>';
				}
				
				this.$el.find(".upfront-settings-item-title").empty();
				
				if(typeof preview_markup !== "undefined") {
					this.$el.find(".upfront-settings-item-title").append('<span class="upfront-posts-preview">' + preview_markup + '</span>')
				}

				this.$el.find(".upfront-settings-item-title").append('<span class="upfront-posts-module-title">' + this.title + '</span>');

				if(typeof this.options.removable === "undefined" || this.options.removable === true) {
					this.$el.find(".upfront-settings-item-title")
						.append('<a href="#delete" class="upfront-post-delete-part">-</a>')
					;
				}
				
				this.$el.addClass(this.data_part);

				var $content = this.$el.find('.upfront-settings-post-wrapper');
				$content.hide();
			},
			updatePreview: function() {
				var me = this,
					useBorder = this.model.get(this.data_part + '-use-border'),
					borderWidth = this.model.get(this.data_part + '-border-width'),
					borderType = this.model.get(this.data_part + '-border-type'),
					borderColor = this.model.get(this.data_part + '-border-color'),
					backgroundColor = this.model.get(this.data_part + '-background-color'),
					fontColor = this.model.get(this.data_part + '-font-color')
				;

				setTimeout( function () {
					if(useBorder) {
						me.$el.find('.upfront-posts-preview .styles-holder').css({
							'borderStyle': 'solid',
							'borderWidth': '1px',
							'borderColor': borderColor
						});
					}
					
					me.$el.find('.upfront-posts-preview .styles-holder').css({
						'backgroundColor': backgroundColor,
						'color': fontColor
					});
				}, 50);
			},
			toggle_box: function (e) {
				if (e && e.preventDefault) e.preventDefault();
				if (e && e.stopPropagation) e.stopPropagation();

				if (e && $(e.target).hasClass('.upfront-post-delete-part')) return;

				var $content = this.$el.find('.upfront-settings-post-wrapper');
				if ($content.is(":visible")) this.hide_content();
				else this.show_content();

				return false;
			},
			hide_content: function () {
				var $content = this.$el.find('.upfront-settings-post-wrapper');
				
				// Remove shadow overlay
				this.$el.find(".upfront-settings-item-title").removeClass('active-panel');
				
				return $content.hide();
			},
			show_content: function () {
				var $content = this.$el.find('.upfront-settings-post-wrapper');
				
				this.hide_all();
				
				// Add shadow overlay
				this.$el.find(".upfront-settings-item-title").addClass('active-panel');
				
				var me = this;
                _.delay(function() { // Delay because opening animation causes wrong outerHeight results
                    var in_sidebar = me.$el.parents('#sidebar-ui').length,
                        in_settings = me.$el.parents('#element-settings-sidebar').length
                    ;

                    // Apply if select field is in sidebar or settings sidebar
                    if(in_sidebar == 1 || in_settings == 1) {
                       me.update_settings_position();
                    }
					
					return $content.show();
                }, 10);
				
				$('.sidebar-panel-content, #sidebar-scroll-wrapper').on('scroll', this, this.on_scroll);				
			},
			update_settings_position: function() {
				var me = this,
					settingsTitleHeight = 68,
					setting_dropdown = me.$el.find('.upfront-settings-post-wrapper'),
					select = setting_dropdown.parent(),
					dropDownTop = select.offset().top - $('#element-settings-sidebar').offset().top,
					dropDownTop = dropDownTop + settingsTitleHeight,
					viewportHeight = $(window).height(),
					availableBelow = viewportHeight - dropDownTop,
					availableAbove = dropDownTop,
					settingsHeight = setting_dropdown.height()
				;
				
				if (availableBelow > settingsHeight) {
					// Available space below setting is enough
					setting_dropdown.css('top', dropDownTop + "px");
				} else if (availableAbove > settingsHeight) {
					// Available space below is not enough but fine above
					setting_dropdown.css('top', (dropDownTop - settingsHeight - 30) + "px");
				} else {
					// There is no space above and below
				}
				
				setting_dropdown.css("width", select.width() + 10);
				setting_dropdown.css('display', 'block');
			},
			on_scroll: function(e) {
				$('.upfront-settings-item-title').removeClass('active-panel');
				$('.upfront-settings-post-wrapper').hide();
            },
			hide_all: function() {
				var $wrapper = this.$el.parent();
				$wrapper.parent().find(".upfront-settings-item-title").removeClass('active-panel');
				$wrapper.parent().find('.upfront-settings-post-wrapper').hide();
			},
			removePart: function(e) {
				if (e && e.preventDefault) e.preventDefault();

				var enabled_parts = this.model.get('enabled_post_parts'),
					removedIndex = _.indexOf(enabled_parts, this.data_part)
				;

				if(removedIndex != -1){
					enabled_parts.splice(removedIndex, 1);
					this.model.set('enabled_post_parts', enabled_parts);
					this.$el.remove();
					
					this.trigger('update:preset');
				}
			}
		});

		return {
			Options: OptionsModule,
			Toggleable: ToggleableOptions
		};
	});
}(jQuery));