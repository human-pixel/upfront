define([
	'text!scripts/upfront/settings/modules/menu-structure/menu-item-editor.tpl'
], function(tpl) {
	var getAnchors = function() {
		var regions = Upfront.Application.layout.get("regions"),
			anchors = [],
			find;

		find = function (modules) {
			modules.each(function(module) {
				var group_anchor = module.get_property_value_by_name("anchor");
				if (group_anchor && group_anchor.length) {
					anchors.push({id: '#' + group_anchor, label: group_anchor});
				}
				if (module.get("objects")) {
					module.get("objects").each(function (object) {
						var anchor = object.get_property_value_by_name("anchor");
						if (anchor && anchor.length) {
							anchors.push({id: '#' + anchor, label: anchor});
						}
					});
				} else if ( module.get("modules") ) {
					find(module.get("modules"));
				}
			});
		};

		regions.each(function(r) {
			find(r.get("modules"));
		});

		return anchors;
	};

	var getPostTypes = function(){
		var types = [];

		_.each(Upfront.data.ugallery.postTypes, function(type){
			if(type.name != 'attachment') {
				types.push({name: type.name, label: type.label});
			}
		});

		return types;
	};

	var MenuItemEditor = Backbone.View.extend({
		className: 'menu-item-editor',

		events: {
			'click .menu-item-entry-input': 'showPagePostSelector'
		},

		initialize: function(options) {
			this.options = options || {};
			this.type = Upfront.Util.guessLinkType(this.model.get('menu-item-url'));
			if (this.type === 'unlink') this.type = 'external';
		},

		render: function() {
			console.log('rendering', this.type);
			this.$el.html(_.template(tpl, {
				title: this.model.get('menu-item-title'),
				type:  this.type,
				url: this.model.get('menu-item-url')
			}));

			this.renderTypeSelect();

			return this;
		},

		renderTypeSelect: function() {
			var me = this;

			var typeSelectValues = [];
			_.each(['external', 'entry', 'anchor', 'lightbox', 'email'], function(t) {
				typeSelectValues.push(this.getLinkTypeValue(t));
			}, this);

			this.typeSelect = new Upfront.Views.Editor.Field.Select({
				label: '',
				values: typeSelectValues,
				default_value: this.type || 'external',
				change: function (value) {
					me.onTypeChange(value);
				}
			});

			this.typeSelect.render();
			this.$el.find('.item-links-to-label').after(this.typeSelect.el);


			if (this.type === 'anchor') {
				this.renderAnchorSelect();
			}
		},


		/**
		 * Determine proper link type select value/label based on link type. Used
		 * to populate link type select field.
		 */
		getLinkTypeValue: function(type) {
			var contentL10n = Upfront.Settings.l10n.global.content;
			switch(type) {
				case 'unlink':
					return { value: 'unlink', label: contentL10n.no_link };
				case 'external':
					return { value: 'external', label: contentL10n.url };
				case 'email':
					return { value: 'email', label: 'Email address' };
				case 'entry':
					return { value: 'entry', label: contentL10n.post_or_page };
				case 'anchor':
					return { value: 'anchor', label: contentL10n.anchor };
				case 'image':
					return { value: 'image', label: contentL10n.larger_image };
				case 'lightbox':
					return { value: 'lightbox', label: contentL10n.lightbox };
			}
		},

		showPagePostSelector: function(event) {
			if (event) {
				event.preventDefault();
			}

			var me = this,
				selectorOptions = {
					postTypes: getPostTypes()
				};

			Upfront.Views.Editor.PostSelector.open(selectorOptions).done(
				function(post) {
					me.model.set({'menu-item-url' : post.get('permalink')});
					me.saveItem();
					me.render();
				}
			);
		},


		saveItem: function() {
			Upfront.Util.post({
				action: 'upfront_update_single_menu_item',
				menuId: this.options.menuId,
				menuItemData: this.model.toJSON()
			});
		},

		onTypeChange: function(value) {
			// First reset url property
			// We don't want funny results when changing from one type to another.
			this.model.set({'menu-item-url': ''});
			this.type = value;
			this.render();

			if (this.type === 'entry') {
				this.showPagePostSelector();
			}
		},

		renderAnchorSelect: function() {
			var me = this;

			var anchorValues = [{label: 'Choose Anchor...', value: ''}];
			_.each(getAnchors(), function(anchor) {
				anchorValues.push({label: anchor.label, value: anchor.id});
			});

			var anchorValue = this.model.get('menu-item-url');
			anchorValue = anchorValue ? anchorValue : '';
			anchorValue = anchorValue.match(/^#/) ? anchorValue : '';

			this.anchorSelect = new Upfront.Views.Editor.Field.Select({
				label: '',
				values: anchorValues,
				default_value: anchorValue,
				change: function () {
					me.model.set({'menu-item-url': this.get_value()});
					me.saveItem();
				}
			});
			this.anchorSelect.render();
			this.$el.find('.anchor-selector').append(this.anchorSelect.el);
		},
	});

	return MenuItemEditor;
});
