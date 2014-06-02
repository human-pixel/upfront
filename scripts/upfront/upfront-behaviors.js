(function ($) {

var LayoutEditor = {
	create_mergeable: function (view, model) {
		var app = this,
			regions = app.layout.get('regions')
		;
		view.$el.selectable({
      		distance: 10, // Prevents global click hijack
			filter: ".upfront-module",
			cancel: ".upfront-module, .upfront-module-group, .upfront-region-side-fixed, .upfront-entity_meta, .upfront-region-edit-trigger, .upfront-region-edit-fixed-trigger, .upfront-region-finish-edit, .upfront-icon-control-region-resize, .upfront-inline-modal, .upfront-inline-panels",
			selected: function (e, ui) {
				var $el = $(ui.selected);
				$el.prepend('<div class="upfront-selected-border" />');
			},
			unselected: function (e, ui) {
				var $el = $(ui.unselected);
				$el.find('.upfront-selected-border').remove();
				$('.upfront-module-group-group').remove();
			},
			stop: function (e, ui) {
				if ( !$(".ui-selected").length )
					return false;
				var me = this,
					$region = $(".ui-selected:first").closest('.upfront-region'),
					region = regions.get_by_name($region.data('name')),
					region_modules = (region ? region.get("modules") : false),
					region_wrappers = (region ? region.get("wrappers") : false),
					unselect = function(){
						$(this).find('.upfront-selected-border').remove();
						$(this).removeClass('ui-selected');
					},
					$dont_select = $(".ui-selected").filter(function(){
						// don't select any module in different region
						return ( $(this).closest('.upfront-region').get(0) != $region.get(0) );
					}).each(unselect),
					$dont_select2 = $(".ui-selected").filter(function(){
						// don't select any module inside group
						return ( $(this).closest('.upfront-module-group').length > 0 );
					}).each(unselect),
					/*$dont_select3 = $(".ui-selected").filter(function(){
						// don't select any module that don't have direct sibling selected
						var $view = $(this).closest('.upfront-module-view'),
							next_selected = ( $view.next('.upfront-module-view').find('.ui-selected').length > 0 ),
							prev_selected = ( $view.prev('.upfront-module-view').find('.ui-selected').length > 0 ),
							$wrap = $(this).closest('.upfront-wrapper'),
							wrap_next_selected = ( $wrap.next('.upfront-wrapper').find('.ui-selected').length > 0 ),
							wrap_prev_selected = ( $wrap.prev('.upfront-wrapper').find('.ui-selected').length > 0 )
						;
						return ( !next_selected && !prev_selected && !wrap_next_selected && !wrap_prev_selected );
					}).each(unselect),*/
					$selected = $(".ui-selected");
				if ($selected.length < 2){
					$selected.each(unselect);
					return false;
				};
				$('.upfront-module-group-group').remove();
				var $group = $('<div class="upfront-module-group-toggle upfront-module-group-group">Group</div>'),
					sel_top = sel_left = sel_right = sel_bottom = false,
					wrap_top = wrap_left = wrap_right = wrap_bottom = false,
					group_top = group_left = 0;
				$('body').append($group);
				$selected.each(function(){
					var off = $(this).offset(),
						width = $(this).outerWidth(),
						height = $(this).outerHeight(),
						$wrap = $(this).closest('.upfront-wrapper'),
						wrap_off = $wrap.offset(),
						wrap_width = $wrap.outerWidth(),
						wrap_height = $wrap.outerHeight();
					off.right = off.left + width;
					off.bottom = off.top + height;
					sel_top = ( sel_top === false || off.top < sel_top ) ? off.top : sel_top;
					sel_bottom = ( sel_bottom === false || off.bottom > sel_bottom ) ? off.bottom : sel_bottom;
					sel_left = ( sel_left === false || off.left < sel_left ) ? off.left : sel_left;
					sel_right = ( sel_right === false || off.right > sel_right ) ? off.right : sel_right;
					wrap_off.right = wrap_off.left + wrap_width;
					wrap_off.bottom = wrap_off.top + wrap_height;
					wrap_top = ( wrap_top === false || wrap_off.top < wrap_top ) ? wrap_off.top : wrap_top;
					wrap_bottom = ( wrap_bottom === false || wrap_off.bottom > wrap_bottom ) ? wrap_off.bottom : wrap_bottom;
					wrap_left = ( wrap_left === false || wrap_off.left < wrap_left ) ? wrap_off.left : wrap_left;
					wrap_right = ( wrap_right === false || wrap_off.right > wrap_right ) ? wrap_off.right : wrap_right;
				});
				group_top = sel_top + Math.round( (sel_bottom-sel_top)/2 ) - Math.round( $group.outerHeight()/2 );
				group_left = sel_left + Math.round( (sel_right-sel_left)/2 ) - Math.round( $group.outerWidth()/2 );
				$group.css({
					position: 'absolute',
					zIndex: 999999,
					top: group_top,
					left: group_left
				});
				$group.on('click', function () {
					var ed = Upfront.Behaviors.GridEditor,
						group_id = Upfront.Util.get_unique_id("module-group"),
						group = new Upfront.Models.ModuleGroup(),
						group_view = false,
						group_modules = group.get('modules'),
						group_wrappers = group.get('wrappers'),
						group_wrapper_id = Upfront.Util.get_unique_id("wrapper"),
						group_wrapper = new Upfront.Models.Wrapper(),
						modules = [],
						max_col = Math.round((wrap_right-wrap_left)/ed.grid.column_width),
						last_index = 0,
						module_index = margin_top = margin_left = col = false,
						line = line_col = wrapper_index = wrapper_col = 0,
						current_wrapper_id, new_wrapper_id, new_wrapper;
					$selected.each(function (i) {
						var $node = $(this),
							element_id = $node.attr("id"),
							module = region_modules.get_by_element_id(element_id),
							module_class = module.get_property_value_by_name('class'),
							module_col = ed.get_class_num(module_class, ed.grid.class),
							module_top = ed.get_class_num(module_class, ed.grid.top_margin_class),
							module_left = ed.get_class_num(module_class, ed.grid.left_margin_class),
							index = region_modules.indexOf(module),
							is_next = ( index-last_index == 1 ),
							wrapper_id = module.get_wrapper_id(),
							wrapper = region_wrappers.get_by_wrapper_id(wrapper_id),
							wrapper_class = wrapper.get_property_value_by_name('class'),
							wrapper_col = ed.get_class_num(wrapper_class, ed.grid.class),
							position;
						if ( module_index === false )
							module_index = index;
						if ( current_wrapper_id != wrapper_id )
							wrapper_index++;
						if ( i == 0 || !is_next || line_col+wrapper_col > max_col || ( current_wrapper_id != wrapper_id && wrapper_class.match(/clr/) ) ) { // this module appear in a new line
							line++;
							is_next = false;
							line_col = wrapper_col;
						}
						else if ( current_wrapper_id != wrapper_id ) {
							if ( line_col + wrapper_col > max_col ){
								is_next = false;
								line_col = ( wrapper_col < max_col && wrapper_col > line_col ? wrapper_col : line_col );
							}
							else {
								line_col += wrapper_col;
							}
						}
						modules.push({
							model: module,
							col: module_col,
							is_next: is_next,
							margin_top: module_top,
							margin_left: module_left,
							wrapper_class: wrapper_class,
							wrapper_col: wrapper_col
						});
						if ( wrapper_index == 1 || wrapper_class.match(/clr/) )
							margin_left = ( margin_left === false || module_left < margin_left ) ? module_left : margin_left;
						if ( line == 1 && current_wrapper_id != wrapper_id )
							margin_top = ( margin_top === false || module_top < margin_top ) ? module_top : margin_top;
						col = ( col === false || line_col > col ) ? line_col : col;
						current_wrapper_id = wrapper_id;
						last_index = index;
					});
					console.log(modules)
					margin_left = margin_left === false ? 0 : margin_left;
					margin_top = margin_top === false ? 0 : margin_top;
					col = col - margin_left;
					line = 0;
					wrapper_index = 0;
					current_wrapper_id = false;
					_.each(modules, function(module, index){
						var wrapper_id = module.model.get_wrapper_id(),
							new_classes = [];
						if ( current_wrapper_id != wrapper_id ){
							new_wrapper = new Upfront.Models.Wrapper({});
							new_wrapper_id = Upfront.Util.get_unique_id("wrapper");
							new_wrapper.set_property('wrapper_id', new_wrapper_id);
							new_wrapper.set_property('class', module.wrapper_class);
							group_wrappers.add(new_wrapper);
							wrapper_col = 0;
							wrapper_index++;
						}
						if ( index == 0 || !module.is_next || ( current_wrapper_id != wrapper_id && module.wrapper_class.match(/clr/) ) )
							line++;
						if ( wrapper_index == 1 || !module.is_next || module.wrapper_class.match(/clr/) ){
							new_classes.push(ed.grid.left_margin_class + (module.margin_left-margin_left));
							wrapper_col = module.wrapper_col - margin_left;
						}
						else {
							wrapper_col = module.wrapper_col;
						}
						if ( line == 1 && current_wrapper_id != wrapper_id )
							new_classes.push(ed.grid.top_margin_class + (module.margin_top-margin_top));
						new_wrapper.replace_class(ed.grid.class + wrapper_col);
						current_wrapper_id = wrapper_id;
						module.model.set_property('wrapper_id', new_wrapper_id);
						module.model.replace_class(new_classes.join(" "));
						region_modules.remove(module.model, {silent: true});
						group_modules.add(module.model);
					});
					group_wrapper.set_property('wrapper_id', group_wrapper_id);
					group_wrapper.set_property('class', modules[0].wrapper_class);
					region_wrappers.add(group_wrapper);
					group.set_property('element_id', group_id);
					group.set_property('wrapper_id', group_wrapper_id);
					group.replace_class( ed.grid.class + col + " " + ed.grid.top_margin_class + margin_top + " " + ed.grid.left_margin_class + margin_left );
					group.add_to(region_modules, module_index);
					// now normalize the wrappers
					group_view = Upfront.data.module_views[group.cid];
					ed.start(group_view, group);
					ed.update_wrappers(region);
					$(this).remove();
				});
			}
		});
	},

	refresh_mergeable: function () {
		$(".ui-selectable").each(function () {
			$(this).selectable("refresh");
		});
	},
	
	enable_mergeable: function () {
		$(".ui-selectable").each(function () {
			$(this).selectable("enable");
		});
	},	
	
	disable_mergeable: function () {
		$(".ui-selectable").each(function () {
			$(this).selectable("disable");
		});
	},	

	destroy_mergeable: function () {
		$(".ui-selectable").each(function () {
			$(this).selectable("destroy");
		});
	},

	create_undo: function () {
		this.layout.store_undo_state();
	},
	apply_history_change: function () {
		var regions = Upfront.Application.layout.get("regions"),
			region = regions ? regions.get_by_name('shadow') : false
		;
		if (regions && region) { regions.remove(region); region = false; }
		Upfront.Application.layout_view.render();
	},

	save_dialog: function (on_complete, context) {
		$("body").append("<div id='upfront-save-dialog-background' />");
		$("body").append("<div id='upfront-save-dialog' />");
		var $dialog = $("#upfront-save-dialog"),
			$bg = $("#upfront-save-dialog-background"),
			current = Upfront.Application.layout.get("current_layout"),
			html = ''
		;
		$bg
			.width($(window).width())
			.height($(document).height())
		;
		html += '<p>Do you wish to save layout just for this post or apply it to all posts?</p>';
		$.each(_upfront_post_data.layout, function (idx, el) {
			//var checked = el == current ? "checked='checked'" : '';
			//html += '<input type="radio" name="upfront_save_as" id="' + el + '" value="' + el + '" ' + checked + ' />';
			//html += '&nbsp;<label for="' + el + '">' + Upfront.Settings.LayoutEditor.Specificity[idx] + '</label><br />';
			if ( idx == 'type' )
				return;
			html += '<span class="upfront-save-button" data-save-as="' + el + '">' + Upfront.Settings.LayoutEditor.Specificity[idx] + '</span>';
		});
		//html += '<button type="button" id="upfront-save_as">Save</button>';
		//html += '<button type="button" id="upfront-cancel_save">Cancel</button>';
		$dialog
			.html(html)
		;
		$("#upfront-save-dialog").on("click", ".upfront-save-button", function () {
			/*var $check = $dialog.find(":radio:checked"),
				selected = $check.length ? $check.val() : false
			;*/
			var selected = $(this).attr('data-save-as');
			$bg.remove(); $dialog.remove();
			on_complete.apply(context, [selected]);
			return false;
		});
		$("#upfront-save-dialog-background").on("click", function () {
			$bg.remove(); $dialog.remove();
			return false;
		});
	},

	create_layout_dialog: function() {
		var app = Upfront.Application,
			ed = Upfront.Behaviors.LayoutEditor,
			fields = {
				layout: new Upfront.Views.Editor.Field.Select({
					name: 'layout',
					values: [{label: "Loading...", value: ""}]
				})
			};
		if ( !ed.available_layouts )
			Upfront.Util.post({
				action: 'upfront_list_available_layout'
			}).done(function(data){
				ed.available_layouts = data.data;
				fields.layout.options.values = _.map(ed.available_layouts, function(layout, layout_id){
					return {label: layout.label, value: layout_id, disabled: layout.saved};
				});
				fields.layout.render();
				fields.layout.delegateEvents();
			});
		else
			fields.layout.options.values = _.map(ed.available_layouts, function(layout, layout_id){
				return {label: layout.label, value: layout_id, disabled: layout.saved};
			});

		if ( !ed.layout_modal ){
			ed.layout_modal = new Upfront.Views.Editor.Modal({to: $('body'), button: false, top: 120, width: 540});
			ed.layout_modal.render();
			$('body').append(ed.layout_modal.el);
		}

		ed.layout_modal.open(function($content, $modal){
			var $button = $('<span class="uf-button">Create</span>'),
				$select_wrap = $('<div class="upfront-modal-select-wrap" />');
			_.each(fields, function(field){
				field.render();
				field.delegateEvents();
			});
			$content.html(
				'<h1 class="upfront-modal-title">Create New Layout</h1>' +
				'<p>In order to export a theme, you have to create at least 3 different layouts, Homepage, Single Post/Page and Archive layouts</p>'
			);
			$select_wrap.append(fields.layout.el);
			$content.append($select_wrap);
			$content.append($button);
			$button.on('click', function(){
				ed.layout_modal.close(true);
			});
		}, ed)
		.done(function(){
			var layout = fields.layout.get_value(),
				layout_slug = app.layout.get('layout_slug'),
				data = ed.available_layouts[layout];
			if ( data.latest_post )
				_upfront_post_data.post_id = data.latest_post;
			app.load_layout(data.layout, {layout_slug: layout_slug}).done(function(){
				app.layout.set('current_layout', layout);
			});
		});
	},

	browse_layout_dialog: function () {
		var app = Upfront.Application,
			ed = Upfront.Behaviors.LayoutEditor,
			fields = {
				layout: new Upfront.Views.Editor.Field.Select({
					name: 'layout',
					values: [{label: "Loading...", value: ""}],
					default_value: app.layout.get('current_layout')
				})
			};

		if ( !ed.browse_modal ){
			ed.browse_modal = new Upfront.Views.Editor.Modal({to: $('body'), button: false, top: 120, width: 540});
			ed.browse_modal.render();
			$('body').append(ed.browse_modal.el);
		}
		ed._get_saved_layout().done(function(data){
			if ( !data || data.length == 0 ){
				fields.layout.options.values = [{label: "No saved layout", value: ""}];
			}
			else {
				fields.layout.options.values = _.map(ed.saved_layouts, function(layout, layout_id){
					return {label: layout.label, value: layout_id};
				});
			}
			fields.layout.render();
			fields.layout.delegateEvents();
		});

		ed.browse_modal.open(function($content, $modal){
			var $button = $('<span class="uf-button">Edit</span>'),
				$select_wrap = $('<div class="upfront-modal-select-wrap" />');
			_.each(fields, function(field){
				field.render();
				field.delegateEvents();
			});
			$content.html(
				'<h1 class="upfront-modal-title">Edit Saved Layout</h1>'
			);
			$select_wrap.append(fields.layout.el);
			$content.append($select_wrap);
			$content.append($button);
			$button.on('click', function(){
				ed.browse_modal.close(true);
			});
		}, ed)
		.done(function(){
			var layout = fields.layout.get_value(),
				layout_slug = app.layout.get('layout_slug'),
				data = ed.saved_layouts[layout];
			if ( data.latest_post )
				_upfront_post_data.post_id = data.latest_post;
			app.layout.set('current_layout', layout);
			app.load_layout(data.layout, {layout_slug: layout_slug});
		});

	},

	export_dialog: function () {
		var app = Upfront.Application,
			ed = Upfront.Behaviors.LayoutEditor,
			fields = {
				theme: new Upfront.Views.Editor.Field.Select({
					name: 'theme',
					label: 'Select Theme',
					values: [{label: "New theme", value: ""}],
					change: function(){
						var value = this.get_value(),
							$fields = $([fields.name.el, fields.directory.el, fields.author.el, fields.author_uri.el]);
						if ( value != '' )
							$fields.hide();
						else
							$fields.show();
					}
				}),
				name: new Upfront.Views.Editor.Field.Text({
					name: 'name',
					label: 'Theme Name',
				}),
				directory: new Upfront.Views.Editor.Field.Text({
					name: 'directory',
					label: 'Directory',
				}),
				author: new Upfront.Views.Editor.Field.Text({
					name: 'author',
					label: 'Author',
				}),
				author_uri: new Upfront.Views.Editor.Field.Text({
					name: 'author_uri',
					label: 'Author URI',
				})
			};
		// Save first
		Upfront.Events.trigger("command:layout:save");
		if ( !ed.export_modal ){
			ed.export_modal = new Upfront.Views.Editor.Modal({to: $('body'), button: false, top: 120, width: 540});
			ed.export_modal.render();
			$('body').append(ed.export_modal.el);
		}
		ed._get_themes().done(function(data){
			fields.theme.options.values = _.union( [{label: "New theme", value: ""}], _.map(data, function(theme, directory){
				return {label: theme.name, value: theme.directory};
			}) );
			fields.theme.render();
			fields.theme.delegateEvents();
		});
		Upfront.Events.once("command:layout:save_done", function(success){
			if ( !success )
				return;
			ed._check_required_layout().done(function(){
				ed.export_modal.open(function($content, $modal){
					var $button = $('<span class="uf-button">Export</span>');
					_.each(fields, function(field){
						field.render();
						field.delegateEvents();
					});
					$content.html(
						'<h1 class="upfront-modal-title">Export Theme</h1>'
					);
					$content.append(fields.theme.el);
					$content.append(fields.name.el);
					$content.append(fields.directory.el);
					$content.append(fields.author.el);
					$content.append(fields.author_uri.el);
					$content.append($button);
					$button.on('click', function(){
						var loading = new Upfront.Views.Editor.Loading({
								loading: "Checking layouts",
								done: "Theme exported!",
								fixed: true
							}),
							theme_name = fields.theme.get_value() ? fields.theme.get_value() : fields.directory.get_value(),
							create_theme = function(){
								var data = {
										'thx-theme-name': fields.name.get_value(),
										'thx-theme-slug': fields.directory.get_value(),
										'thx-author': fields.author.get_value(),
										'thx-author-uri': fields.author_uri.get_value(),
										'thx-theme-template': 'upfront'
								};
								loading.update_loading_text("Creating theme");
								return ed._create_theme(data);
							},
							export_deferred = new $.Deferred(),
							export_layout = function(i, layout_ids){
								if ( layout_ids.length <= i )
									return export_deferred.resolve();
								var layout_id = layout_ids[i];
								if ( app.layout.get('current_layout') != layout_id ){
									var layout_slug = app.layout.get('layout_slug'),
										data = ed.saved_layouts[layout_id];
									loading.update_loading_text("Loading layout: " + layout_id);
									app.layout.set('current_layout', layout_id);
									app.load_layout(data.layout, {layout_slug: layout_slug});
									Upfront.Events.once("layout:render", function(){
										export_layout(i, layout_ids);
									});
								}
								else {
									loading.update_loading_text("Exporting layout:" + layout_id);
									var data = {
											theme: theme_name,
											template: layout_id,
											regions: JSON.stringify(Upfront.Application.current_subapplication.get_layout_data().regions),
											functionsphp: 'functions'
										};
									ed._export_layout(data).always(function(){
										export_layout(i+1, layout_ids);
									});
								}
							},
							export_layouts = function(){
								export_layout(0, _.map(ed.saved_layouts, function(layout, layout_id){ return layout_id; }));
								return export_deferred.promise();
							},
							do_export = function(){
								export_layouts().done(function(){
									loading.done(function(){
										ed.export_modal.close(true);
									});
								});
							};
						loading.render();
						$('body').append(loading.el);
						if ( fields.theme.get_value() )
							do_export();
						else
							create_theme().done(do_export);
					});
				}, ed);
			}).fail(function(){
				ed.message_dialog("You’ve made a great start!", "But you need to create more layouts in order to export and use the theme. Please click ‘New Layout’ in the sidebar to learn about necessary layouts to export the theme.");
			});
		});

	},

	first_save_dialog: function (success) {
		var app = Upfront.Application,
			ed = Upfront.Behaviors.LayoutEditor,
			current_layout = app.layout.get('current_layout');
		if ( success && _upfront_new_theme && (!current_layout || current_layout == 'archive-home') ){
			ed.message_dialog("Excellent start!", "Your HOMEPAGE — Static layout has been successfully created. You can create more Layouts for your theme by clicking ‘New Layout’ in  the left sidebar. Remember, the best themes in life <del>are free</del> have lots of layouts!");
		}
	},

	message_dialog: function (title, msg) {
		var app = Upfront.Application,
			ed = Upfront.Behaviors.LayoutEditor;
		if ( !ed.message_modal ){
			ed.message_modal = new Upfront.Views.Editor.Modal({to: $('body'), button: true, top: 120, width: 540});
			ed.message_modal.render();
			$('body').append(ed.message_modal.el);
		}
		ed.message_modal.open(function($content, $modal){
			$modal.addClass('upfront-message-modal');
			$content.html(
				'<h1 class="upfront-modal-title">' + title + '</h1>'
			);
			$content.append(msg);
		}, ed);
	},

	_get_saved_layout: function (){
		var me = this,
			deferred = new $.Deferred();
		Upfront.Util.post({
			action: 'upfront_list_saved_layout'
		}).success(function(response){
			me.saved_layouts = response.data;
			deferred.resolve(response.data);
		}).error(function(){
			deferred.reject();
		});
		return deferred.promise();
	},

	_check_required_layout: function () {
		var deferred = new $.Deferred(),
			required_layout = ['archive', 'archive-home', 'single'];
		this._get_saved_layout().done(function(data){
			var layouts = _.map(data, function(layout, layout_id){
					return layout_id;
				}),
				diff = _.difference(required_layout, layouts);
			if ( diff.length == 0 )
				deferred.resolve();
			else
				deferred.reject(diff);
		}).fail(function(){
			deferred.reject();
		});
		return deferred.promise();
	},

	_get_themes: function () {
		var me = this,
			deferred = new $.Deferred();
		Upfront.Util.post({
			action: 'upfront_thx-get-themes'
		}).success(function(response){
			me.themes = response;
			deferred.resolve(response);
		}).error(function(){
			deferred.reject();
		});
		return deferred.promise();
	},

	_create_theme: function (data) {
		var deferred = new $.Deferred();
		Upfront.Util.post({
			action: 'upfront_thx-create-theme',
			form: this._build_query(data)
		}).success(function(response){
			if ( response && response.error )
				deferred.reject(response.error);
			else
				deferred.resolve();
		}).error(function(){
			deferred.reject();
		});
		return deferred.promise();
	},

	_export_layout: function (data) {
		var deferred = new $.Deferred();
		Upfront.Util.post({
			action: 'upfront_thx-export-layout',
			data: data
		}).success(function(response){
			if ( response && response.error )
				deferred.reject(response.error);
			else
				deferred.resolve();
		}).error(function(){
			deferred.reject();
		});
		return deferred.promise();
	},

	_build_query: function (data) {
		return _.map(data, function(value, key){ return key + '=' + value; }).join('&');
	}
};


var GridEditor = {

	main: {$el: null, top: 0, left: 0, right: 0},
	grid_layout: {top: 0, left: 0, right: 0},
	containment: {$el: null, top: 0, left: 0, right: 0, col: 0, grid: {top: 0, left: 0, right: 0}},
	min_col: 1,
	max_row: 0,
	compare_col: 3,
	compare_row: 5,
	timeout: 30, // in ms
	_t: null, // timeout resource
	col_size: 0,
	baseline: 0,
	grid: null,

	// some more configurable setting
	region_type_priority: {
		wide: 1,
		clip: 1,
		full: 1,
		fixed: 2
	},

	els: [],
	wraps: [],
	regions: [],
	drops: [],

	drop: null,

	el_selector: '.upfront-module, .upfront-module-group',
	_id: 0,

	show_debug_element: false,

	resizing: false,

	/**
	 * Return a new incremented internal counter
	 */
	_new_id: function(){
		var ed = Upfront.Behaviors.GridEditor;
		ed._id++;
		return ed._id;
	},

	/**
	 * Get grid position of an x,y offset
	 *
	 * @param {Int} x
	 * @param {Int} y
	 */
	get_grid: function(x, y){
		var	ed = Upfront.Behaviors.GridEditor,
			/*grid_x = Math.round((x-ed.containment.left)/ed.col_size)+1,
			grid_y = Math.round((y-ed.containment.top)/ed.baseline)+1;*/
			grid_x = Math.round((x-ed.grid_layout.left)/ed.col_size)+1,
			grid_y = Math.round((y-ed.grid_layout.top)/ed.baseline)+1;
		return {x: grid_x, y: grid_y};
	},

	/**
	 * Get position of an element
	 *
	 * @param {DOM Object} el
	 */
	get_position: function(el){
		var ed = Upfront.Behaviors.GridEditor,
			$el = $(el),
			width = $el.outerWidth(),
			height = $el.outerHeight(),
			top = $el.offset().top,
			left = $el.offset().left,
			outer_width = $el.outerWidth(true),
			outer_height = $el.outerHeight(true),
			outer_top = top-parseFloat($el.css('margin-top')),
			outer_left = left-parseFloat($el.css('margin-left')),
			grid = ed.get_grid(left, top),
			outer_grid = ed.get_grid(outer_left, outer_top),
			col = Math.round(width/ed.col_size),
			outer_col = Math.round(outer_width/ed.col_size),
			row = Math.round(height/ed.baseline),
			outer_row = Math.round(outer_height/ed.baseline),
			$region = $el.closest('.upfront-region'),
			region = $region.data('name');
		return {
			$el: $el,
			_id: ed._new_id(),
			position: {
				top: top,
				left: left,
				bottom: top+height,
				right: left+width
			},
			outer_position: {
				top: Math.round(outer_top),
				left: Math.round(outer_left),
				bottom: Math.round(outer_top+outer_height),
				right: Math.round(outer_left+outer_width)
			},
			width: width,
			height: height,
			center: {
				y: Math.round(top+(height/2)),
				x: Math.round(left+(width/2))
			},
			col: col,
			row: row,
			grid: {
				top: grid.y,
				left: grid.x,
				right: grid.x+col-1,
				bottom: grid.y+row-1
			},
			outer_grid: {
				top: outer_grid.y,
				left: outer_grid.x,
				right: outer_grid.x+outer_col-1,
				bottom: outer_grid.y+outer_row-1
			},
			grid_center: {
				y: grid.y+(row/2)-1,
				x: grid.x+(col/2)-1
			},
			region: region
		};
	},

	get_region_position: function (el) {
		var ed = Upfront.Behaviors.GridEditor,
			$el = $(el),
			$modules_container = $el.find('.upfront-modules_container'),
			position = ed.get_position($modules_container);
		position.$el = $el;
		return position;
	},

	/**
	 * Get margin from class name and store in data to use later
	 *
	 * @param {DOM Object} el
	 */
	init_margin: function (el){
		var ed = Upfront.Behaviors.GridEditor,
			$el = $(el),
			left = ed.get_class_num($el, ed.grid.left_margin_class),
			right = ed.get_class_num($el, ed.grid.right_margin_class),
			top = ed.get_class_num($el, ed.grid.top_margin_class),
			bottom = ed.get_class_num($el, ed.grid.bottom_margin_class)
		;
		$el.data('margin', {
			original: {
				left: left,
				right: right,
				top: top,
				bottom: bottom
			},
			current: {
				left: left,
				right: right,
				top: top,
				bottom: bottom
			}
		});
	},

	get_affected_els: function (el, els, ignore, direct) {
		var aff_els = { top: [], left: [], bottom: [], right: [] },
			compare = el.outer_grid;
		if ( Array.isArray(ignore) )
			ignore.push(el);
		else
			ignore = [el];
		direct = direct ? true : false;
		_.each(_.reject(els, function(each){
				var ignored = _.find(ignore, function(i){
					return i.$el.get(0) == each.$el.get(0);
				});
				return ignored ? true : false;
			}),
			function(each){
				if ( el.region != each.region )
					return;
				if ( ( each.outer_grid.top >= compare.top && each.outer_grid.top < compare.bottom ) ||
					 ( each.outer_grid.bottom >= compare.top && each.outer_grid.bottom <= compare.bottom ) ||
					 ( compare.top >= each.outer_grid.top && compare.top < each.outer_grid.bottom ) ||
					 ( compare.bottom >= each.outer_grid.top && compare.bottom <= each.outer_grid.bottom ) ){
					if ( compare.left > each.outer_grid.right ){
						aff_els.left.push(each);
					}
					if ( compare.right < each.outer_grid.left ){
						aff_els.right.push(each);
					}
				}
				if ( compare.top > each.outer_grid.bottom ){
					aff_els.top.push(each);
				}
				if ( compare.bottom < each.outer_grid.top ){
					aff_els.bottom.push(each);
				}
			}
		);
		if ( direct ){
			var direct_left = _.max(aff_els.left, function(each){ return each.outer_grid.right; });
			aff_els.left = _.filter(aff_els.left, function(each){
				return ( each.outer_grid.right == direct_left.outer_grid.right );
			});
			var direct_right = _.min(aff_els.right, function(each){ return each.outer_grid.left; });
			aff_els.right = _.filter(aff_els.right, function(each){
				return ( each.outer_grid.left == direct_right.outer_grid.left );
			});
			var direct_top = _.max(aff_els.top, function(each){ return each.outer_grid.top; });
			aff_els.top = _.filter(aff_els.top, function(each){
				return ( each.outer_grid.top == direct_top.outer_grid.top );
			});
			var direct_bottom = _.min(aff_els.bottom, function(each){ return each.outer_grid.top; });
			aff_els.bottom = _.filter(aff_els.bottom, function(each){
				return ( each.outer_grid.top == direct_bottom.outer_grid.top );
			});
		}
		return aff_els;
	},

	get_affected_wrapper_els: function(el, els, ignore, direct){
		var ed = Upfront.Behaviors.GridEditor,
			aff = ed.get_affected_els(el, els, ignore, direct),
			aff_els = {
				top: _.flatten(_.map(aff.top, function(w){
					var els = _.reject(ed.get_wrap_els(w), function(el){
							return ignore ? _.find(ignore, function(i){ return i.$el.get(0) == el.$el.get(0); }) : false;
						}),
						max = ed.get_wrap_el_max(w, ignore, true);
					return _.filter(els, function(el){ return el.outer_grid.bottom == max.outer_grid.bottom; });
				})),
				bottom: _.flatten(_.map(aff.bottom, function(w){
					var els = _.reject(ed.get_wrap_els(w), function(el){
							return ignore ? _.find(ignore, function(i){ return i.$el.get(0) == el.$el.get(0); }) : false;
						}),
						min = ed.get_wrap_el_min(w, ignore, true);
					return _.filter(els, function(el){ return el.outer_grid.top == min.outer_grid.top; });
				})),
				left: _.flatten(_.map(aff.left, function(w){
					var els = _.reject(ed.get_wrap_els(w), function(el){
							return ignore ? _.find(ignore, function(i){ return i.$el.get(0) == el.$el.get(0); }) : false;
						}),
						max = ed.get_wrap_el_max(w, ignore, false);
					return _.filter(els, function(el){ return el.outer_grid.right == max.outer_grid.right; });
				})),
				right: _.flatten(_.map(aff.right, function(w){
					var els = _.reject(ed.get_wrap_els(w), function(el){
							return ignore ? _.find(ignore, function(i){ return i.$el.get(0) == el.$el.get(0); }) : false;
						}),
						min = ed.get_wrap_el_min(w, ignore, false);
					return _.filter(els, function(el){ return el.outer_grid.left == min.outer_grid.left; });
				}))
			};
		return aff_els;
	},

	get_move_limit: function (aff_els, containment) {
		var move_limit = [containment.grid.left, containment.grid.right];
		_.each(aff_els.left, function(each){
			if ( each.grid.right > move_limit[0] )
				move_limit[0] = each.grid.right+1;
		});
		_.each(aff_els.right, function(each){
			if ( each.grid.left < move_limit[1] )
				move_limit[1] = each.grid.left-1;
		});
		return move_limit;
	},

	/**
	 * Get maximum size available to resize
	 *
	 * @param (object) el
	 * @param (array) els
	 * @param (object) region
	 * @param (string) axis nw|se|all
	 */
	get_max_size: function ( el, els, region, axis ) {
		var ed = Upfront.Behaviors.GridEditor,
			col = ed.get_class_num(el.$el, ed.grid.class),
			axis = /all|nw|se/.test(axis) ? axis : 'all',
			margin = el.$el.data('margin'),
			aff_els = ed.get_affected_els(el, els, [], true),
			move_limit = ed.get_move_limit(aff_els, ed.containment),
			max_col = ( axis == 'nw' ? col+el.grid.left-move_limit[0] : ( axis == 'se' ? col+move_limit[1]-el.grid.right : move_limit[1]-move_limit[0]+1 ) ),
			expand_lock = region.$el.hasClass('upfront-region-expand-lock'),
			top_aff_el = aff_els.bottom.length ? _.min(aff_els.bottom, function(each){ return each.grid.top; }) : false,
			max_row_se = top_aff_el ? top_aff_el.grid.top-el.grid.top : region.grid.bottom-el.grid.top,
			max_row =  axis == 'nw' ? margin.original.top+el.row : ( axis == 'se' ? max_row_se : max_row_se+margin.original.top );
		return {
			col: max_col,
			row: expand_lock || axis == 'nw' ? max_row : false
		};
	},


	get_wrap_els: function( use_wrap ){
		var ed = Upfront.Behaviors.GridEditor,
			$els = use_wrap.$el.find('> .upfront-module-view > .upfront-module, > .upfront-module-group');
		return _.map($els, function(el){
			var el = ed.get_el($(el));
			return _.find(ed.els, function(each){ return each._id == el._id; });
		});
	},

	get_wrap_el_min: function( use_wrap, ignore, top ){
		var ed = Upfront.Behaviors.GridEditor,
			wrap_els = ed.get_wrap_els(use_wrap),
			wrap_el_min = _.min(_.reject(wrap_els, function(el){
				return ignore ? _.find(ignore, function(i){ return i.$el.get(0) == el.$el.get(0); }) : false;
			}), function(each){
				return top ? each.grid.top : each.grid.left;
			});
		return _.isObject(wrap_el_min) ? wrap_el_min : false;
	},

	get_wrap_el_max: function( use_wrap, ignore, bottom ){
		var ed = Upfront.Behaviors.GridEditor,
			wrap_els = ed.get_wrap_els(use_wrap),
			wrap_el_max = _.max(_.reject(wrap_els, function(el){
				return ignore ? _.find(ignore, function(i){ return i.$el.get(0) == el.$el.get(0); }) : false;
			}), function(each){
				return bottom ? each.grid.bottom : each.grid.right;
			});
		return _.isObject(wrap_el_max) ? wrap_el_max : false;
	},

	/**
	 * Get element position data
	 *
	 * @param {jQuery Object} $el
	 */
	get_el: function ($el){
		var ed = Upfront.Behaviors.GridEditor;
		return _.find(ed.els, function(each){ return ( $el.get(0) == each.$el.get(0) ); });
	},

	/**
	 * Get wrapper position data
	 *
	 * @param {jQuery Object} $wrap
	 */
	get_wrap: function ($wrap){
		var ed = Upfront.Behaviors.GridEditor;
		return _.find(ed.wraps, function(each){ return ( $wrap.get(0) == each.$el.get(0) ); });
	},

	/**
	 * Get region position data
	 *
	 * @param {jQuery Object} $region
	 */
	get_region: function ($region){
		var ed = Upfront.Behaviors.GridEditor;
		return _.find(ed.regions, function(each){ return ( $region.get(0) == each.$el.get(0) ); });
	},

	/**
	 * Get drop data
	 *
	 * @param {jQuery Object} $region
	 */
	get_drop: function ($drop){
		var ed = Upfront.Behaviors.GridEditor;
		return _.find(ed.drops, function(each){ return ( $drop.get(0) == each.$el.get(0) ); });
	},

	/**
	 * Get integer value from class name
	 *
	 * @param {jQuery Object|String} from
	 * @param {String} class_name
	 */
	get_class_num: function (from, class_name){
		var text = _.isString(from) ? from : from.attr('class'),
			rx = new RegExp('\\b' + class_name + '(\\d+)'),
			val = text.match(rx);
		return ( val && val[1] ) ? parseInt(val[1]) : 0;
	},

	/**
	 * Get element model
	 *
	 * @param {jQuery Object} $el
	 */
	get_el_model: function ($el) {
		var app = Upfront.Application,
			ed = Upfront.Behaviors.GridEditor,
			regions = app.layout.get('regions'),
			model;
		regions.find(function(region){
			var modules = region.get('modules'),
				module_model = modules.get_by_element_id($el.attr('id'));
			if ( module_model ){
				model = module_model;
				return true;
			}
			else {
				modules.find(function(module){
					var object_model = ( module.get('objects') ) ? module.get('objects').get_by_element_id($el.attr('id')) : false;
					if ( object_model ){
						model = object_model;
						return true;
					}
					return false;
				});
				if ( model )
					return true;
			}
			return false;
		});
		return model ? model : false;
	},

	/**
	 * Update class name with new value
	 *
	 * @param {jQuery Object} $el
	 * @param {String} class_name
	 * @param {Int} class_size
	 */
	update_class: function ($el, class_name, class_size) {
		var rx = new RegExp('\\b' + class_name + '\\d+');
		if ( ! $el.hasClass(class_name+class_size) ){
			if ( $el.attr('class').match(rx) )
				$el.attr('class', $el.attr('class').replace(rx, class_name+class_size));
			else
				$el.addClass(class_name+class_size);
		}
	},

	/**
	 * Update margin class name
	 *
	 * @param {jQuery Object} $el
	 */
	update_margin_classes: function ($el) {
		this.time_start('fn update_margin_classes');
		var el_margin = $el.data('margin'),
			ed = Upfront.Behaviors.GridEditor;
		if ( el_margin.current != el_margin.original ){
			ed.update_class($el, ed.grid.left_margin_class, el_margin.current.left);
			ed.update_class($el, ed.grid.right_margin_class, el_margin.current.right);
			ed.update_class($el, ed.grid.top_margin_class, el_margin.current.top);
			ed.update_class($el, ed.grid.bottom_margin_class, el_margin.current.bottom);
		}
		this.time_end('fn update_margin_classes');
	},

	update_model_classes: function ($el, classes) {
		this.time_start('fn update_model_classes');
		var model = this.get_el_model($el);
		if ( model ){
			model.replace_class(classes.join(' '));
		}
		this.time_end('fn update_model_classes');
	},

	update_model_margin_classes: function ($els, more_classes) {
		var ed = Upfront.Behaviors.GridEditor;
		$els.each(function(){
			var $el = $(this),
				margin = $el.data('margin'),
				classes;
			if ( margin &&
				( margin.original.left != margin.current.left ||
				margin.original.top != margin.current.top ||
				margin.original.bottom != margin.current.bottom ||
				margin.original.right != margin.current.right )
			){
				classes = [
					ed.grid.left_margin_class+margin.current.left,
					ed.grid.right_margin_class+margin.current.right,
					ed.grid.top_margin_class+margin.current.top,
					ed.grid.bottom_margin_class+margin.current.bottom
				];
				if ( more_classes )
					classes = _.union(classes, more_classes);
				ed.update_model_classes($el, classes);
			}
		});
	},

	adjust_els_right: function( adj_els, cmp_right, update_class ){
		this.time_start('fn adjust_els_right');
		var	ed = Upfront.Behaviors.GridEditor;
		_.each(adj_els, function(each){
			var each_margin = each.$el.data('margin'),
				each_margin_size = each.grid.left > cmp_right ? each.grid.left-cmp_right-1 : each_margin.current.left;
			if ( each_margin.current.left != each_margin_size ){
				each_margin.current.left = each_margin_size;
				if ( update_class )
					ed.update_margin_classes(each.$el);
				each.$el.data('margin', each_margin);
			}
		});
		this.time_end('fn adjust_els_right');
	},

	adjust_affected_right: function( adj_wrap, adj_wrap_aff_right, ignore, cmp_right, update_class ){
		this.time_start('fn adjust_affected_right');
		var	ed = Upfront.Behaviors.GridEditor,
			wrap_el_max = ed.get_wrap_el_max(adj_wrap, ignore),
			wrap_right = wrap_el_max ? ( cmp_right && cmp_right > wrap_el_max.grid.right ? cmp_right : wrap_el_max.grid.right ) : ( cmp_right ? cmp_right : adj_wrap.grid.left-1 );
		ed.adjust_els_right(adj_wrap_aff_right, wrap_right, update_class);
		if ( cmp_right+1 == ed.containment.grid.left && ed.get_wrap_els(adj_wrap).length == 0 ) {
			adj_wrap.$el.nextAll('.upfront-wrapper:eq(0)').data('clear', 'clear');
		}
		this.time_end('fn adjust_affected_right');
	},

	adjust_els_bottom: function ( adj_els, cmp_bottom, update_class ) {
		this.time_start('fn adjust_els_bottom');
		var	ed = Upfront.Behaviors.GridEditor;
		_.each(adj_els, function(each){
			var each_margin = each.$el.data('margin'),
				each_margin_size = each.grid.top > cmp_bottom ? each.grid.top-cmp_bottom-1 : each_margin.current.top;
			if ( each_margin.current.top != each_margin_size ){
				each_margin.current.top = each_margin_size;
				if ( update_class )
					ed.update_margin_classes(each.$el);
				each.$el.data('margin', each_margin);
			}
		});
		this.time_end('fn adjust_els_bottom');
	},

	adjust_affected_bottom: function ( adj_wrap, adj_wrap_aff_bottom, ignore, cmp_bottom, update_class ) {
		this.time_start('fn adjust_affected_bottom');
		var	ed = Upfront.Behaviors.GridEditor,
			wrap_el_max = ed.get_wrap_el_max(adj_wrap, ignore, true),
			wrap_bottom = wrap_el_max ? ( cmp_bottom && cmp_bottom > wrap_el_max.grid.bottom ? cmp_bottom : wrap_el_max.grid.bottom ) : ( cmp_bottom ? cmp_bottom : adj_wrap.grid.bottom-1 );
		ed.adjust_els_bottom(adj_wrap_aff_bottom, wrap_bottom, update_class);
		this.time_end('fn adjust_affected_bottom');
	},

	/**
	 * Normalize elements and wrappers
	 */
	normalize: function (els, wraps) {
		var app = Upfront.Application,
			ed = Upfront.Behaviors.GridEditor,
			regions = app.layout.get("regions"),
			regions_need_update = [];
		// Iterate through elements and check if it must be contained in separate wrapper
		_.each(wraps, function(wrap){
			var $wrap_els= wrap.$el.find('> .upfront-module-view > .upfront-module, > .upfront-module-group');
			if ( $wrap_els.size() > 1 ){
				$wrap_els.each(function(){
					var wrap_el = ed.get_el($(this)),
						aff_els = ed.get_affected_els(wrap_el, wraps, [], true);
					if ( aff_els.left.length == 0 && aff_els.right.length == 0 ){
						// Separate the wrapper
						var wrap_el_model = ed.get_el_model(wrap_el.$el),
							wrap_el_view = Upfront.data.module_views[wrap_el_model.cid],
							region = regions.get_by_name( wrap_el.region ),
							wrappers = region.get('wrappers'),
							wrapper_id = Upfront.Util.get_unique_id("wrapper");
							wrap_model = new Upfront.Models.Wrapper({
								"name": "",
								"properties": [
									{"name": "wrapper_id", "value": wrapper_id},
									{"name": "class", "value": ed.grid.class+(wrap_el.grid.left+wrap_el.col-1)}
								]
							}),
							wrap_view = new Upfront.Views.Wrapper({model: wrap_model});
						wrappers.add(wrap_model);
						wrap_model.add_class('clr');
						wrap_view.render();
						wrap_el.$el.closest('.upfront-wrapper').after(wrap_view.$el);
						wrap_view.$el.append(wrap_el_view.$el);
						wrap_el_model.set_property('wrapper_id', wrapper_id, true);
						wrap_el_model.replace_class(ed.grid.left_margin_class+(wrap_el.grid.left-1));
						Upfront.data.wrapper_views[wrap_model.cid] = wrap_view;
						ed.init_margin(wrap_el_view.$el.find('.upfront-editable_entity:first').get(0));
						regions_need_update.push(wrap_el.region);
					}
				});
			}
		});
		_.each(_.uniq(regions_need_update), function(region){
			var region_model = regions.get_by_name(region);
			ed.update_wrappers(region_model);
		});
		_.each(wraps, function(wrap){
			if ( wrap.outer_grid.left == 1 && !wrap.$el.hasClass('clr') )
				wrap.$el.addClass('clr');
		});
	},

	/**
	 * Init the GridEditor object
	 */
	init: function(){
		var app = Upfront.Application,
			ed = Upfront.Behaviors.GridEditor,
			$main = $(Upfront.Settings.LayoutEditor.Selectors.main),
			main_pos = $main.offset(),
			$layout = $main.find('.upfront-layout');
		ed.baseline = Upfront.Settings.LayoutEditor.Grid.baseline;
		ed.grid = Upfront.Settings.LayoutEditor.Grid;
		ed.col_size = ed.grid.column_width;

		ed.max_row = Math.floor(($(window).height()*.5)/ed.baseline);
		ed.main = {
			$el: $main,
			top: main_pos.top,
			bottom: main_pos.top + $main.outerHeight(),
			left: main_pos.left,
			right: main_pos.left + $main.outerWidth()
		};

		// Prevents quick scroll when resizing
		var scrollStep = 15;
		$(document).on('scroll', function(e){
			if(ed.resizing === false || ed.resizing == window.scrollY)
				return;

			if(window.scrollY > ed.resizing)
				ed.resizing += scrollStep;
			else
				ed.resizing -= scrollStep;

			window.scrollTo(window.scrollX, ed.resizing);
		});
	},

	/**
	 * Start editor, to set all required variables
	 *
	 * @param {Object} view
	 */
	start: function(view, model, $cont){
		this.time_start('fn start');
		var app = Upfront.Application,
			ed = Upfront.Behaviors.GridEditor,
			main_pos = ed.main.$el.offset(),
			$layout = ed.main.$el.find('.upfront-layout'),
			layout_pos = $layout.offset(),
			is_object = view.$el.find(".upfront-editable_entity").eq(0).is(".upfront-object"),
			$containment = $cont || view.$el.parents(".upfront-editable_entities_container").eq(0),
			containment_pos = $containment.offset();
		// Set variables
		ed.col_size = ed.grid.column_width;
		ed.el_selector = is_object ? '.upfront-object' : '.upfront-module, .upfront-module-group';
		ed.main.top = main_pos.top;
		ed.main.bottom = main_pos.top + ed.main.$el.outerHeight();
		ed.main.left = main_pos.left;
		ed.main.right = main_pos.left + ed.main.$el.outerWidth();
		var grid_layout_left = layout_pos.left + ($layout.outerWidth() - (ed.grid.size*ed.col_size))/2;
		ed.grid_layout = {
			top: layout_pos.top,
			bottom: layout_pos.top + $layout.outerHeight(),
			left: grid_layout_left,
			right: grid_layout_left + (ed.grid.size*ed.col_size)
		};
		var containment_width = $containment.outerWidth(),
			containment_height = $containment.outerHeight(),
			containment_col = Math.round(containment_width/ed.col_size),
			containment_row = Math.round(containment_height/ed.baseline),
			containment_grid = ed.get_grid(containment_pos.left, containment_pos.top);
		ed.containment = {
			$el: $containment,
			top: containment_pos.top,
			bottom: containment_pos.top + containment_height,
			left: containment_pos.left,
			right: containment_pos.left + containment_width,
			col: containment_col,
			grid: {
				top: containment_grid.y,
				bottom: containment_grid.y+containment_row-1,
				left: containment_grid.x,
				right: containment_grid.x+containment_col-1
			}
		};
		ed.update_position_data();
		this.time_end('fn start');
	},

	/**
	 * Update position data
	 */
	update_position_data: function () {
		this.time_start('fn update_position_data');
		var app = Upfront.Application,
			ed = Upfront.Behaviors.GridEditor,
			$layout = ed.main.$el.find('.upfront-layout'),
			is_object = ( ed.el_selector == '.upfront-object' ),
			$els = is_object ? ed.containment.$el.find('.upfront-object') : $layout.find('.upfront-module, .upfront-module-group'),
			$wraps = $layout.find('.upfront-wrapper'),
			$regions = $layout.find('.upfront-region').not('.upfront-region-locked');
		ed.els = _.map($els, ed.get_position ); // Generate elements position data
		$els.each(function(){ ed.init_margin(this); }); // Generate margin data
		ed.wraps = _.map($wraps, ed.get_position ); // Generate wrappers position data
		ed.regions = _.map($regions, ed.get_region_position ); // Generate regions position data
		this.time_end('fn update_position_data');
	},

	/**
	 * Create droppable points
	 */
	create_drop_point: function (me, me_wrap) {
		console.log('Drop point');
		this.time_start('fn create_drop_point');
		var app = Upfront.Application,
			ed = Upfront.Behaviors.GridEditor,
			margin = me.$el.data('margin'),
			col = me.col,
			min_col = me.$el.hasClass('upfront-image_module') ? 1 : (col > ed.min_col ? ed.min_col : col),
			row = me.row > ed.max_row ? ed.max_row : me.row;
		ed.drops = [];

		_.each(ed.regions, function(region){
			var $region = region.$el.find(".upfront-editable_entities_container:first"),
				region_name = region.$el.data('name'),
				$wraps = $region.find('> .upfront-wrapper'),
				expand_lock = region.$el.hasClass('upfront-region-expand-lock'),
				current_full_top = region.grid.top,
				can_drop = function (top, bottom) {
					return ( !expand_lock || ( expand_lock && bottom-top+1 >= me.row ) );
				},
				module_selector = '> .upfront-module-view > .upfront-module, > .upfront-module-group';
			$wraps.each(function(index){
				var $wrap = $(this),
					wrap = ed.get_wrap($wrap),
					wrap_clr = ( wrap.grid.left == region.grid.left ),
					is_wrap_me = ( me_wrap && wrap._id == me_wrap._id ),
					wrap_only = ( $wrap.find(module_selector).size() == 1 ),
					wrap_me_only = ( is_wrap_me && wrap_only ),
					$prev_wrap = $wraps[index-1] ? $wraps.eq(index-1) : false,
					prev_wrap = $prev_wrap ? ed.get_wrap($prev_wrap) : false,
					prev_wrap_clr = ( prev_wrap && prev_wrap.grid.left == region.grid.left ),
					is_prev_me = ( prev_wrap && me_wrap && prev_wrap._id == me_wrap._id ),
					prev_me_only = ( is_prev_me && $prev_wrap.find(module_selector).size() == 1 ),
					$next_wrap = $wraps[index+1] ? $wraps.eq(index+1) : false,
					next_wrap = $next_wrap ? ed.get_wrap($next_wrap) : false,
					next_wrap_clr = ( next_wrap && next_wrap.grid.left == region.grid.left ),
					is_next_me = ( next_wrap && me_wrap && next_wrap._id == me_wrap._id ),
					next_me_only = ( is_next_me && $next_wrap.find(module_selector).size() == 1 ),
					$next_clr = $wrap.nextAll('.upfront-wrapper.clr:first'),
					next_clr = $next_clr.size() > 0 ? ed.get_wrap($next_clr) : false,
					wrap_el_left = ed.get_wrap_el_min(wrap),
					next_wrap_el_top = next_wrap ? ed.get_wrap_el_min(next_wrap, false, true) : false,
					next_wrap_el_left = next_wrap ? ed.get_wrap_el_min(next_wrap) : false,
					next_clr_el_top = next_clr ? ed.get_wrap_el_min(next_clr, false, true) : false,
					$row_wrap_first = !wrap_clr ? $wrap.prevAll('.upfront-wrapper.clr:first') : $wrap,
					$row_wraps_next = $row_wrap_first.nextUntil('.clr', '.upfront-wrapper'),
					row_wraps = _.union( [ ed.get_wrap($row_wrap_first) ], $row_wraps_next.map(function(){ return ed.get_wrap($(this)); }).get() ),
					max_row_wrap = _.max(row_wraps, function(row_wrap){ return row_wrap.grid.bottom; });
				if (
					( wrap.col >= min_col ) && (
					( next_wrap && !next_wrap_clr && !wrap_me_only && ( $next_wrap.find(module_selector).size() > 1 || !is_next_me ) ) ||
					( prev_wrap && !wrap_clr && !wrap_me_only && ( $prev_wrap.find(module_selector).size() > 1 || !is_prev_me ) ) ||
					( next_wrap && prev_wrap && !next_wrap_clr && !wrap_clr ) )
				){
					var current_el_top = wrap.grid.top;
					$els = $wrap.find(module_selector);
					$els.each(function(i){
						if ( $(this).get(0) == me.$el.get(0) )
							return;
						var $el = $(this),
							el = ed.get_el($el),
							top = ( el.outer_grid.top == wrap.grid.top ) ? wrap.grid.top : current_el_top,
							bottom = el.grid_center.y,
							$prev = $els[i-1] ? $els.eq(i-1) : false,
							prev = $prev ? ed.get_el($prev) : false,
							prev_me = ( prev && prev._id == me._id );
						ed.drops.push({
							_id: ed._new_id(),
							top: top,
							bottom: bottom,
							left: wrap.grid.left,
							right: wrap.grid.right,
							priority: {
								top: ( prev_me ? prev.outer_grid.top : el.outer_grid.top ),
								bottom: el.grid.top-1,
								left: wrap.grid.left,
								right: wrap.grid.right,
								index: 5
							},
							priority_index: 5,
							type: 'inside',
							insert: ['before', $el],
							region: region,
							is_me: prev_me,
							is_clear: false,
							is_use: false,
							is_switch: false
						});
						current_el_top = bottom+1;
					});
					var $last = $els.last(),
						last = $last.size() > 0 ? ed.get_el($last) : false,
						last_me = ( last && last._id == me._id ),
						wrap_bottom = max_row_wrap.grid.bottom;
					// Don't add dropping below the most bottom wrap in a row
					if ( last_me || !max_row_wrap || max_row_wrap != wrap ){
						ed.drops.push({
							_id: ed._new_id(),
							top: current_el_top,
							bottom: wrap_bottom,
							left: wrap.grid.left,
							right: wrap.grid.right,
							priority: {
								top: ( last_me ? last.outer_grid.top : wrap.grid.bottom ),
								bottom: wrap_bottom,
								left: wrap.grid.left,
								right: wrap.grid.right,
								index: 5
							},
							priority_index: 5,
							type: 'inside',
							insert: ['append', wrap.$el],
							region: region,
							is_me: last_me,
							is_clear: false,
							is_use: false,
							is_switch: false
						});
					}
				}
				// Add droppable before each wrapper that start in new line
				if ( wrap_clr && !( is_wrap_me && ( !next_wrap || next_wrap_clr ) ) ){
					var top = ( wrap.grid.top == region.grid.top ) ? region.grid.top : current_full_top,
						el_top = ed.get_wrap_el_min(wrap, false, true),
						bottom = el_top.grid_center.y,
						is_drop_me = ( prev_wrap_clr && is_prev_me ),
						me_top = ( is_drop_me ? prev_wrap.grid.top : wrap.grid.top );
					if ( can_drop(me_top, el_top.grid.top-1) ){
						ed.drops.push({
							_id: ed._new_id(),
							top: top,
							bottom: bottom,
							left: region.grid.left,
							right: region.grid.right,
							priority: {
								top: me_top,
								bottom: el_top.grid.top-1,
								left: region.grid.left,
								right: region.grid.right,
								index: 10
							},
							priority_index: 10,
							type: 'full',
							insert: ['before', wrap.$el],
							region: region,
							is_me: is_drop_me,
							is_clear: true,
							is_use: false,
							is_switch: false
						});
						current_full_top = bottom+1;
					}
				}
				// Check to see if the right side on wrapper has enough column to add droppable
				if ( ( !next_wrap || next_wrap_clr ) && ( ( !is_wrap_me && region.grid.right-wrap.grid.right >= min_col ) || ( wrap_me_only && !wrap_clr ) || ( prev_me_only && !wrap_clr && wrap_only ) ) ){
					var is_switch = ( prev_me_only && !wrap_clr && wrap_only ),
						bottom = max_row_wrap.grid.bottom;
					if ( can_drop(wrap.grid.top, bottom) ){
						ed.drops.push({
							_id: ed._new_id(),
							top: wrap.grid.top,
							bottom: bottom,
							left: ( is_wrap_me ? wrap.grid.left : ( is_switch ? wrap_el_left.grid.left : wrap.grid.right+1 ) ),
							right: region.grid.right,
							priority: null,
							priority_index: 8,
							type: 'side-after',
							insert: ['after', wrap.$el],
							region: region,
							is_me: is_wrap_me,
							is_clear: false,
							is_use: false,
							is_switch: is_switch
						});
					}
				}
				// Now check the left side, finding spaces between wrapper and inner modules
				if ( ( wrap_el_left.grid.left-wrap.grid.left >= min_col && (!is_prev_me || wrap_clr) && !is_wrap_me ) || ( wrap_me_only && next_wrap && !next_wrap_clr ) || ( next_me_only && !next_wrap_clr && wrap_only ) ){
					var is_switch = ( next_me_only && !next_wrap_clr && wrap_only ),
						//right = wrap_el_left.grid.left > wrap.grid.left+col ? wrap_el_left.grid.left-1 : wrap.grid.left+col-1,
						right = wrap_el_left.grid.left-1,
						bottom = max_row_wrap.grid.bottom;
					if ( can_drop(wrap.grid.top, bottom) ){
						ed.drops.push({
							_id: ed._new_id(),
							top: wrap.grid.top,
							bottom: bottom,
							left: wrap.grid.left,
							right: ( is_wrap_me ? next_wrap_el_left.grid.left-1 : ( is_switch ? wrap.grid.right : right ) ),
							priority: {
								top: wrap.grid.top,
								bottom: bottom,
								left: wrap.grid.left,
								right: ( is_wrap_me ? next_wrap_el_left.grid.left-1 : wrap_el_left.grid.left-1 ),
								index: 3
							},
							priority_index: 7,
							type: 'side-before',
							insert: ['before', wrap.$el],
							region: region,
							is_me: is_wrap_me,
							is_clear: wrap_clr,
							is_use: false,
							is_switch: is_switch
						});
					}
				}
			});
			if ( $wraps.size() > 0 ) {
				var last_wrap = ed.get_wrap($wraps.last()),
					last_wrap_clr = ( last_wrap && last_wrap.grid.left == region.grid.left ),
					is_drop_me = ( me_wrap && last_wrap_clr && last_wrap._id == me_wrap._id ),
					bottom = ( region.grid.bottom-current_full_top > row ? region.grid.bottom : current_full_top + row ),
					bottom_wrap = _.max(ed.wraps, function(each){
						if ( each.region != region_name )
							return 0;
						return each.grid.bottom;
					}),
					top = ( is_drop_me ? last_wrap.grid.top : bottom_wrap.grid.bottom );
				if ( can_drop(top, bottom) ){
					ed.drops.push({
						_id: ed._new_id(),
						top: current_full_top,
						bottom: bottom,
						left: region.grid.left,
						right: region.grid.right,
						priority: {
							top: top,
							bottom: bottom,
							left: region.grid.left,
							right: region.grid.right
						},
						priority_index: 10,
						type: 'full',
						insert: ['append', $region],
						region: region,
						is_me: is_drop_me,
						is_clear: true,
						is_use: false,
						is_switch: false
					});
				}
			}
			else {
				var bottom = ( region.grid.bottom-region.grid.top > row ? region.grid.bottom : region.grid.top + row );
				if ( can_drop(region.grid.top, bottom) ){
					ed.drops.push({
						_id: ed._new_id(),
						top: region.grid.top,
						bottom: bottom,
						left: region.grid.left,
						right: region.grid.right,
						priority: null,
						priority_index: 10,
						type: 'full',
						insert: ['append', $region],
						region: region,
						is_me: ( region_name == 'shadow' && me.region == region_name ),
						is_clear: true,
						is_use: false,
						is_switch: false
					});
				}
			}
		});
		this.time_end('fn create_drop_point');
	},

	/**
	 * Update wrappers
	 */
	update_wrappers: function (region) {
		this.time_start('fn update_wrappers');
		var app = Upfront.Application,
			ed = Upfront.Behaviors.GridEditor,
			$main = $(Upfront.Settings.LayoutEditor.Selectors.main),
			$layout = $main.find('.upfront-layout'),
			wraps = region.get('wrappers');
		$layout.find('.upfront-wrapper').each(function(){
			var $wrap = $(this),
				wrap_id = $wrap.attr('id'),
				wrap_model = wraps.get_by_wrapper_id(wrap_id),
				clear = $wrap.data('clear');
			if ( $wrap.children().size() == 0 ){
				if ( wrap_model )
					wraps.remove(wrap_model);
				return;
			}
			if ( $wrap.hasClass('upfront-wrapper-preview') )
				return;
			if ( ! wrap_model )
				return;
			var child_els = _.map($wrap.children(), function(each){
					var $el = $(each).hasClass('upfront-module-group') ? $(each) : $(each).find('>.upfront-editable_entity:first');
					return {
						$el: $el,
						col: ed.get_class_num($el, ed.grid.class),
						margin: $el.data('margin')
					};
				}),
				max = _.max(child_els, function(each){ return each.col + each.margin.current.left + each.margin.current.right; }),
				wrap_col = max.col+max.margin.current.left+max.margin.current.right;
			ed.update_class($wrap, ed.grid.class, wrap_col);
			wrap_model.replace_class(ed.grid.class+wrap_col);
			if ( (clear && clear == 'clear') || (!clear && $wrap.hasClass('clr')) )
				wrap_model.add_class('clr');
			else
				wrap_model.remove_class('clr');
			$wrap.stop().css({
				position: '',
				left: '',
				right: ''
			});
		});
		wraps.each(function(wrap){
			if ( $('#'+wrap.get_wrapper_id()).size() == 0 )
				wraps.remove(wrap);
		});
		this.time_end('fn update_wrappers');
	},


	/**
	 * Create resizable
	 *
	 * @param {Object} view
	 * @param {Object} model
	 */
	create_resizable: function(view, model){
		var app = this,
			ed = Upfront.Behaviors.GridEditor,
			$me = view.$el.find('.upfront-editable_entity:first'),
			$main = $(Upfront.Settings.LayoutEditor.Selectors.main),
			$layout = $main.find('.upfront-layout'),
			$resize, $resize_placeholder,
			axis
		;
		if ( model.get_property_value_by_name('disable_resize') === 1 )
			return false;
		if ( $me.data('ui-resizable') ){
			$me.resizable('option', 'disabled', false);
			return false;
		}
		$me.append('<span class="upfront-icon-control upfront-icon-control-resize-nw upfront-resize-handle-nw ui-resizable-handle ui-resizable-nw"></span>');
		$me.append('<span class="upfront-icon-control upfront-icon-control-resize-se upfront-resize-handle-se ui-resizable-handle ui-resizable-se"></span>');
		$me.resizable({
			containment: "document",
			autoHide: true,
			delay: 50,
			handles: {
				nw: '.upfront-resize-handle-nw',
				se: '.upfront-resize-handle-se'
			},
			start: function(e, ui){
				ed.start(view, model);

				// Prevents quick scroll when resizing
				ed.resizing = window.scrollY;

				var col = ed.get_class_num($me, ed.grid.class),
					cls = ed.grid.class+col,
					me = ed.get_el($me),
					margin = $me.data('margin'),
					data = $(this).data('ui-resizable');
				axis = data.axis ? data.axis : 'se';
				cls += ' '+ed.grid.top_margin_class+margin.original.top;
				cls += ' '+ed.grid.bottom_margin_class+margin.original.bottom;
				cls += ' '+ed.grid.left_margin_class+margin.original.left;
				cls += ' '+ed.grid.right_margin_class+margin.original.right;
				$resize_placeholder = $('<div class="upfront-resize-placeholder"></div>');
				$resize_placeholder.addClass(cls).css('height', ui.originalSize.height).insertBefore($me);
				$resize = $('<div class="upfront-resize" style="height:'+me.height+'px;"></div>');
				$resize.css({
					height: me.height,
					width: me.width,
					minWidth: me.width,
					maxWidth: me.width,
					position: 'absolute'
				})
				if ( axis == 'nw' )
					$resize.css({
						bottom: $('body').height() - me.position.bottom + ed.baseline,
						right: $('body').width() - me.position.right
					});
				else
					$resize.css({
						top: me.position.top,
						left: me.position.left
					});
				$('body').append($resize);
				// Refreshing the elements position
				_.each(ed.els, function(each, index){
					ed.els[index] = ed.get_position(each.$el);
				});
				// Refreshing the wrapper position
				_.each(ed.wraps, function(each, index){
					ed.wraps[index] = ed.get_position(each.$el);
				});
				ed.normalize(ed.els, ed.wraps);
				ed.update_position_data();
				// Clear margin and assign an absolute position, hack into the resizable instance as well
				var me_pos = $me.position(),
					rsz_pos = {
						left: me_pos.left + ( margin.original.left * ed.col_size ),
						top: me_pos.top + ( margin.original.top * ed.baseline )
					};
				$me.css({
					marginLeft: 0,
					marginTop: 0,
					left: rsz_pos.left,
					top: rsz_pos.top,
					minHeight: ''
				});
				data.originalPosition.left = rsz_pos.left;
				data.originalPosition.top = rsz_pos.top;
				data._updateCache({
					left: rsz_pos.left,
					top: rsz_pos.top
				});
				Upfront.Events.trigger("entity:resize_start", view, view.model);
			},
			resize: function(e, ui){
				var $wrap = $me.closest('.upfront-wrapper'),
					$region = $me.closest('.upfront-region'),
					col = ed.get_class_num($me, ed.grid.class),
					me = ed.get_el($me),
					wrap = ed.get_wrap($wrap),
					region = ed.get_region($region),
					expand_lock = $region.hasClass('upfront-region-expand-lock'),
					aff_els = wrap ? ed.get_affected_wrapper_els(wrap, ed.wraps, [], true) : ed.get_affected_els(me, ed.els, [], true),
					move_limit = ed.get_move_limit(aff_els, ed.containment),
					max_col = col + ( axis == 'nw' ? me.grid.left-move_limit[0] : move_limit[1]-me.grid.right ),

					top_aff_el = aff_els.bottom.length ? _.min(aff_els.bottom, function(each){ return each.grid.top; }) : false,
					max_row = top_aff_el ? top_aff_el.grid.top-me.grid.top : region.grid.bottom-me.grid.top,

					current_col = Math.ceil(ui.size.width/ed.col_size),
					w = ( current_col > max_col ? Math.round(max_col*ed.col_size) : ui.size.width ),
					h = ( (ui.size.height > 15 ? ui.size.height : 0) || ui.originalSize.height ),
					current_row = Math.ceil(h/ed.baseline),
					rsz_col = ( current_col > max_col ? max_col : current_col ),
					rsz_row = ( expand_lock && current_row > max_row && max_row > 0 ? max_row : current_row )
				;
				if ( Math.abs($(window).height()-e.clientY) < 50 ){
					h += (ed.baseline*10);
					$(window).scrollTop( $(window).scrollTop()+(ed.baseline*10) );
				}
				$me.css({
					height: h,
					width: w,
					minWidth: w,
					maxWidth: w
				});
				$me.data('resize-col', rsz_col);
				$me.data('resize-row', rsz_row);
				$resize.css({
					height: rsz_row*ed.baseline,
					width: rsz_col*ed.col_size,
					minWidth: rsz_col*ed.col_size,
					maxWidth: rsz_col*ed.col_size
				});
				if ( !expand_lock && axis != 'nw' )
					$resize_placeholder.css('height', rsz_row*ed.baseline);
			},
			stop: function(e, ui){
				Upfront.Events.trigger("entity:pre_resize_stop", view, view.model, ui);
				var $wrap = $me.closest('.upfront-wrapper'),
					$region = $me.closest('.upfront-region'),
					me = ed.get_el($me),
					margin = $me.data('margin'),
					wrap = ed.get_wrap($wrap),
					expand_lock = $region.hasClass('upfront-region-expand-lock'),
					aff_els = wrap ? ed.get_affected_wrapper_els(wrap, ed.wraps, [], true) : ed.get_affected_els(me, ed.els, [], true),
					move_limit = ed.get_move_limit(aff_els, ed.containment),
					prev_col = Math.ceil(ui.originalSize.width/ed.col_size),
					prev_row = Math.ceil(ui.originalSize.height/ed.baseline),
					rsz_col = $me.data('resize-col'),
					rsz_row = $me.data('resize-row'),

					regions = app.layout.get('regions'),
					region = regions.get_by_name($region.data('name'))
				;

				// Prevents quick scroll when resizing
				ed.resizing = false;

				$resize_placeholder.remove();
				$resize.remove();

				ed.update_class($me, ed.grid.class, rsz_col);
				if ( axis == 'nw' ){
					margin.current.left = margin.original.left - (rsz_col-prev_col);
					margin.current.top = margin.original.top - (rsz_row-prev_row);
					$me.data('margin', margin);
					ed.update_margin_classes($me);
				}
				else if ( axis == 'se' && wrap ){
					ed.adjust_affected_right(wrap, aff_els.right, [me], me.grid.left+rsz_col-1, true);
					if ( expand_lock )
						ed.adjust_affected_bottom(wrap, aff_els.bottom, [me], me.grid.top+rsz_row-1, true);
				}

				ed.update_wrappers(region);

				// Make sure CSS is reset, to fix bug when it keeps all resize CSS for some reason
				$me.css({
					width: '',
					minWidth: '',
					maxWidth: '',
					height: '',
					position: '',
					top: '',
					left: '',
					marginLeft: '',
					marginTop: ''
				});

				model.set_property('row', rsz_row);
				// Also resize containing object if it's only one object
				var objects = model.get('objects');
				if ( objects && objects.length == 1 ){
					objects.each(function(object){
						object.set_property('row', rsz_row - Upfront.Util.height_to_row(ed.grid.column_padding*2));
					});
				}

				// Update model value
				if ( axis == 'nw' ){
					model.replace_class([
						ed.grid.class+rsz_col,
						ed.grid.left_margin_class+margin.current.left,
						ed.grid.right_margin_class+margin.current.right,
						ed.grid.top_margin_class+margin.current.top,
						ed.grid.bottom_margin_class+margin.current.bottom
					].join(' '));
				}
				else{
					model.replace_class(ed.grid.class+rsz_col);
					ed.update_model_margin_classes($region.find('.upfront-module, .upfront-module-group').not($me));
				}

				view.trigger('entity:resize', {row: rsz_row, col: rsz_col}, view, view.model);
				Upfront.Events.trigger("entity:resize_stop", view, view.model, ui);
				Upfront.Events.trigger("entity:resized", view, view.model);
			}
		});
	},

	toggle_resizables: function (enable) {
		$('.upfront-editable_entity.ui-resizable').resizable('option', 'disabled', (!enable));
	},

	/**
	 * Resize element
	 *
	 * @param (object) view
	 * @param (object) model
	 * @param (integer) col
	 * @param (integer) row
	 * @param (string) axis nw|se|all
	 * @param (bool) force
	 */
	resize: function (view, model, col, row, axis, force) {
		var app = Upfront.Application,
			ed = Upfront.Behaviors.GridEditor,
			axis = /all|nw|se/.test(axis) ? axis : 'all',
			$main = $(Upfront.Settings.LayoutEditor.Selectors.main),
			$layout = $main.find('.upfront-layout');

		ed.start(view, model);

		var $me = view.$el.find('.upfront-editable_entity:first'),
			$object = $me.find('.upfront-editable_entity'),
			$wrap = $me.closest('.upfront-wrapper'),
			$region = $me.closest('.upfront-region'),
			margin = $me.data('margin'),
			me = ed.get_el($me),
			wrap = ed.get_wrap($wrap),
			region = ed.get_region($region),
			expand_lock = $region.hasClass('upfront-region-expand-lock'),
			aff_els = wrap ? ed.get_affected_wrapper_els(wrap, ed.wraps, [], true) : ed.get_affected_els(me, ed.els, [], true),
			max = ed.get_max_size(me, ed.els, region, axis),
			regions = app.layout.get('regions'),
			region_model,
			col = col ? ( col > max.col ? max.col : col ) : me.col,
			row = row ? ( max.row && row > max.row ? max.row : row ) : me.row
		;

		if ( col < 1 || row < 1 )
			return false;

		if ( !force ){
			$me.css('min-height', '');
			$object.css('min-height', '');
			var min_row = Math.ceil($me.outerHeight()/ed.baseline);
			row = row > min_row ? row : min_row;
			$me.css('min-height', row*ed.baseline);
			$object.css('min-height', (row-2)*ed.baseline);
		}


		regions.each(function(reg){
			if ( reg.get('modules') == model.collection )
				region_model = reg;
		});
		ed.normalize(ed.els, ed.wraps);
		ed.update_position_data();
		if ( axis == 'nw' ){
			margin.current.left = margin.original.left - (col-me.col);
			margin.current.top = margin.original.top - (row-me.row);
			$me.data('margin', margin);
			ed.update_margin_classes($me);
		}
		else if ( axis == 'se' && wrap ){
			ed.adjust_affected_right(wrap, aff_els.right, [me], me.grid.left+col-1, true);
			if ( expand_lock )
				ed.adjust_affected_bottom(wrap, aff_els.bottom, [me], me.grid.top+row-1, true);
		}
		else if ( axis == 'all' ){
			var max_se = ed.get_max_size(me, ed.els, region, 'se'),
				col_se = col > max_se.col ? max_se.col : col,
				row_se = max_se.row ? ( row > max_se.row ? max_se.row : row ) : false;
			if ( wrap ){
				ed.adjust_affected_right(wrap, aff_els.right, [me], me.grid.left+col_se-1, true);
				if ( expand_lock && row_se )
					ed.adjust_affected_bottom(wrap, aff_els.bottom, [me], me.grid.top+row_se-1, true);
			}
			margin.current.left = margin.original.left - (col-col_se);
			if ( row_se )
				margin.current.top = margin.original.top - (row-row_se);
			$me.data('margin', margin);
			ed.update_margin_classes($me);
		}
		ed.update_class($me, ed.grid.class, col);
		ed.update_wrappers(region_model);
		model.set_property('row', row);
		// Also resize containing object if it's only one object
		var objects = model.get('objects');
		if ( objects && objects.length == 1 ){
			objects.each(function(object){
				object.set_property('row', row - Upfront.Util.height_to_row(ed.grid.column_padding*2));
			});
		}
		// Update model value
		if ( axis != 'se' ){
			model.replace_class([
				ed.grid.class+col,
				ed.grid.left_margin_class+margin.current.left,
				ed.grid.right_margin_class+margin.current.right,
				ed.grid.top_margin_class+margin.current.top,
				ed.grid.bottom_margin_class+margin.current.bottom
			].join(' '));
		}
		else{
			model.replace_class(ed.grid.class+col);
			ed.update_model_margin_classes($layout.find('.upfront-module, .upfront-module-group').not($me));
		}

		view.trigger('entity:resize', {row: row, col: col}, view, view.model);
		Upfront.Events.trigger("entity:resized", view, view.model);
		return true;
	},

	/**
	 * Create draggable
	 *
	 * @param {Object} view
	 * @param {Object} model
	 */
	create_draggable: function(view, model){
		var app = this,
			ed = Upfront.Behaviors.GridEditor,
			is_group = view.$el.hasClass('upfront-module-group'),
			$me = is_group ? view.$el : view.$el.find('.upfront-editable_entity:first'),
			is_parent_group = ( typeof view.group_view != 'undefined' ),
			$main = $(Upfront.Settings.LayoutEditor.Selectors.main),
			$layout = $main.find('.upfront-layout'),
			drop_top, drop_left, drop_col,
			adjust_bottom = false
		;
		if ( model.get_property_value_by_name('disable_drag') === 1 )
			return false;
		if ( $me.data('ui-draggable') ){
			if ( is_group || !is_parent_group )
				$me.draggable('option', 'disabled', false);
			return false;
		}

		function select_drop (drop) {
			ed.time_start('fn select_drop');
			if ( drop.is_use )
				return;
			var drop_move = typeof ed.drop == 'object' && !drop.is_me ? true : false;
			_.each(ed.drops, function(each){
				each.is_use = ( each._id == drop._id );
			});
			ed.drop = drop;

			if ( ed.show_debug_element ){
				$('.upfront-drop-view-current').removeClass('upfront-drop-view-current');
				$('#drop-view-'+drop._id).addClass('upfront-drop-view-current');
			}
			$('.upfront-drop').removeClass('upfront-drop-use').animate({height: 0}, 300, function(){ $(this).remove(); });
			_.each(ed.drops, function(each){
				if ( each.is_switch )
					each.insert[1].animate({left: 0}, 300);
			});
			var $drop = $('<div class="upfront-drop upfront-drop-use"></div>'),
				me = ed.get_el($me),
				drop_change = function () {
					Upfront.Events.trigger("entity:drag:drop_change", view, view.model);
				};
			switch ( drop.insert[0] ){
				case 'before':
					$drop.insertBefore( drop.type == 'inside' ? drop.insert[1].parent() : drop.insert[1] );
					break;
				case 'after':
					$drop.insertAfter( drop.type == 'inside' ? drop.insert[1].parent() : drop.insert[1] );
					break;
				case 'append':
					drop.insert[1].append($drop);
					break;
			}
			if ( ( ( drop.type == 'full' || drop.type == 'inside' || ( drop.type == 'side-after' && !drop.is_switch ) ) && !drop.is_me ) && ( drop.priority && drop.priority.bottom-drop.priority.top+1 < me.row  ) )
				$drop.css('width', (drop.right-drop.left+1)*ed.col_size).css('max-height', ed.max_row*ed.baseline).animate({height: me.height}, 300, 'swing', drop_change);
			else if (  drop.type == 'side-before' && drop.is_switch )
				drop.insert[1].animate({left: me.width}, 300, 'swing', drop_change);
			else if (  drop.type == 'side-after' && drop.is_switch )
				drop.insert[1].animate({left: me.width*-1}, 300, 'swing', drop_change);
			else if ( drop_move )
				drop_change();
			ed.time_end('fn select_drop');
		}

		$me.draggable({
			revert: true,
			revertDuration: 0,
			zIndex: 100,
			helper: 'clone',
			disabled: is_parent_group,
			cancel: '.upfront-entity_meta',
			delay: 15,
			appendTo: $main,
			start: function(e, ui){
				is_parent_group = ( typeof view.group_view != 'undefined' );
				ed.time_start('drag start');
				$main.addClass('upfront-dragging');

				ed.start(view, model);
				ed.normalize(ed.els, ed.wraps);
				ed.update_position_data();
				var $helper = $('.ui-draggable-dragging'),
					$wrap = $me.closest('.upfront-wrapper'),
					$region = $me.closest('.upfront-region'),
					me = ed.get_el($me),
					wrap = ed.get_wrap($wrap),
					me_offset = $me.offset();
				$region.css('min-height', $region.css('height'));
				//$me.hide();
				$me.css('visibility', 'hidden');
				$helper.css('max-width', me.width);
				$helper.css('height', me.height);
				$helper.css('max-height', ed.max_row*ed.baseline);
				$helper.css('margin-left', $me.css('margin-left')); // fix error with the percentage margin applied
				ed.create_drop_point(me, wrap);

				$wrap.css('min-height', '1px');

				$('.upfront-drop-me').css('height', (me.outer_grid.bottom-me.outer_grid.top)*ed.baseline);

				$layout.append( '<div id="upfront-drop-preview" style="top:' + me_offset.top + 'px; left: ' + me_offset.left + 'px;"></div>' );

				/* */
				if ( ed.show_debug_element ){
					_.each(ed.els, function(each){
						each.$el.find(".upfront-debug-info").size() || each.$el.find('.upfront-editable_entity:first').append('<div class="upfront-debug-info"></div>');
						each.$el.find(".upfront-debug-info").text('grid: ('+each.grid.left+','+each.grid.right+'),('+each.grid.top+','+each.grid.bottom+') | outer: ('+each.outer_grid.left+','+each.outer_grid.right+'),('+each.outer_grid.top+','+each.outer_grid.bottom+') | center: '+each.grid_center.x+','+each.grid_center.y);
					});
					_.each(ed.drops, function(each){
						//each.$el.append('<div class="upfront-drop-debug">('+each.left+','+each.top+'),('+each.right+','+each.bottom+')</div>');
						var $view = $('<div class="upfront-drop-view"><div class="upfront-drop-priority-view"></div><span class="upfront-drop-view-pos"></span></div>');
						$view.addClass('upfront-drop-view-'+each.type);
						if ( each.is_me )
							$view.addClass('upfront-drop-view-me');
						$view.attr('id', 'drop-view-'+each._id);
						$view.css({
							top: (each.top-1)*ed.baseline,
							left: (each.left-1)*ed.col_size + (ed.grid_layout.left-ed.main.left),
							width: (each.right-each.left+1) * ed.col_size,
							height: (each.bottom-each.top+1) * ed.baseline
						});
						if ( each.priority ){
							$view.find('.upfront-drop-priority-view').css({
								top: (each.priority.top-each.top)*ed.baseline,
								left: (each.priority.left-each.left)*ed.col_size,
								width: (each.priority.right-each.priority.left+1) * ed.col_size,
								height: (each.priority.bottom-each.priority.top+1) * ed.baseline
							});
						}
						$view.find('.upfront-drop-view-pos').text('('+each.left+','+each.right+')'+'('+each.top+','+each.bottom+')');
						$layout.append($view);
					});
					$layout.append('<div id="upfront-compare-area"></div>');
					$helper.find(".upfront-debug-info").size() || $helper.append('<div class="upfront-debug-info"></div>');
				}/* */

				// Default drop to me
				select_drop( _.find(ed.drops, function(each){ return each.is_me; }) );
				$region.addClass('upfront-region-drag-active');

				ed.time_end('drag start');
				ed.time_start('drag start - trigger');
				Upfront.Events.trigger("entity:drag_start", view, view.model);
				ed.time_end('drag start');
			},
			drag: function(e, ui){
				//ed.time_start('dragging');
				var $helper = $('.ui-draggable-dragging'),
					$wrap = $me.closest('.upfront-wrapper'),
					me = ed.get_el($me),
					wrap = ed.get_wrap($wrap),

					move_region = !($me.closest('.upfront-region').hasClass('upfront-region-drag-active')),
					region,

					height = $helper.outerHeight(),
					width = $helper.outerWidth(),

					current_offset = $helper.offset(),
					current_left = current_offset.left,
					current_top = current_offset.top,
					current_bottom = current_top+height,
					current_right = current_left+width,
					current_x = current_left+(width/2),
					current_y = current_top+(height/2),

					current_grid = ed.get_grid(current_left, current_top),
					current_grid_left = current_grid.x,
					current_grid_top = current_grid.y,
					current_grid2 = ed.get_grid(current_right, current_bottom),
					current_grid_right = current_grid2.x-1,
					current_grid_bottom = current_grid2.y-1,

					grid = ed.get_grid(e.pageX, e.pageY),
					col = ed.get_class_num($me, ed.grid.class),

					compare_area_top = grid.y-(ed.compare_row/2),
					compare_area_top = compare_area_top < current_grid_top ? current_grid_top : compare_area_top,
					compare_area_left = grid.x-(ed.compare_col/2),
					compare_area_left = compare_area_left < current_grid_left ? current_grid_left : compare_area_left,
					compare_area_right = compare_area_left+ed.compare_col-1,
					compare_area_right = compare_area_right > current_grid_right ? current_grid_right : compare_area_right,
					compare_area_bottom = compare_area_top+ed.compare_row-1,
					compare_area_bottom = compare_area_bottom > current_grid_bottom ? current_grid_bottom : compare_area_bottom,
					compare_area_bottom = compare_area_bottom > compare_area_top+ed.max_row ? compare_area_top+ed.max_row : compare_area_bottom,

					compare_area_position = [grid.x, grid.y, compare_area_top, compare_area_right, compare_area_bottom, compare_area_left] // to store as reference
				;

				//console.log(compare_area_position)
				//console.log(ed._last_drag_position)

				if ( ed._last_drag_position && ed._last_drag_position == compare_area_position ){
					// not moving? Then let's not bother
					return;
				}
				ed._last_drag_position = compare_area_position;


				//$helper.css('max-width', region.col*ed.col_size);

				clearTimeout(ed._t);
				ed._t = setTimeout(function(){
					update_current_region();
					col = col > region.col ? region.col : col;
					update_current_drop();
				}, ed.timeout);

				function update_current_region () {
					// Finding the regions we currently on
					var $last_region_container = $('.upfront-region-container-wide, .upfront-region-container-clip').not('.upfront-region-container-shadow').last(),
						regions_area = _.map(ed.regions, function(each){
							var top, bottom, left, right, area,
								is_same_container = ( each.$el.closest('.upfront-region-container').get(0) == $last_region_container.get(0) ),
								region_bottom = ( is_same_container && ( !each.$el.hasClass('upfront-region-side') || each.$el.hasClass('upfront-region-side-left') || each.$el.hasClass('upfront-region-side-right') ) ) ? 999999 : each.grid.bottom, // Make this bottom-less if it's in the last region container
								area = get_area_compared({
									top: each.grid.top,
									bottom: region_bottom,
									left: each.grid.left,
									right: each.grid.right
								}),
								type = each.$el.data('type'),
								priority = ed.region_type_priority[type];
							area *= priority;
							if ( each.$el.hasClass('upfront-region-drag-active') )
								area *= 1.2;
							return {
								area: area,
								region: each
							};
						}),
						max_region = _.max(regions_area, function(each){ return each.area; });

					region = max_region.area > 0 ? max_region.region : ed.get_region($me.closest('.upfront-region'));

					if ( ed.show_debug_element ){
						_.each(regions_area, function(r){
							r.region.$el.find('>.upfront-debug-info').text(r.area);
						});
					}

					if ( !region.$el.hasClass('upfront-region-drag-active') ){
						$('.upfront-region-drag-active').removeClass('upfront-region-drag-active');
						region.$el.addClass('upfront-region-drag-active');
					}
				}

				function update_current_drop () {
					var drops_area = _.map(ed.drops, function(each){
							if ( each.region._id != region._id )
								return false;
							var area = get_area_compared(each);
							return {
								area: area,
								drop: each
							};
						}).filter(function(each){
							if ( each !== false )
								return true;
							return false;
						}),
						max_drop = _.max(drops_area, function(each){ return each.area; });

					if ( max_drop.area > 0 ){
						var max_drops = _.filter(drops_area, function(each){ return each.area == max_drop.area; }),
							max_drops_sort = _.sortBy(max_drops, function(each, index, list){
								var priority_area = each.drop.priority ? get_area_compared(each.drop.priority) : 0;
								if ( priority_area*2 > each.area )
									return each.drop.priority.index;
								return each.drop.priority_index;
							}),
							drop = _.first(max_drops_sort).drop;
					}
					else {
						/*if ( region.$el.find('.upfront-drop-me').size() > 0 ){
							var drop = ed.get_drop($('.upfront-drop-me'));
						}
						else {
							var $first_drop = region.$el.find('.upfront-drop:first'),
								first_drop = ed.get_drop($first_drop),
								$last_drop = region.$el.find('.upfront-drop:last'),
								last_drop = ed.get_drop($last_drop);
							if ( compare_area_top < region.grid.top + ((region.grid.bottom-region.grid.top)/2) )
								var drop = first_drop;
							else
								var drop = last_drop;
						}*/
						var drop = _.find(ed.drops, function(each){
							return each.is_me;
						});
					}
					select_drop(drop);
					update_drop_position();
				}

				function get_area_compared (compare) {
					var top, bottom, left, right, area;
					if ( compare_area_left >= compare.left && compare_area_left <= compare.right )
						left = compare_area_left;
					else if ( compare_area_left < compare.left )
						left = compare.left;
					if ( compare_area_right >= compare.left && compare_area_right <= compare.right )
						right = compare_area_right;
					else if ( compare_area_right > compare.right )
						right = compare.right;
					if ( compare_area_top >= compare.top && compare_area_top <= compare.bottom )
						top = compare_area_top;
					else if ( compare_area_top < compare.top )
						top = compare.top;
					if ( compare_area_bottom >= compare.top && compare_area_bottom <= compare.bottom )
						bottom = compare_area_bottom;
					else if ( compare_area_bottom > compare.bottom )
						bottom = compare.bottom;
					if ( top && bottom && left && right /*&& grid.x > 0 && grid.x <= ed.grid.size*/ )
						area = (right-left+1) * (bottom-top+1);
					else
						area = 0;
					return area ? area : 0;
				}

				function update_drop_position(){
					var drop_priority_top = ed.drop.priority ? ed.drop.priority.top-ed.drop.top : 0,
						expand_lock = ed.drop.region.$el.hasClass('upfront-region-expand-lock'),
						drop_row = ( ed.drop.priority ? ed.drop.priority.bottom-ed.drop.priority.top+1 : ed.drop.bottom-ed.drop.top+1 );
					drop_top = current_grid_top > (ed.drop.top+drop_priority_top) ? current_grid_top-ed.drop.top-drop_priority_top : 0;
					drop_left = current_grid_left > ed.drop.left ? current_grid_left-ed.drop.left : 0;
					drop_col = ed.drop.priority && !ed.drop.is_switch ? ed.drop.priority.right-ed.drop.priority.left+1 : ed.drop.right-ed.drop.left+1;
					adjust_bottom = false;

					if ( drop_col <= col && ed.drop.priority && !ed.drop.is_switch ){
						drop_left = ed.drop.priority.left+drop_left+drop_col-1 < ed.drop.priority.right ? drop_left : ed.drop.priority.right-drop_col-ed.drop.priority.left+1;
					}
					else {
						drop_col = drop_col <= col ? drop_col : col;
						drop_left = ed.drop.left+drop_left+drop_col-1 < ed.drop.right ? drop_left : ed.drop.right-drop_col-ed.drop.left+1;
					}
					// If expand lock enabled, don't let the drop_top + me.row to exceed the drop.bottom
					if ( expand_lock && drop_top+me.row > drop_row )
						drop_top = drop_row - me.row;
					if ( drop_row >= drop_top+me.row )
						adjust_bottom = true;

					$('#upfront-drop-preview').css({
						top: (ed.drop.top+drop_priority_top+drop_top-1) * ed.baseline,
						left: (ed.drop.left+drop_left-1) * ed.col_size + (ed.grid_layout.left-ed.main.left),
						width: drop_col*ed.col_size,
						height: height
					});

					if ( ed.show_debug_element ){
						$('#upfront-compare-area').css({
							top: (compare_area_top-1) * ed.baseline,
							left: (compare_area_left-1) * ed.col_size + (ed.grid_layout.left-ed.main.left),
							width: (compare_area_right-compare_area_left+1) * ed.col_size,
							height: (compare_area_bottom-compare_area_top+1) * ed.baseline
						}).text('('+compare_area_left+','+compare_area_right+') '+'('+compare_area_top+','+compare_area_bottom+')');
					}

				}

				update_drop_position();

				if ( ed.show_debug_element ){
					$helper.find(".upfront-debug-info").text('grid: '+grid.x+','+grid.y+' | current: ('+current_grid_left+','+current_grid_top+'),('+current_grid_right+','+current_grid_bottom+') | margin size: '+drop_top+'/'+drop_left);
				}

				//ed.time_end('dragging');
			},
			stop: function(e, ui){
				ed.time_start('drag stop');
				var $wrap = $me.closest('.upfront-wrapper'),
					me = ed.get_el($me),
					wrap = ed.get_wrap($wrap),
					col = ed.get_class_num($me, ed.grid.class),
					$drop = $('.upfront-drop-use'),
					is_object = view.$el.find(".upfront-editable_entity:first").is(".upfront-object"),
					dropped = false,
					regions = app.layout.get("regions");
					region = regions.get_by_name( $('.upfront-region-drag-active').data('name') ),
					wrappers = region.get('wrappers'),
					move_region = ( me.region != region.get('name') ),
					region_el = ed.get_region($('.upfront-region-drag-active'));

				clearTimeout(ed._t); // clear remaining timeout immediately

				if ( ed.drop.is_me ){
					update_margin();
					drop_update();
				}
				else {
					dropped = true;
					if ( ed.drop.type != 'inside' ){
						var wrapper_id = Upfront.Util.get_unique_id("wrapper");
							wrap_model = new Upfront.Models.Wrapper({
								"name": "",
								"properties": [
									{"name": "wrapper_id", "value": wrapper_id},
									{"name": "class", "value": ed.grid.class+drop_col}
								]
							}),
							wrap_view = new Upfront.Views.Wrapper({model: wrap_model});
						wrappers.add(wrap_model);
						if ( ed.drop.type == 'full' || ed.drop.is_clear )
							wrap_model.add_class('clr');
						wrap_view.render();
						wrap_view.$el.append(view.$el);
						if ( ed.drop.type == 'side-before' && ed.drop.is_clear )
							$drop.nextAll('.upfront-wrapper').eq(0).removeClass('clr');
						$drop.before(wrap_view.$el);
						Upfront.data.wrapper_views[wrap_model.cid] = wrap_view;
					}
					else {
						var $drop_wrap = $drop.closest('.upfront-wrapper'),
							wrapper_id = $drop_wrap.attr('id');
						$drop.before(view.$el);
					}
					if ( $wrap.children(':not(.upfront-drop)').size() == 0 ){
						if ( wrap && wrap.grid.left == region_el.grid.left )
							$wrap.nextAll('.upfront-wrapper').eq(0).addClass('clr');
						$wrap.remove();
					}
					update_margin();
					// var $me_drop_full = $('.upfront-drop-me.upfront-drop-wrap-full');
					// if ( $me_drop_full.size() > 0 && $('.upfront-drop').index($me_drop_full) < $('.upfront-drop').index($drop) ){
						// // animate the previous drop area for smooth transition
						// $('.upfront-region').css('min-height', '');
						// $me_drop_full.stop().animate({height: 0}, 1000, 'swing', function(){
							// drop_update();
						// });
					// }
					// else {
						drop_update();
					// }
				}

				function update_margin () {
					ed.time_start('fn update_margin');
					var margin_data = $me.data('margin'),
						aff_els = wrap ? ed.get_affected_wrapper_els(wrap, ed.wraps, [], true) : ed.get_affected_els(me, ed.els, [], true),
						move_limit = ed.get_move_limit(aff_els, ed.containment),
						bottom_limit = (ed.drop.priority ? ed.drop.priority.top : ed.drop.top)+drop_top+me.row-1,
						recalc_margin_x = false;

					if ( ed.drop.is_me ){
						if ( margin_data.current.left != drop_left ){
							margin_data.current.left = drop_left;
							recalc_margin_x = true;
						}
						margin_data.current.top = drop_top;
						$me.data('margin', margin_data);

						// Recalculate margin so the affected elements remain in their position
						if ( recalc_margin_x ){
							if ( wrap )
								ed.adjust_affected_right(wrap, aff_els.right, [me], move_limit[0]+drop_col+drop_left-1);
							//else
							//	ed.adjust_els_right(aff_els.right, move_limit[0]+drop_col+drop_left-1);
						}

						// Recalculate affected bottom
						if ( adjust_bottom ) {
							if ( wrap )
								ed.adjust_affected_bottom(wrap, aff_els.bottom, [me], bottom_limit);
						}
					}
					else { // Moved
						// normalize clear
						_.each(ed.wraps, function(each){
							each.$el.data('clear', (each.$el.hasClass('clr') ? 'clear' : 'none'));
						});
						if ( wrap && !ed.drop.is_switch )
							ed.adjust_affected_right(wrap, aff_els.right, [me], wrap.grid.left-1);
					//	else
					//		ed.adjust_els_right(aff_els.right, me.grid.left-1);
						margin_data.current.left = drop_left;
						margin_data.current.top = drop_top;
						margin_data.current.right = 0;
						margin_data.current.bottom = 0;
						if ( ed.drop.type == 'side-before' ){
							var $nx_wrap = ed.drop.insert[1];
							if ( $nx_wrap.size() > 0 ){
								var nx_wrap = ed.get_wrap($nx_wrap),
									need_adj = _.filter(ed.get_wrap_els(nx_wrap), function(each){
										return ( me.$el.get(0) != each.$el.get(0) && each.outer_grid.left == nx_wrap.grid.left );
									}),
									need_adj_min = ed.get_wrap_el_min(nx_wrap),
									nx_wrap_aff = ed.get_affected_wrapper_els(nx_wrap, ed.wraps, [], true);
								if ( ! $nx_wrap.hasClass('clr') || ed.drop.is_clear ){
									ed.adjust_els_right(need_adj, nx_wrap.grid.left+drop_col+drop_left-1);
									$nx_wrap.data('clear', 'none');
								}
								if ( ed.drop.is_switch ){
									ed.adjust_els_right(need_adj, nx_wrap.grid.left+drop_left-1);
									$nx_wrap.css('left', '');
								}
								if ( adjust_bottom )
									ed.adjust_affected_bottom(nx_wrap, nx_wrap_aff.bottom, [me], bottom_limit > nx_wrap.outer_grid.bottom ? bottom_limit : nx_wrap.outer_grid.bottom);
							}
						}
						else if ( ed.drop.type == 'side-after' ){
							var $pv_wrap = ed.drop.insert[1];
							if ( $pv_wrap.size() > 0 ){
								var pv_wrap = ed.get_wrap($pv_wrap),
									need_adj = _.filter(ed.get_wrap_els(pv_wrap), function(each){
										return ( me.$el.get(0) != each.$el.get(0) && each.outer_grid.left == pv_wrap.grid.left );
									}),
									pv_wrap_aff = ed.get_affected_wrapper_els(pv_wrap, ed.wraps, [], true);
								if ( ed.drop.is_switch ){
									ed.adjust_els_right(need_adj, pv_wrap.grid.left-(me.grid.left-me.outer_grid.left)-1);
									$pv_wrap.css('left', '');
								}
								if ( adjust_bottom )
									ed.adjust_affected_bottom(pv_wrap, pv_wrap_aff.bottom, [me], bottom_limit > pv_wrap.outer_grid.bottom ? bottom_limit : pv_wrap.outer_grid.bottom);
							}
						}
						else if ( ed.drop.type == 'inside' ) {
							var $drop_wrap = $drop.closest('.upfront-wrapper'),
								drop_wrap = ed.get_wrap($drop_wrap),
								drop_wrap_aff = drop_wrap ? ed.get_affected_wrapper_els(drop_wrap, ed.wraps, (wrap && ed.get_wrap_els(wrap).length == 1 ? [wrap, me] : [me]), true) : false;
							if ( drop_wrap ){
								ed.adjust_affected_right(drop_wrap, drop_wrap_aff.right, [me], ed.drop.left+drop_col+drop_left-1);
							}
							if ( adjust_bottom && ed.drop.insert[0] == 'before' ) {
								var $nx = ed.drop.insert[1],
									nx = ed.get_el($nx);
								ed.adjust_els_bottom([nx], bottom_limit);
							}
						}
						else if ( ed.drop.type == 'full' ) {
							if ( ed.drop.insert[0] == 'before' ){
								var $nx_wrap = ed.drop.insert[1],
									nx_wrap = ed.get_wrap($nx_wrap),
									need_adj = _.filter(ed.get_wrap_els(nx_wrap), function(each){
										return ( me.$el.get(0) != each.$el.get(0) && each.outer_grid.top == nx_wrap.grid.top );
									});
								if ( adjust_bottom )
									ed.adjust_els_bottom(need_adj, bottom_limit);
							}
						}
						$me.data('margin', margin_data);
					}
					ed.time_end('fn update_margin');
				}

				function drop_update () {
					ed.time_start('fn drop_update');
					$('.upfront-drop').remove();
					$('.upfront-drop-view').remove();
					$('#upfront-drop-preview').remove();
					$('#upfront-compare-area').remove();

					ed.update_class($me, ed.grid.class, drop_col);
					( is_object ? ed.containment.$el.find('.upfront-object') : $layout.find('.upfront-module, .upfront-module-group').not('.ui-draggable-disabled') ).each(function(){
						ed.update_margin_classes($(this));
					});

					ed.update_wrappers(region);
					$me.css({
						'position': '',
						'top': '',
						'left': '',
						'z-index': '',
						'visibility': 'visible'
					});

					// Update model value
					ed.update_model_margin_classes( ( is_object ? ed.containment.$el.find('.upfront-object') : $layout.find('.upfront-module, .upfront-module-group').not('.ui-draggable-disabled') ).not($me) );
					ed.update_model_margin_classes( $me, [ed.grid.class + drop_col] );

					if ( wrapper_id )
						model.set_property('wrapper_id', wrapper_id, true);

					if ( !move_region ){
						view.resort_bound_collection();
					}
					else {
						var modules = region.get('modules'),
							models = [];
						model.collection.remove(model, {silent: true});
						if ( model.get('shadow') ){
							view.trigger('on_layout');
							model.unset('shadow', {silent: true});
						}
						$me.removeAttr('data-shadow');
						$('.upfront-region-drag-active').find('.upfront-module, .upfront-module-group').not('.ui-draggable-disabled').each(function(){
							var element_id = $(this).attr('id'),
								each_model = modules.get_by_element_id(element_id);
							if ( !each_model && element_id == $me.attr('id') )
								models.push(model);
							else if ( each_model )
								models.push(each_model);
						});
						modules.reset(models);
					}

					// Add drop animation
					$me = is_group ? view.$el : view.$el.find('.upfront-editable_entity:first');
					$me.one('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function(){
						$(this).removeClass('upfront-dropped');
						Upfront.Events.trigger("entity:drag_animate_stop", view, view.model);
					}).addClass('upfront-dropped');

					$('.upfront-region-drag-active .upfront-module').css('max-height', '');
					$('.upfront-region-drag-active').removeClass('upfront-region-drag-active');
					$wrap.css('min-height', '');
					$main.removeClass('upfront-dragging');


					Upfront.Events.trigger("entity:drag_stop", view, view.model);
					if(move_region){
						view.region = region;
						view.trigger('region:updated');
					}
					view.trigger("entity:drop", {col: drop_col, left: drop_left, top: drop_top}, view, view.model);
					view.trigger("entity:self:drag_stop");
					ed.time_end('fn drop_update');
				}

				// reset drop
				ed.drop = null;

				ed.time_end('drag stop');
			}
		});
	},

	toggle_draggables: function (enable) {
		$('.upfront-editable_entity.ui-draggable').draggable('option', 'disabled', (!enable));
	},

	refresh_draggables: function(){
		var app = this,
			ed = Upfront.Behaviors.GridEditor,
			$main = $(Upfront.Settings.LayoutEditor.Selectors.main),
			$layout = $main.find('.upfront-layout');
		$layout.find('.ui-draggable').each(function(){
			var cursor_top = $(this).outerHeight() > 60 ? 60 : $(this).outerHeight()/2;
			$(this).draggable('option', 'cursorAt', {top: cursor_top});
		});

	},

	normalize_module_remove: function (view, module, modules, wrapper, wrappers) {
		var app = Upfront.Application,
			ed = Upfront.Behaviors.GridEditor,
			index = modules.indexOf(module),
			prev_module = modules.at(index-1),
			next_module = modules.at(index+1),
			next_module_class, next_module_left,
			prev_wrapper, prev_wrapper_class,
			next_wrapper, next_wrapper_class, next_wrapper_col
		;
		if (!next_module && !prev_module) return false;
		var module_class = module.get_property_value_by_name('class'),
			wrapper_class = wrapper.get_property_value_by_name('class'),
			wrapper_col = ed.get_class_num(wrapper_class, ed.grid.class),
			i = 0,
			split_prev = false,
			split_next = false,
			adjust_next = false,
			prev_modules = [],
			next_modules = [];
		if ( next_module ){
			next_module_class = next_module.get_property_value_by_name('class');
			next_module_left = ed.get_class_num(next_module_class, ed.grid.left_margin_class);
			next_wrapper = wrappers.get_by_wrapper_id(next_module.get_wrapper_id());
			next_wrapper_class = next_wrapper.get_property_value_by_name('class');
			next_wrapper_col = ed.get_class_num(next_wrapper_class, ed.grid.class);
			if ( !next_wrapper_class.match(/clr/g) ){
				next_wrapper.replace_class(
					ed.grid.class + (next_wrapper_col+wrapper_col) +
					( wrapper_class.match(/clr/g) ? ' clr' : '' )
				);
				adjust_next = true;
				split_next = true;
			}
		}
		if ( prev_module ) {
			prev_wrapper = wrappers.get_by_wrapper_id(prev_module.get_wrapper_id());
			prev_wrapper_class = prev_wrapper.get_property_value_by_name('class');
			if ( prev_wrapper_class.match(/clr/g) && !split_next )
				split_prev = true;
		}
		while ( modules.at(i) ){
			var this_module = modules.at(i),
				this_module_class = this_module.get_property_value_by_name('class'),
				this_module_left = ed.get_class_num(this_module_class, ed.grid.left_margin_class);
			if ( prev_wrapper && this_module.get_wrapper_id() == prev_wrapper.get_wrapper_id() ) {
				prev_modules.push(this_module);
				i++;
				continue;
			}
			if ( next_wrapper && this_module.get_wrapper_id() == next_wrapper.get_wrapper_id() ) {
				next_modules.push(this_module);
				i++;
				continue;
			}
			if ( i > index ) {
				var this_wrapper = wrappers.get_by_wrapper_id(this_module.get_wrapper_id()),
					this_wrapper_class = this_wrapper.get_property_value_by_name('class');
				if ( !this_wrapper_class.match(/clr/g) )
					split_next = false;
				break;
			}
			i++;
		}
		if ( adjust_next ){
			_.each(next_modules, function (each_module, id) {
				var each_module_class = each_module.get_property_value_by_name('class'),
					each_module_left = ed.get_class_num(each_module_class, ed.grid.left_margin_class);
				each_module.replace_class(ed.grid.left_margin_class + (each_module_left+wrapper_col));
			});
		}
		if ( split_prev || split_next ){
			var current_wrapper = false;
			_.each(( split_prev ? prev_modules : next_modules ), function (each_module, id) {
				var each_module_class = each_module.get_property_value_by_name('class'),
					each_module_left = ed.get_class_num(each_module_class, ed.grid.left_margin_class),
					each_module_col = ed.get_class_num(each_module_class, ed.grid.class),
					each_module_view = Upfront.data.module_views[each_module.cid],
					each_wrapper = wrappers.get_by_wrapper_id(each_module.get_wrapper_id()),
					each_wrapper_view = Upfront.data.wrapper_views[each_wrapper.cid],
					current_wrapper_view = current_wrapper ? Upfront.data.wrapper_views[current_wrapper.cid] : each_wrapper_view;
				if ( id > 0 ){
					var wrapper_id = Upfront.Util.get_unique_id("wrapper");
						wrap_model = new Upfront.Models.Wrapper({
							"name": "",
							"properties": [
								{"name": "wrapper_id", "value": wrapper_id},
								{"name": "class", "value": ed.grid.class+(each_module_left+each_module_col) + ' clr'}
							]
						}),
						wrap_view = new Upfront.Views.Wrapper({model: wrap_model});
					wrappers.add(wrap_model);
					wrap_view.render();
					wrap_view.$el.append(each_module_view.$el);
					current_wrapper_view.$el.after(wrap_view.$el);
					Upfront.data.wrapper_views[wrap_model.cid] = wrap_view;
					each_module.set_property('wrapper_id', wrapper_id, true);
					current_wrapper = wrap_model;
				}
			});
		}
	},


	/**
	 * Create region resizable
	 *
	 * @param {Object} view
	 * @param {Object} model
	 */
	create_region_resizable: function(view, model){
		if ( !model.get("container") || model.get("container") == model.get("name") )
			return;
		var app = this,
			ed = Upfront.Behaviors.GridEditor,
			$me = view.$el,
			$main = $(Upfront.Settings.LayoutEditor.Selectors.main),
			$layout = $main.find('.upfront-layout'),
			collection = model.collection,
			index = collection.indexOf(model),
			total = collection.size()-1, // total minus shadow region
			sub = model.get('sub'),
			container = model.get('container'),
			directions, handles, axis,
			fixed_pos = {},
			get_fixed_pos = function () {
				var pos = {
						top: model.get_property_value_by_name('top'),
						left: model.get_property_value_by_name('left'),
						bottom: model.get_property_value_by_name('bottom'),
						right: model.get_property_value_by_name('right'),
						width: model.get_property_value_by_name('width'),
						height: model.get_property_value_by_name('height')
					};
				pos.is_top = ( typeof pos.top == 'number' );
				pos.is_left = ( typeof pos.left == 'number' );
				pos.is_bottom = ( typeof pos.bottom == 'number' );
				pos.is_right = ( typeof pos.right == 'number' );
				return pos;
			}
		;
		if ( $me.data('ui-resizable') )
			return false;
		if ( !sub || !sub.match(/^(fixed|left|right)$/) )
			return;
		if ( sub == 'left' ){
			directions = ['e'];
			handles = { e: '.upfront-region-resize-handle-e' };
		}
		else if ( sub == 'right' ) {
			directions = ['w'];
			handles = { w: '.upfront-region-resize-handle-w' };
		}
		else if ( sub == 'fixed' ) {
			fixed_pos = get_fixed_pos();
			if ( ( fixed_pos.is_top && fixed_pos.is_left ) || ( fixed_pos.is_bottom && fixed_pos.is_right ) ){
				directions = ['nw', 'se'];
				handles = { nw: '.upfront-region-resize-handle-nw', se: '.upfront-region-resize-handle-se' };
			}
			else{
				directions = ['ne', 'sw'];
				handles = { ne: '.upfront-region-resize-handle-ne', sw: '.upfront-region-resize-handle-sw' };
			}
		}
		_.each(directions, function(direction){
			var icon = ( direction == 'w' || direction == 'e' ) ? 'upfront-icon-control-region upfront-icon-control-region-resize upfront-icon-control-region-resize-' + direction : 'upfront-icon-control upfront-icon-control-resize upfront-icon-control-resize-' + direction;
			$me.append('<div class="' + icon + ' upfront-region-resize-handle upfront-region-resize-handle-' + direction + ' ui-resizable-handle ui-resizable-' + direction + '"></div>');
		});
		$me.resizable({
			containment: "document",
			//handles: "n, e, s, w",
			handles: handles,
			helper: "region-resizable-helper",
			disabled: true,
			zIndex: 9999999,
			start: function(e, ui){
				var col = ed.get_class_num($me, ed.grid.class),
					data = $(this).data('ui-resizable'),
					$helper = ui.helper;
				axis = data.axis ? data.axis : 'se';

				// Prevents quick scroll when resizing
				ed.resizing = window.scrollY;

				$(this).resizable('option', 'minWidth', ed.col_size*3);
				if ( sub != 'fixed' ){
					$(this).resizable('option', 'maxWidth', ed.col_size*10);
				}
				else {
					$(this).resizable('option', 'minHeight', ed.baseline*3);
					$me.css('position', '');
					view.update_region_position();
					fixed_pos = get_fixed_pos();
					// Hack into resizable instance
					var me_pos = $me.position();
					data.originalPosition.left = me_pos.left;
					data.originalPosition.top = me_pos.top;
					data.originalSize.width = fixed_pos.width;
					data.originalSize.height = fixed_pos.height;
					data._updateCache({
						left: me_pos.left,
						top: me_pos.top
					});
					$helper.css({
						marginLeft: 0,
						marginTop: 0,
						left: me_pos.left,
						top: me_pos.top,
						position: 'fixed'
					});
				}
				Upfront.Events.trigger("entity:region:resize_start", view, view.model);
			},
			resize: function(e, ui){
				var $helper = ui.helper;
				if ( sub != 'fixed' ){
					var col = ed.get_class_num($me, ed.grid.class),
						$prev = $me.prevAll('.upfront-region:first'),
						$next = $me.nextAll('.upfront-region:first'),
						prev_col = $prev.size() > 0 ? ed.get_class_num($prev, ed.grid.class) : 0,
						next_col = $next.size() > 0 ? ed.get_class_num($next, ed.grid.class) : 0,
						max_col = col + ( next_col > prev_col ? next_col : prev_col ),
						current_col = Math.abs(Math.ceil(ui.size.width/ed.col_size)),
						w = ( current_col > max_col ? Math.round(max_col*ed.col_size) : ui.size.width ),
						rsz_col = ( current_col > max_col ? max_col : current_col )
					;
					$helper.css({
						height: ui.originalSize.height,
						width: w,
						minWidth: w,
						maxWidth: w
					});
					$me.data('resize-col', rsz_col);
				}
				else {
					var offset = $me.offset(),
						main_offset = $main.offset(),
						height = $me.height(),
						width = $me.width(),
						max_height = max_width = false,
						rsz_width, rsz_height;
					if ( fixed_pos.is_top )
						max_height = axis == 'nw' || axis == 'ne' ? fixed_pos.top + height : false;
					if ( !fixed_pos.is_top && fixed_pos.is_bottom )
						max_height = axis == 'se' || axis == 'sw' ? fixed_pos.bottom + height : false;
					if ( fixed_pos.is_left )
						max_width = axis == 'nw' || axis == 'sw' ? fixed_pos.left + width : false;
					if ( !fixed_pos.is_left && fixed_pos.is_right )
						max_width = axis == 'se' || axis == 'ne' ? fixed_pos.right + width : false;
					rsz_height = Math.round( max_height && ui.size.height > max_height ? max_height : ui.size.height );
					rsz_width = Math.round( max_width && ui.size.width > max_width ? max_width : ui.size.width );
					$helper.css({
						height: rsz_height,
						width: rsz_width
					});
					view.update_size_hint(rsz_width, rsz_height, $helper);
					$me.data('resize-height', rsz_height);
					$me.data('resize-width', rsz_width);
				}
			},
			stop: function(e, ui){
				// Prevents quick scroll when resizing
				ed.resizing = false;

				// Make sure CSS is reset, to fix bug when it keeps all resize CSS for some reason
				$me.css({
					width: '',
					minWidth: '',
					maxWidth: '',
					height: '',
					position: '',
					top: '',
					left: '',
					right: '',
					bottom: ''
				});
				if ( sub != 'fixed' ){
					var rsz_col = $me.data('resize-col');
					model.set_property('col', rsz_col);
				}
				else {
					var rsz_width = $me.data('resize-width'),
						rsz_height = $me.data('resize-height'),
						rsz_col = Math.floor(rsz_width/ed.col_size);
					if ( ( axis == 'nw' || axis == 'ne' ) && fixed_pos.is_top )
						model.set_property('top', fixed_pos.top + fixed_pos.height - rsz_height);
					if ( ( axis == 'se' || axis == 'sw' ) && !fixed_pos.is_top && fixed_pos.is_bottom )
						model.set_property('bottom', fixed_pos.bottom + fixed_pos.height - rsz_height);
					if ( ( axis == 'nw' || axis == 'sw') && fixed_pos.is_left )
						model.set_property('left', fixed_pos.left + fixed_pos.width - rsz_width);
					if ( ( axis == 'se' || axis == 'ne' ) && !fixed_pos.is_left && fixed_pos.is_right )
						model.set_property('right', fixed_pos.right + fixed_pos.width - rsz_width);
					model.set_property('width', rsz_width, true);
					model.set_property('height', rsz_height, true);
					model.set_property('col', rsz_col, true);
					model.get('properties').trigger('change');
				}
				Upfront.Events.trigger("entity:region:resize_stop", view, view.model);
			}
		});
	},

	create_region_draggable: function(view, model) {
		if ( !model.get("container") || model.get("container") == model.get("name") )
			return;
		var app = this,
			ed = Upfront.Behaviors.GridEditor,
			$me = view.$el,
			$main = $(Upfront.Settings.LayoutEditor.Selectors.main),
			$layout = $main.find('.upfront-layout'),
			sub = model.get('sub'),
			fixed_pos = {},
			get_fixed_pos = function () {
				var pos = {
						top: model.get_property_value_by_name('top'),
						left: model.get_property_value_by_name('left'),
						bottom: model.get_property_value_by_name('bottom'),
						right: model.get_property_value_by_name('right'),
						width: model.get_property_value_by_name('width'),
						height: model.get_property_value_by_name('height')
					};
				pos.is_top = ( typeof pos.top == 'number' );
				pos.is_left = ( typeof pos.left == 'number' );
				pos.is_bottom = ( typeof pos.bottom == 'number' );
				pos.is_right = ( typeof pos.right == 'number' );
				return pos;
			},
			move = {}
		;
		if ( sub != 'fixed' )
			return false;
		if ( $me.data('ui-draggable') )
			return false;
		$me.draggable({
			disabled: true,
			revert: true,
			revertDuration: 0,
			zIndex: 100,
			helper: 'clone',
			delay: 15,
			scroll: false,
			start: function (e, ui) {
				var $helper = ui.helper,
					width = $me.width(),
					height = $me.height();
				$helper.css('width', width);
				$helper.css('height', height);
				$me.hide();
				fixed_pos = get_fixed_pos();
			},
			drag: function (e, ui) {
				var $helper = ui.helper,
					main_offset = $main.offset(),
					main_width = $main.width(),
					win_height = $(window).height(),
					main_x = (main_width/2) + main_offset.left,
					main_y = win_height/2,
					left = ui.position.left,
					top = ui.position.top,
					width = $helper.width(),
					height = $helper.height(),
					x = (width/2) + left,
					y = (height/2) + top,
					limit_top = limit_left = helper_top = helper_left = false;
				// reset move variable
				move = {};
				if ( /*fixed_pos.is_top*/ y <= main_y ){
					limit_top = 0;
					helper_top = top < limit_top ? limit_top : top;
					move.top = helper_top - limit_top;
				}
				else /*if ( fixed_pos.is_bottom )*/{
					limit_top = win_height - height;
					helper_top = top > limit_top ? limit_top : top;
					move.bottom = limit_top - helper_top;
				}
				if ( /*fixed_pos.is_left*/ x <= main_x ){
					limit_left = main_offset.left;
					helper_left = left < limit_left ? limit_left : left;
					move.left = helper_left - limit_left;
				}
				else /*if ( fixed_pos.is_right )*/{
					limit_left = main_width - width + main_offset.left;
					helper_left = left > limit_left ? limit_left : left;
					move.right = limit_left - helper_left;
				}
				view.update_position_hint(move, $helper);
				ui.position.top = helper_top;
				ui.position.left = helper_left;
			},
			stop: function (e, ui) {
				$me.show();
				if ( typeof move.top == 'number' ){
					model.set_property('top', move.top, true);
					model.remove_property('bottom', true);
				}
				else if ( typeof move.bottom == 'number' ){
					model.set_property('bottom', move.bottom, true);
					model.remove_property('top', true);
				}
				if ( typeof move.left == 'number' ){
					model.set_property('left', move.left, true);
					model.remove_property('right', true);
				}
				else if ( typeof move.right == 'number' ){
					model.set_property('right', move.right, true);
					model.remove_property('left', true);
				}
				model.get('properties').trigger('change');
			}
		});
	},


	/**
	 * Create region resizable
	 *
	 * @param {Object} view
	 * @param {Object} model
	 */
	create_region_container_resizable: function(view, model){
		var app = this,
			ed = Upfront.Behaviors.GridEditor,
			$me = view.$el,
			$main = $(Upfront.Settings.LayoutEditor.Selectors.main),
			$layout = $main.find('.upfront-layout')
		;
		if ( $me.data('ui-resizable') )
			return false;
		$me.append('<div class="upfront-icon-control-region upfront-icon-control-region-resize upfront-icon-control-region-resize-s upfront-region-resize-handle upfront-region-resize-handle-s ui-resizable-handle ui-resizable-s"></div>');
		$me.resizable({
			containment: "document",
			//handles: "n, e, s, w",
			handles: {
				s: '.upfront-region-resize-handle-s'
			},
			helper: "region-resizable-helper",
			disabled: true,
			zIndex: 9999999,
			start: function(e, ui){
				Upfront.Events.trigger("entity:region_container:resize_start", view, view.model);
				// Disable region changing
				Upfront.Events.trigger('command:region:edit_toggle', false);

				// Prevents quick scroll when resizing
				ed.resizing = window.scrollY;
			},
			resize: function(e, ui){
				// @TODO Suppppperrrr annoying bug happen on resizable 1.10.3, fix only for this version and make sure to recheck in future update on this lib!
				// Normalize the ui.size
				/*var that = $(this).data('ui-resizable'),
					woset = Math.abs( that.offset.left ) + that.sizeDiff.width,
					isParent = that.containerElement.get(0) === that.element.parent().get(0),
					isOffsetRelative = /relative|absolute/.test(that.containerElement.css("position"));
					if(isParent && isOffsetRelative) {
						woset -= that.parentData.left;
					};
					if ( woset + that.size.width >= that.parentData.width )
						ui.size.width += that.parentData.left;*/
				// End this fix
				var $helper = ui.helper,
					h = ( (ui.size.height > 15 ? ui.size.height : 0) || ui.originalSize.height ),
					rsz_row = Math.ceil(h/ed.baseline)
				;
				if ( Math.abs($(window).height()-e.clientY) < 50 ){
					h += (ed.baseline*10);
					$(window).scrollTop( $(window).scrollTop()+(ed.baseline*10) );
				}
				$helper.css({
					width: '100%',
					height: h
				});
				$me.data('resize-row', rsz_row);
			},
			stop: function(e, ui){
				var rsz_row = $me.data('resize-row');

				// Make sure CSS is reset, to fix bug when it keeps all resize CSS for some reason
				$me.css({
					width: '',
					minHeight: '',
					height: '',
					maxHeight: '',
					position: '',
					top: '',
					left: ''
				});
				model.set_property('row', rsz_row);
				Upfront.Events.trigger("entity:region_container:resize_stop", view, view.model);
				// Re-enable region changing
				Upfront.Events.trigger('command:region:edit_toggle', true);


				// Prevents quick scroll when resizing
				ed.resizing = false;
			}
		});
	},

	/**
	 * Toggle region resizable
	 *
	 */
	toggle_region_resizable: function(enable){
		var $main = $(Upfront.Settings.LayoutEditor.Selectors.main),
			$regions;
		if ( enable ) {
			if ( $main.hasClass('upfront-region-fixed-editing') )
				$regions = $('.upfront-region-side-fixed');
			else
				$regions = $('.upfront-region-side-left, .upfront-region-side-right, .upfront-region-container-wide, .upfront-region-container-clip');
			$regions.each(function(){
				if ( $(this).data('ui-resizable') )
					$(this).resizable('option', 'disabled', false);
			});
		}
		else {
			$('.upfront-region, .upfront-region-container').each(function(){
				if ( $(this).data('ui-resizable') )
					$(this).resizable('option', 'disabled', true);
			});
		}
	},

	/**
	 * Toggle region draggable
	 *
	 */
	toggle_region_draggable: function(enable){
		var $main = $(Upfront.Settings.LayoutEditor.Selectors.main),
			$regions;
		if ( enable ) {
			if ( $main.hasClass('upfront-region-fixed-editing') )
				$regions = $('.upfront-region-side-fixed');
			else
				$regions = $('.upfront-region-side-left, .upfront-region-side-right, .upfront-region-container-wide, .upfront-region-container-clip');
			$regions.each(function(){
				if ( $(this).data('ui-draggable') )
					$(this).draggable('option', 'disabled', false);
			});
		}
		else {
			$('.upfront-region, .upfront-region-container').each(function(){
				if ( $(this).data('ui-draggable') )
					$(this).draggable('option', 'disabled', true);
			});
		}
	},

	/**
	 * Edit structure/grid
	 */
	edit_structure: function () {
		var ed = Upfront.Behaviors.GridEditor,
			app = Upfront.Application,
			grid = Upfront.Settings.LayoutEditor.Grid,
			$grid_wrap = $('<div class="upfront-edit-grid-wrap clearfix" />'),
			$recommended = $('<div class="upfront-edit-grid upfront-edit-grid-recommended" />'),
			$custom = $('<div class="upfront-edit-grid upfront-edit-grid-custom" />'),
			$color_wrap = $('<div class="upfront-edit-page-color" />'),
			$grid_width = $('<div class="upfront-grid-width-preview">Grid width: <span class="upfront-grid-width" /></div>'),
			$grid_width2 = $('<div class="upfront-grid-width-preview">( Grid width: <span class="upfront-grid-width" /> )</div>'),
			is_grid_custom = ( grid.column_width != grid.column_widths[grid.size_name] || grid.type_padding != grid.type_paddings[grid.size_name] || grid.baseline != grid.baselines[grid.size_name] || !(/^(0|5|10|15)$/.test(grid.column_padding)) ),
			update_grid_data = function() {
				var custom = fields.grid.get_value() == 'custom',
					new_grid = {
						column_width: custom ? fields.custom_width.get_value() : grid.column_widths[grid.size_name],
						column_padding: custom ? fields.custom_padding.get_value() : fields.recommended_padding.get_value(),
						baseline: custom ? fields.custom_baseline.get_value() : grid.baselines[grid.size_name],
						type_padding: custom ? fields.custom_type_padding.get_value() : grid.type_paddings[grid.size_name]
					},
					width = new_grid.column_width * grid.size;
				$grid_width.find('.upfront-grid-width').text(width + 'px');
				$grid_width2.find('.upfront-grid-width').text(width + 'px');
				ed.update_grid(new_grid);
			},
			togglegrid = new Upfront.Views.Editor.Command_ToggleGrid(),
			fields = {
				structure: new Upfront.Views.Editor.Field.Radios({
					label: "Structure",
					layout: "vertical",
					default_value: app.layout.get('layout_slug') || "blank",
					icon_class: 'upfront-structure-field-icon',
					values: [
						{label: "", value: "blank", icon: "blank"},
						{label: "", value: "wide", icon: "wide-no-sidebar"},
						{label: "", value: "wide-right-sidebar", icon: "wide-right-sidebar"},
						{label: "", value: "wide-left-sidebar", icon: "wide-left-sidebar"},
						{label: "", value: "clip", icon: "clip-no-sidebar"},
						{label: "", value: "clip-right-sidebar", icon: "clip-right-sidebar"},
						{label: "", value: "clip-left-sidebar", icon: "clip-left-sidebar"},
						{label: "", value: "full", icon: "full"},
						{label: "", value: "full-extended", icon: "full-extended"},
					],
					change: function(){
						if ( _upfront_new_theme ){
							var structure = fields.structure.get_value(),
								layout_slug = app.layout.get('layout_slug');
							if ( (layout_slug && layout_slug != structure) || ( !layout_slug && structure != 'blank' ) ){
								app.layout.set('layout_slug', structure);
								if ( Upfront.Application.get_gridstate() )
									togglegrid.on_click();
								app.load_layout(_upfront_post_data.layout, {layout_slug: structure});
								Upfront.Events.once("layout:render", function(){
									if ( !Upfront.Application.get_gridstate() )
										togglegrid.on_click();
								});
							}
						}
					}
				}),
				grid: new Upfront.Views.Editor.Field.Radios({
					label: "Grid Settings",
					layout: "horizontal-inline",
					default_value: is_grid_custom ? "custom" : "recommended",
					values: [
						{label: "Recommended Settings", value: "recommended"},
						{label: "Custom Settings", value: "custom"}
					],
					change: function () {
						var value = this.get_value();
						if ( value == 'custom' ){
							$custom.show();
							$recommended.hide();
						}
						else {
							$recommended.show();
							$custom.hide();
						}
						update_grid_data();
					}
				}),
				recommended_padding: new Upfront.Views.Editor.Field.Select({
					default_value: grid.column_padding,
					values: [
						{label: "15px column padding", value: "15"},
						{label: "10px column padding", value: "10"},
						{label: "5px column padding", value: "5"},
						{label: "no column padding", value: "0"}
					],
					change: update_grid_data
				}),
				bg_color: new Upfront.Views.Editor.Field.Color({
					model: app.layout,
					label: "Page Background Color",
					label_style: "inline",
					property: 'background_color',
					spectrum: {
						move: function (color) {
							var rgb = color.toRgb(),
							rgba_string = 'rgba('+rgb.r+','+rgb.g+','+rgb.b+','+color.alpha+')';
							app.layout.set_property('background_color', rgba_string);
						}
					}
				}),
				custom_width: new Upfront.Views.Editor.Field.Number({
					label: "Column Width",
					label_style: "inline",
					min: 40,
					max: 100,
					default_value: grid.column_width,
					change: update_grid_data
				}),
				custom_padding: new Upfront.Views.Editor.Field.Number({
					label: "Column Padding",
					label_style: "inline",
					min: 0,
					max: 100,
					default_value: grid.column_padding,
					change: update_grid_data
				}),
				custom_baseline: new Upfront.Views.Editor.Field.Number({
					label: "Baseline Grid",
					label_style: "inline",
					min: 5,
					max: 100,
					default_value: grid.baseline,
					change: update_grid_data
				}),
				custom_type_padding: new Upfront.Views.Editor.Field.Number({
					label: "Additional Type Padding",
					label_style: "inline",
					min: 0,
					max: 100,
					default_value: grid.type_padding,
					change: update_grid_data
				}),
				floated: new Upfront.Views.Editor.Field.Checkboxes({
					multiple: false,
					default_value: true,
					values: [
						{label: "Allow floated areas outside main grid", value: true}
					]
				})
			};

		if ( !ed.structure_modal ){
			ed.structure_modal = new Upfront.Views.Editor.Modal({to: $('body'), button: true, top: 120, width: 540});
			ed.structure_modal.render();
			$('body').append(ed.structure_modal.el);
		}
		// Toggle grid on
		if ( !Upfront.Application.get_gridstate() )
			togglegrid.on_click();

		ed.structure_modal.open(function($content, $modal){
			$modal.addClass('upfront-structure-modal');
			_.each(fields, function(field){
				field.render();
				field.delegateEvents();
			});
			$content.html('');
			if ( _upfront_new_theme ){
				$content.append(fields.structure.el);
			}
			$content.append(fields.grid.el);
			$recommended.append(fields.recommended_padding.el);
			$recommended.append($grid_width);
			$grid_wrap.append($recommended);
			$custom.append(fields.custom_width.el);
			$custom.append($grid_width2);
			$custom.append(fields.custom_padding.el);
			$custom.append(fields.custom_baseline.el);
			$custom.append(fields.custom_type_padding.el);
			$color_wrap.append(fields.bg_color.el);
			$grid_wrap.append($custom);
			$grid_wrap.append($color_wrap);
			$content.append($grid_wrap);
			$content.append(fields.floated.el);
			fields.grid.trigger('changed');
		}, ed)
		.always(function(){
			if ( Upfront.Application.get_gridstate() )
				togglegrid.on_click();
		});
	},

	/**
	 * Update grid value and appearance
	 */
	update_grid: function (grid_data) {
		var app = Upfront.Application,
			styles = [],
			grid = Upfront.Settings.LayoutEditor.Grid,
			selector = '#page.' + grid.size_name,
			options = app.layout.get_property_value_by_name('grid') || {
				column_widths: {},
				column_paddings: {},
				baselines: {},
				type_paddings: {}
			};
		if ( grid_data.column_width ){
			styles.push(selector + ' .upfront-grid-layout { width: ' + grid_data.column_width*grid.size + 'px; }');
			options.column_widths[grid.size_name] = grid_data.column_width;
		}
		if ( grid_data.column_padding ){
			styles.push(selector + ' .upfront-object { padding: ' + grid_data.column_padding + 'px; }');
			options.column_paddings[grid.size_name] = grid_data.column_padding;
		}
		if ( grid_data.baseline ){
			styles.push(selector + ' .upfront-overlay-grid {background-size: 100% ' + grid_data.baseline + 'px; }');
			if ( grid_data.baseline != grid.baseline ){
				// to prevent css loading at every change, we timeout to 1000ms before decide to load it
				clearTimeout(this._load_editor_css);
				this._load_editor_css = setTimeout(function(){
					Upfront.Util.post({
						action: 'upfront_load_editor_grid',
						baseline: grid_data.baseline
					}, 'text').success(function(data){
						if ( $('#upfront-editor-grid-inline').length )
							$('#upfront-editor-grid-inline').html( data );
						else
							$('head').append('<style id="upfront-editor-grid-inline">' + data + '</style>'); // add it to head to prevent it override other custom CSS below
					});
				}, 1000);
			}
			options.baselines[grid.size_name] = grid_data.baseline;
		}
		if ( grid_data.type_padding ){
			styles.push(selector + ' .plaintxt_padding {padding: ' + grid_data.type_padding + 'px; }');
			options.type_paddings[grid.size_name] = grid_data.type_padding;
		}
		if ( $('#upfront-grid-style-inline').length )
			$('#upfront-grid-style-inline').html( styles.join("\n") );
		else
			$('body').append('<style id="upfront-grid-style-inline">' + styles.join("\n") + '</style>');
		Upfront.Settings.LayoutEditor.Grid = _.extend(grid, grid_data);
		app.layout.set_property('grid', options);
		this.init(); // re-init to update grid values
	},


	/**
	 * Apply saved grid in layout
	 */
	apply_grid: function () {
		var ed = Upfront.Behaviors.GridEditor,
			app = Upfront.Application,
			grid = Upfront.Settings.LayoutEditor.Grid,
			options = app.layout.get_property_value_by_name('grid');
		if ( !options || !options.column_widths || !options.column_widths[grid.size_name] )
			return;
		return ed.update_grid({
			column_width: options.column_widths[grid.size_name],
			column_padding: options.column_paddings[grid.size_name],
			baseline: options.baselines[grid.size_name],
			type_padding: options.type_paddings[grid.size_name]
		});
	},

	/**
	 * Debug stuff
	 */
	time_start: function (id) {
		if ( this.show_debug_element )
			console.time(id);
	},
	time_end: function (id) {
		if ( this.show_debug_element )
			console.timeEnd(id);
	},
	set_timeout: function(timeout){
		this.timeout = timeout;
	},
	set_compare_size: function(col, row){
		this.compare_col = col;
		this.compare_row = row;
	},
	toggle_debug: function(){
		this.show_debug_element = !this.show_debug_element;
		if ( this.show_debug_element )
			this.render_debug();
		else
			this.delete_debug();
	},
	render_debug: function () {
		var me = this,
			$main = $(Upfront.Settings.LayoutEditor.Selectors.main);
			$modal = $('<div id="behavior-debug" class="upfront-inline-modal"></div>'),
			$wrap = $('<div class="upfront-inline-modal-wrap"></div>'),
			field_delay = new Upfront.Views.Editor.Field.Number({
				name: 'delay',
				label: 'Delay before drag:',
				label_style: 'inline',
				min: 0,
				max: 2000,
				step: 1,
				default_value: 300,
				change: function () {
					$('.upfront-module.ui-draggable, .upfront-module-group.ui-draggable').draggable('option', 'delay', this.get_value());
				}
			}),
			field_timeout = new Upfront.Views.Editor.Field.Number({
				name: 'timeout',
				label: 'Delay before changing position:',
				label_style: 'inline',
				min: 0,
				max: 2000,
				step: 1,
				default_value: 66,
				change: function () {
					me.timeout = parseInt(this.get_value());
				}
			}),
			field_debug = new Upfront.Views.Editor.Field.Checkboxes({
				name: 'debug',
				multiple: false,
				default_value: true,
				values: [
					{ label: "Show debugging info/outline", value: true }
				],
				change: function () {
					me.show_debug_element = this.get_value() ? true : false;
				}
			}),
			$close = $('<a href="#" class="upfront-close-debug">Close</a>');
		$main.addClass('show-debug');
		field_delay.render();
		$wrap.append(field_delay.$el);
		field_timeout.render();
		$wrap.append(field_timeout.$el);
		field_debug.render();
		$wrap.append(field_debug.$el);
		$wrap.append($close);
		$modal.append($wrap);
		$('body').append($modal);
		$modal.css({
			top: 'auto',
			left: 'auto',
			bottom: 0,
			right: 0,
			position: 'fixed'
		});
		$wrap.css({
			width: 360,
			top: 0,
			padding: '10px'
		});
		$close.on('click', function () {
			me.show_debug_element = false;
			me.delete_debug();
		});
	},
	delete_debug: function () {
		var $main = $(Upfront.Settings.LayoutEditor.Selectors.main);
		$main.removeClass('show-debug');
		$('#behavior-debug').remove();
	}

};

define({
	"Behaviors": {
		"LayoutEditor": LayoutEditor,
		"GridEditor": GridEditor
	}
});
})(jQuery);
//@ sourceURL=upfront-behavior.js
