(function ($) {
define([
	'text!upfront/templates/popup.html'
], function(popupTemplate) {
	var l10n = Upfront.Settings && Upfront.Settings.l10n
		? Upfront.Settings.l10n.global.views
		: Upfront.mainData.l10n.global.views
	;

	var PresetCSSEditor = Backbone.View.extend({
		className: 'upfront-ui',
		id: 'upfront-csseditor',
		tpl: _.template($(popupTemplate).find('#csseditor-tpl').html()),
		prepareAce: false,
		ace: false,
		events: {
			'click .upfront-css-save-ok': 'save',
			'click .upfront-css-close': 'close',
			'click .upfront-css-theme_image': 'openThemeImagePicker',
			'click .upfront-css-media_image': 'openImagePicker',
			'click .upfront-css-font': 'startInsertFontWidget',
			'click .upfront-css-selector': 'addSelector',
			'click .upfront-css-type' : 'scrollToElement',
			'mouseenter .upfront-css-selector': 'hiliteElement',
			'mouseleave .upfront-css-selector': 'unhiliteElement',
		},
		//elemenTypes' element id matches model's 'id_slug' attribute
		elementTypes: {
			UaccordionModel: {label: l10n.accordion, id: 'accordion'},
			UcommentModel: {label: l10n.comments, id: 'comment'},
			UcontactModel: {label: l10n.contact_form, id: 'contact'},
			UgalleryModel: {label: l10n.gallery, id: 'gallery', preset_container: 'inline'},
			UimageModel: {label: l10n.image, id: 'image'},
			LoginModel: {label: l10n.login, id: 'upfront-login_element'},
			LikeBox: {label: l10n.like_box, id: 'Like-box-object'},
			MapModel: {label: l10n.map, id: 'upfront-map_element'},
			UnewnavigationModel: {label: l10n.navigation, id: 'nav', preset_container: 'inline'},
			ButtonModel: {label: l10n.button, id: 'button', preset_container: 'inline'},
			//UpostsModel: {label: l10n.posts, id: 'uposts'},WW
			PostsModel: {label: l10n.posts, id: 'posts'},
			UsearchModel: {label: l10n.search, id: 'search'},
			USliderModel: {label: l10n.slider, id: 'slider'},
			SocialMediaModel: {label: l10n.social, id: 'SocialMedia'},
			UtabsModel: {label: l10n.tabs, id: 'tab', preset_container: 'inline'},
			ThisPageModel: {label: l10n.page, id: 'this_page'},
			ThisPostModel: {label: l10n.post, id: 'this_post'},
			UwidgetModel: {label: l10n.widget, id: 'widget'},
			UyoutubeModel: {label: l10n.youtube, id: 'youtube'},
			PlainTxtModel: {label: l10n.text, id:'text', preset_container: 'inline'},
		},
		initialize: function(options) {
			var me = this,
				deferred = $.Deferred(),
				style_selector,
				$style;

			this.options = options || {};
			this.model = options.model;
			this.sidebar = ( options.sidebar !== false );
			this.global = ( options.global === true );

			this.prepareAce = deferred.promise();
			require(['//cdnjs.cloudflare.com/ajax/libs/ace/1.1.01/ace.js'], function(){
				deferred.resolve();
			});

			this.resizeHandler = this.resizeHandler || function(){
				me.$el.width($(window).width() - $('#sidebar-ui').width() -1);
			};

			$(window).on('resize', this.resizeHandler);

			this.modelType = this.options.model.get_property_value_by_name('type');
			this.elementType = this.elementTypes[this.modelType] || {label: 'Unknown', id: 'unknown'};

			style_selector = this.options.preset.get('id');
			$style = $('#' + style_selector);
			if ($style.length === 0) {
				this.$style = $('<style id="' + style_selector + '"></style>');
				$('body').append(this.$style);
			} else {
				this.$style = $style
			}

			this.createSelectors(Upfront.Application.LayoutEditor.Objects);

			this.selectors = this.elementSelectors[this.modelType] || {};

			this.element_id = options.element_id ? options.element_id : this.model.get_property_value_by_name('element_id');

			if ( typeof options.change == 'function' ) this.listenTo(this, 'change', options.change);

			this.render();

			this.startResizable();
		},
		close: function(event) {
			if(event)
				event.preventDefault();

			$(window).off('resize', this.resizeHandler);

			if(this.editor)
				this.editor.destroy();

			$('#page').css('padding-bottom', 0);
			this.remove();
		},
		render: function() {
			var me = this;

			$('#page').append(this.$el);

			if (!this.sidebar)
				this.$el.addClass('upfront-css-no-sidebar');
			else
				this.$el.removeClass('upfront-css-no-sidebar');

			this.$el.html(this.tpl({
				name: this.stylename,
				elementType: this.elementType.label,
				selectors: this.selectors,
				show_style_name: false,
				showToolbar: true
			}));

			this.resizeHandler('.');

			var bodyHeight = this.$el.height() - this.$('.upfront-css-top').outerHeight();
			this.$('.upfront-css-body').height(bodyHeight);

			this.prepareAce.done(function(){
				me.startAce();
			});

			this.prepareSpectrum();

			this.$el.show();
		},
		startAce: function() {
			var me = this,
				editor = ace.edit(this.$('.upfront-css-ace')[0]),
				session = editor.getSession()
			;

			session.setUseWorker(false);
			editor.setShowPrintMargin(false);

			session.setMode("ace/mode/css");
			editor.setTheme('ace/theme/monokai');

			editor.on('change', function(event){
				var styles_with_selector;
				var rules = editor.getValue().split('}');
				var preset_class = '\n\n' + me.get_css_selector();

				if(typeof me.elementType.preset_container === "undefined") {
					preset_class = preset_class + ' ';
				}

				rules = _.map(rules, function(rule){return $.trim(rule);});
				rules.pop();

				styles_with_selector = me.stylesAddSelector($.trim(editor.getValue()), '#page ' + me.get_css_selector());
				// Solve case of button loosing its styles
				styles_with_selector = styles_with_selector.replace(new RegExp(me.get_css_selector() + ' .upfront-button', 'g'), me.get_css_selector() + '.upfront-button');

				me.$style.html(styles_with_selector);
				me.trigger('change', styles_with_selector);
			});


			var styles = this.options.preset.get('preset_style') ? this.options.preset.get('preset_style') : '';

			scope = new RegExp(this.get_css_selector() + '\\s*', 'g');
			styles = styles.replace(new RegExp('#page ' + this.get_css_selector() + '\\s*', 'g'), '');
			styles = styles.replace(scope, '');
			// Unescape quotes a few times
			styles = styles.replace(/\\'/g, "'");
			styles = styles.replace(/\\'/g, "'");
			styles = styles.replace(/\\'/g, "'");
			styles = styles.replace(/\\"/g, '"');
			styles = styles.replace(/\\"/g, '"');
			styles = styles.replace(/\\"/g, '"');

			styles = Upfront.Util.colors.convert_string_color_to_ufc(styles.replace(/div#page .upfront-region-container .upfront-module/g, '#page'));
			editor.setValue($.trim(styles), -1);

			// Set up the proper vscroller width to go along with new change.
			editor.renderer.scrollBar.width = 5;
			editor.renderer.scroller.style.right = "5px";

			editor.focus();
			this.editor = editor;
		},
		prepareSpectrum: function(){
			var me = this,
				color_picker = new Upfront.Views.Editor.Field.Color({
					default_value: '#ffffff',
					showAlpha: true,
					showPalette: true,
					maxSelectionSize: 9,
					localStorageKey: "spectrum.recent_bgs",
					preferredFormat: "hex",
					chooseText: "Ok",
					showInput: true,
					allowEmpty:true,
					autohide: false,
					spectrum: {
						show: function(){
							//spectrum = $('.sp-container:visible');
						},
						choose: function(color) {
							var colorString = color.alpha < 1 ? color.toRgbString() : color.toHexString();
							me.editor.insert(colorString);
							me.editor.focus();
						}
					}
				})
			;
			color_picker.render();
			me.$('.upfront-css-color').html(color_picker.el);
		},
		createSelectors: function(objects){
			var me = this,
				selectors = {}
			;

			_.each(objects, function(object){
				selectors[object.cssSelectorsId] = object.cssSelectors || {};
			});
			me.elementSelectors = selectors;
		},

		createSelector: function(model_class, view_class, id) {
			var model = new model_class(),
				view = new view_class({model: model});
			this.elementSelectors[id] = view.cssSelectors || {};
			view.remove();
		},
		startResizable: function() {
			// Save the fetching inside the resize
			var me = this,
				$cssbody = me.$('.upfront-css-body'),
				topHeight = me.$('.upfront-css-top').outerHeight(),
				$selectors = me.$('.upfront-css-selectors'),
				$saveform = me.$('.upfront-css-save-form'),
				onResize = function(e, ui){
					var height = ui ? ui.size.height : me.$('.upfront-css-resizable').height(),
						bodyHeight = height  - topHeight;
					$cssbody.height(bodyHeight);
					if(me.editor)
						me.editor.resize();
					$selectors.height(bodyHeight - $saveform.outerHeight());
					$('#page').css('padding-bottom', height);
				}
			;
			onResize();
			this.$('.upfront-css-resizable').resizable({
				handles: {n: '.upfront-css-top'},
				resize: onResize,
				minHeight: 200,
				delay: 100
			});
		},
		remove: function() {
			Backbone.View.prototype.remove.call(this);
			$(window).off('resize', this.resizeHandler);
		},
		openThemeImagePicker: function () {
			this._open_media_popup({themeImages: true});
		},

		openImagePicker: function(){
			this._open_media_popup();
		},

		/**
		 * Handles media popups.
		 * In this context, used for both theme and media images list.
		 *
		 * @param object opts Boot-time options to be passed to Upfront.Media.Manager
		 */
		_open_media_popup: function (opts) {
			opts = _.isObject(opts) ? opts : {};
			var me = this,
				options = _.extend({}, opts)
			;

			Upfront.Media.Manager.open(options).done(function(popup, result){
				Upfront.Events.trigger('upfront:element:edit:stop');
				if (!result) return;

				var imageModel = result.models[0],
					img = imageModel.get('image') ? imageModel.get('image') : result.models[0],
					url = 'src' in img ? img.src : ('get' in img ? img.get('original_url') : false)
				;

				me.editor.insert('url("' + url + '")');
				me.editor.focus();
			});
		},
		startInsertFontWidget: function() {
			var insertFontWidget = new Preset_Insert_Font_Widget({
				editor: this.editor,
				collection: Upfront.Views.Editor.Fonts.theme_fonts_collection
			});

			$('#insert-font-widget').html(insertFontWidget.render().el);
		},
		scrollToElement: function(){
			var $element = $('#' + this.element_id);
			if(!$element.length)
				return;

			var offset = $element.offset().top - 50;
			$(document).scrollTop(offset > 0 ? offset : 0);

			this.blink($element, 4);
		},
		hiliteElement: function(e){
			var preset_selector = this.get_css_selector();

			if(typeof this.elementType.preset_container === "undefined") {
				preset_selector = preset_selector + ' ';
			}

			var selector = preset_selector + $(e.target).data('selector');

			if(!selector.length)
				return;
			var element = $('#' + this.element_id);
			element.find(selector).addClass('upfront-css-hilite');
		},

		unhiliteElement: function(e){
			var preset_selector = this.get_css_selector();

			if(typeof this.elementType.preset_container === "undefined") {
				preset_selector = preset_selector + ' ';
			}

			var selector = preset_selector + $(e.target).data('selector');

			if(!selector.length)
				return;
			var element = $('#' + this.element_id);
			element.find(selector).removeClass('upfront-css-hilite');
		},
		addSelector: function(e) {
			var selector = $(e.target).data('selector');
			this.editor.insert(selector);
			this.editor.focus();
		},
		get_css_selector: function() {
			if (this.is_global_stylesheet) return '';
			return '.' + this.options.preset.get('id');
		},
		updateStyles: function(contents){
			var $el = this.get_style_element();
			Upfront.Util.Transient.push('css-' + this.element_id, $el.html());
			contents = Upfront.Util.colors.convert_string_ufc_to_color( contents);
			$el.html(
				this.stylesAddSelector(
					contents, (this.is_default_style ? '' : '#page ' + this.get_css_selector())
					).replace(/#page/g, 'div#page .upfront-region-container .upfront-module')
			);
			this.trigger('updateStyles', this.element_id);
		},

		stylesAddSelector: function(contents, selector) {
			if (this.is_global_stylesheet && empty(selector)) return contents;
			var me = this,
				rules = contents.split('}'),
				processed = ''
			;
			_.each(rules, function (rl) {
				var src = $.trim(rl).split('{');
				if (src.length != 2) return true; // wtf
				var individual_selectors = src[0].split(','),
					processed_selectors = []
				;
				_.each(individual_selectors, function (sel) {
					sel = $.trim(sel);
					var clean_selector = sel.replace(/:[^\s]+/, ''); // Clean up states states such as :hover, so as to not mess up the matching
					var	is_container = clean_selector[0] === '@' || me.recursiveExistence(selector, clean_selector),
						spacer = is_container
							? '' // This is not a descentent selector - used for containers
							: ' ' // This is a descentent selector
					;

					processed_selectors.push('' +
						selector + spacer + sel +
					'');
				});
				processed += processed_selectors.join(', ') + ' {' +
					src[1] + // Actual rule
				'\n}\n';
			});
			return processed;
		/*
			var rules = contents.split('}'),
				separator = '\n\n' + selector + ' ';


			rules = _.map(rules, function(rule){return $.trim(rule);});

			rules.pop();

			return separator + rules.join('\n}' + separator) + '\n}';
		*/
		},
		recursiveExistence: function(selector, clean_selector) {
			var splitted = clean_selector.split(' ');
			var me = this;
			while(splitted.length > 0) {
				try{
					if(!!$(selector + splitted.join(' ')).closest('#' + me.element_id).length)
						return true;
				}
				catch (err) {

				}
				splitted.pop();
			}

			return false;
		},
		save: function(event) {
			if (event) event.preventDefault();
			var me = this,
				styles = $.trim(this.editor.getValue()),
				data;

			if (this.is_global_stylesheet === false && this.stylename === this.get_temp_stylename())
				return Upfront.Views.Editor.notify(l10n.style_name_nag, 'error');

			if(!styles)
				return Upfront.Views.Editor.notify(l10n.style_empty_nag, 'error');

			styles = this.stylesAddSelector(styles, (this.is_default_style ? '' : this.get_css_selector()));
			data = {
				styles: styles,
				elementType: this.elementType.id,
				global: this.global
			};

			this.options.preset.set('preset_style', data.styles);

			this.trigger('upfront:presets:update', this.options.preset.toJSON());

			return Upfront.Views.Editor.notify(l10n.preset_style_saved.replace(/%s/,  this.elementType.id));

		},
	});

	var Preset_Insert_Font_Widget = Backbone.View.extend({
		initialize: function(options) {
			var me = this;

			this.editor = options.editor;

			this.fields = [
				new Upfront.Views.Editor.Field.Typeface_Chosen_Select({
					label: '',
					compact: true,
					values: Upfront.Views.Editor.Fonts.theme_fonts_collection.get_fonts_for_select(),
					additional_classes: 'choose-typeface',
					select_width: '230px'
				}),
				new Upfront.Views.Editor.Field.Typeface_Style_Chosen_Select({
					label: '',
					compact: true,
					values: [],
					additional_classes: 'choose-variant',
					select_width: '120px'
				}),
				new Upfront.Views.Editor.Field.Button({
					label: l10n.insert_font,
					compact: true,
					on_click: function(){
						me.finish();
					}
				})
			];
		},
		render: function() {
			$('#insert-font-widget').html('').addClass('open');
			this.$el.html('');
			_.each(this.fields, function(field) {
				field.render();
				this.$el.append(field.el);
			}, this);

			this.listenTo(this.fields[0], 'changed', function() {
				var variants = Upfront.Views.Editor.Fonts.theme_fonts_collection.get_variants(this.fields[0].get_value());
				this.render_variants(variants);
			});
			this.listenTo(this.fields[1], 'changed', function() {
				this.preview_font();
			});

			return this;
		},
		render_variants: function(variants) {
			var $variant_field = this.$el.find('.choose-variant select');
			$variant_field.find('option').remove();
			$variant_field.append('<option value="">' + l10n.choose_variant + '</option>');
			_.each(variants, function(variant) {
				$variant_field.append('<option value="' + variant + '">' + variant + '</option>');
			});
			$variant_field.trigger('chosen:updated');
		},
		preview_font: function() {
			this.replaceFont({
				font_family: this.fields[0].get_value(),
				variant: Upfront.Views.Font_Model.parse_variant(this.fields[1].get_value())
			});
		},
		replaceFont: function(font) {
			var lines;

			this.style_doc = this.editor.getSession().getDocument();

			this.last_selected_font = font;

			// Insert selected font family
			if (!this.font_family_range) {
				this.font_family_range = this.editor.getSelection().getRange();
			} else {
				this.font_family_range.end = this.end_point;
			}
			this.end_point = this.style_doc.replace(this.font_family_range, font.font_family);

			// Insert selected weight and style, first reset them
			this.reset_properties();
			lines = [];
			if (font.variant.weight) {
				lines.push('    font-weight: ' + font.variant.weight + ';');
			}
			if (font.variant.style) {
				lines.push('    font-style: ' + font.variant.style + ';');
			}
			if (lines.length > 0) {
				this.style_doc.insertLines(this.font_family_range.start.row + 1, lines);
			}
		},
		reset_properties: function() {
			var row, line, result;
			this.style_doc = this.editor.getSession().getDocument();
			// Search forward only from font family row since lower properties override upper
			result = {};
			row = this.font_family_range.start.row + 1;
			line = this.style_doc.getLine(row);
			while (line.indexOf('}') < 0) {
				if (line.indexOf('font-weight') !== -1) {
					result.weight = row;
					if (!this.starting_weight) this.starting_weight = line;
				}
				if (line.indexOf('font-style') !== -1) {
					result.style = row;
					if (!this.starting_style) this.starting_style = line;
				}

				row++;
				line = this.style_doc.getLine(row);
				if (!line) {
					// Fix missing closing paren
					//this.style_doc.insertLines(row, ['}']); // This adds a standalone new brace for some reason
					break;
				}
			}

			// Reset properties. This is complicated. If both font style and font weight properties are in current style rule
			// we need to remove them carefully because when we remove first, seconds' row number might change
			// so first remove one with higher row number.
			if (result.weight && result.style) {
				if (result.weight > result.style) {
					this.style_doc.removeLines(result.weight, result.weight);
					this.style_doc.removeLines(result.style, result.style);
				} else {
					this.style_doc.removeLines(result.style, result.style);
					this.style_doc.removeLines(result.weight, result.weight);
				}
				result.weight = false;
				result.style = false;
			}
			if (result.weight) {
				this.style_doc.removeLines(result.weight, result.weight);
			}
			if (result.style) {
				this.style_doc.removeLines(result.style, result.style);
			}
		},
		finish: function() {
			$('#insert-font-widget').html('<a class="upfront-css-font" href="#">' + l10n.insert_font + '</a>').removeClass('open');
		}
	});

	return PresetCSSEditor;
});
})(jQuery);
