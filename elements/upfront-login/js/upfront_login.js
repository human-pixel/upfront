(function ($) {
define([
	'text!elements/upfront-login/css/edit.css',
	'text!elements/upfront-login/css/public.css'
], function (editor_style, public_style) {

	$("head").append("<style>" + editor_style + "</style>");
	$("head").append("<style>" + public_style + "</style>");

	var l10n = Upfront.Settings.l10n.login_element;

	var LoginModel = Upfront.Models.ObjectModel.extend({
		init: function () {
			var properties = _.clone(Upfront.data.upfront_login.defaults);
			properties.element_id = Upfront.Util.get_unique_id(properties.id_slug + '-object');
			this.init_properties(properties);
		}
	});

	var LoginView = Upfront.Views.ObjectView.extend({
		markup: false,

		cssSelectors: {
			'.upfront_login-form p': {label: l10n.css.containers, info: l10n.css.containers_info},
			'.upfront_login-form form label': {label: l10n.css.labels, info: l10n.css.labels_info},
			'.upfront_login-form form input:not([type=submit]):not([type=checkbox])': {label: l10n.css.inputs, info: l10n.css.inputs_info},
			'.upfront_login-form form  input[type=submit]': {label: l10n.css.button, info: l10n.css.button_info},
			'.upfront_login-form form  input[type=checkbox]': {label: l10n.css.remember, info: l10n.css.remember_info},
			'.login-lostpassword': {label: l10n.css.pwd_wrap, info: l10n.css.pwd_wrap_info},
			'.upfront_login-form p .login-lostpassword-link': {label: l10n.css.pwd_link, info: l10n.css.pwd_link_info},
			'.upfront_login-trigger': {label: l10n.css.close, info: l10n.css.close_info}
		},

		initialize: function () {
			if(! (this.model instanceof LoginModel)){
				this.model = new LoginModel({properties: this.model.get('properties')});
			}
			Upfront.Views.ObjectView.prototype.initialize.call(this);
			var me = this;
			this.model.get("properties").on("change", function (model) {
				if (!model || !model.get) return true;
				if ("row" != model.get("name")) {
					me.markup = false;
					me.render();
				}
			});
		},

		render: function () {
			if (!this.markup) {
				var me = this,
					options = Upfront.Util.model_to_json(this.model)
				;
				Upfront.Util.post({
					"action": "upfront-login_element-get_markup",
					properties: options.properties
				}).done(function (response) {
					me.markup = response.data;
					Upfront.Views.ObjectView.prototype.render.call(me);
				});
			}
			Upfront.Views.ObjectView.prototype.render.call(this);
		},
		get_content_markup: function () {
			return !!this.markup ? this.markup : l10n.hold_on;
		}
	});

	var Login_Fields_FieldAppearance_Icon_Image = Upfront.Views.Editor.Field.Text.extend({
		className: 'upfront-field-wrap upfront-field-wrap-appearance-icon-image',
		get_field_html: function () {
			return '<div class="upfront_login-icon">' +
					'<img src="' + Upfront.data.upfront_login.root_url + 'img/icon.png" />' +
					Upfront.Views.Editor.Field.Text.prototype.get_field_html.call(this) +
				'</div>'
			;
		},
		get_saved_value: function () {
			var prop = this.property ? this.property.get('value') : (this.model ? this.model.get(this.name) : '');
			return 'icon' === prop ? '' : prop;
		},
		get_value: function () {
			return this.$el.find("input").val() || 'icon';
		}
	});

	var Login_SettingsItem_ComplexItem = Upfront.Views.Editor.Settings.Item.extend({
		save_fields: function () {
			var model = this.model;
			this.fields.each(function (field) {
				var data = field.get_value();
				_(data).each(function (val, idx) {
					if ('appearance' == idx && !val) return true;
					model.set_property(idx, val);
				});
			});
		}
	});

	var Login_Fields_Complex_BooleanField = Backbone.View.extend({
		className: "upfront_login-fields-complex_boolean clearfix",
		initialize: function (opts) {
			this.options = opts;
			var model = opts.model,
				boolean_values = opts.boolean_field.values || []
			;
			if (!boolean_values.length) {
				boolean_values.push({label: "", value: "1"});
			}

			this.options.field = new Upfront.Views.Editor.Field.Radios(_.extend(
				opts.boolean_field, {
					model: model,
					mutiple: false,
					values: boolean_values
			}));
		},
		render: function () {
			this.$el.empty();

			this.options.subfield.render();
			this.options.field.render();

			this.$el.append(this.options.field.$el);
			this.$el.append(this.options.subfield.$el);

			if (this.options.additional_class) this.$el.addClass(this.options.additional_class);
		},
		get_value: function () {
			var data = {};
			data[this.options.field.get_name()] = this.options.field.get_value();
			data[this.options.subfield.get_name()] = this.options.subfield.get_value();
			return data;
		}
	});


	var LoginSettings = Upfront.Views.Editor.Settings.Settings.extend({
		initialize: function (opts) {
			this.options = opts;
			var panel = new LoginSettings_Panel({model: this.model});
			this.panels = _([
				panel
			]);
		},
		get_title: function () {
			return l10n.settings;
		}
	});
		var LoginSettings_Panel = Upfront.Views.Editor.Settings.Panel.extend({
			initialize: function (opts) {
				this.options = opts;
				var appearance = new LoginSettings_Field_DisplayAppearance({model: this.model}),
					behavior = new LoginSettings_Field_DisplayBehavior({model: this.model}),
					trigger = new LoginSettings_Field_DisplayTrigger({model: this.model}),
					me = this
				;
				this.settings = _([
					appearance,
					behavior,
					trigger
				]);
				appearance.on("login:appearance:changed", behavior.update, behavior);
				appearance.on("login:appearance:changed", trigger.update, trigger);
				appearance.on("login:appearance:changed", function () {
					me.trigger("upfront:settings:panel:refresh", me);
				})
			},
			render: function () {
				Upfront.Views.Editor.Settings.Panel.prototype.render.call(this);
				this.$el.addClass("upfront_login-settings-panel");
				this.settings.each(function (setting) {
					if (setting.update) setting.update();
				});
			},
			get_label: function () {
				return l10n.display;
			},
			get_title: function () {
				return l10n.display;
			}
		});
			var LoginSettings_Field_DisplayBehavior = Upfront.Views.Editor.Settings.Item.extend({
				events: function () {
					return _.extend({},
						Upfront.Views.Editor.Settings.Item.prototype.events,
						{"click": "register_change"}
					);
				},
				initialize: function () {
					var style = this.model.get_property_value_by_name("style");
					var hover_disabled = !style || "popup" == style;
					var behaviors = [
						{label: l10n.show_on_hover, value: "hover", disabled: hover_disabled},
						{label: l10n.show_on_click, value: "click"},
					];
					this.fields = _([
						new Upfront.Views.Editor.Field.Radios({
							model: this.model,
							property: "behavior",
							values: behaviors
						}),
					]);
				},
				render: function () {
					Upfront.Views.Editor.Settings.Item.prototype.render.call(this);
					this.$el
						.addClass("upfront_login-item-display_behavior")
						.find(".upfront-settings-item-content").addClass("clearfix").end()
						.hide()
					;
				},
				get_title: function () {
					return l10n.behavior;
				},
				register_change: function () {
					this.fields.each(function (field) {
						field.property.set({'value': field.get_value()}, {'silent': false});
					});
					this.trigger("login:behavior:changed");
				},
				update: function () {
					var style = this.model.get_property_value_by_name("style");
					this.initialize();
					this.$el.empty();
					this.render();
					if ("form" != style) this.$el.show();
				}
			});
			var LoginSettings_Field_DisplayAppearance = Login_SettingsItem_ComplexItem.extend({
				events: function () {
					return _.extend({},
						Upfront.Views.Editor.Settings.Item.prototype.events,
						{"click": "register_change"}
					);
				},
				initialize: function () {
					var styles = [
						{label: l10n.on_page, value: "form"},
						{label: l10n.dropdown, value: "dropdown"},
						{label: l10n.in_lightbox, value: "popup"},
					];
					this.fields = _([
						new Upfront.Views.Editor.Field.Radios({
							model: this.model,
							property: "style",
							layout: "vertical",
							values: styles
						})
					]);
				},
				render: function () {
					Upfront.Views.Editor.Settings.Item.prototype.render.call(this);
					this.$el.find(".upfront-settings-item-content").addClass("clearfix");
				},
				get_title: function () {
					return l10n.appearance;
				},
				register_change: function () {
					this.fields.each(function (field) {
						field.property.set({'value': field.get_value()}, {'silent': false});
					});
					this.trigger("login:appearance:changed");
				}
			});
			var LoginSettings_Field_DisplayTrigger = Login_SettingsItem_ComplexItem.extend({
				initialize: function () {
					this.fields = _([
						new Login_Fields_Complex_BooleanField({
							model: this.model,
							additional_class: "upfront_login-appearance-icon",
							boolean_field: {
								property: 'appearance',
								values: [{label: '', value: 'icon'}]
							},
							subfield: new Login_Fields_FieldAppearance_Icon_Image({model: this.model, property: 'label_image'})
						}),
						new Login_Fields_Complex_BooleanField({
							model: this.model,
							additional_class: "upfront_login-appearance-label",
							boolean_field: {
								property: 'appearance',
								values: [{label: '', value: 'label'}]
							},
							subfield: new Upfront.Views.Editor.Field.Text({
								model: this.model,
								property: 'label_text'
							})
						}),
					]);
				},
				update: function () {
					var style = this.model.get_property_value_by_name("style");
					this.initialize();
					this.$el.empty();
					this.render();
					if ("form" != style) this.$el.show();
				},
				render: function () {
					Upfront.Views.Editor.Settings.Item.prototype.render.call(this);
					this.$el
						.find(".upfront-settings-item-content").addClass("clearfix").end()
						.hide()
					;
				},
				get_title: function () {
					return l10n.trigger;
				}
			});


	var LoginElement = Upfront.Views.Editor.Sidebar.Element.extend({
		priority: 130,

		render: function () {
			this.$el.addClass('upfront-icon-element upfront-icon-element-login');
			this.$el.html(l10n.element_name);
		},

		add_element: function () {

			var object = new LoginModel(),
				module = new Upfront.Models.Module({
					name: "",
					properties: [
						{"name": "element_id", "value": Upfront.Util.get_unique_id("module")},
						{"name": "class", "value": "c24 upfront-login_element-module"},
						{"name": "has_settings", "value": 0},
						{"name": "row", "value": Upfront.Util.height_to_row(210)}
					],
					objects: [object]
				})
			;
			this.add_module(module);
		}
	});
	Upfront.Application.LayoutEditor.add_object("Login", {
		"Model": LoginModel,
		"View": LoginView,
		"Element": LoginElement,
		"Settings": LoginSettings
	});
	Upfront.Models.LoginModel = LoginModel;
	Upfront.Views.LoginView = LoginView;

});
})(jQuery);
