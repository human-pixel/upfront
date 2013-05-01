(function ($) {

var _template_files = [
	"text!upfront/templates/object.html",
	"text!upfront/templates/module.html",
	"text!upfront/templates/layout.html",
];

define(_template_files, function () {
	// Auto-assign the template contents to internal variable
	var _template_args = arguments,
		_Upfront_Templates = {}
	;
	_(_template_files).each(function (file, idx) {
		_Upfront_Templates[file.replace(/text!upfront\/templates\//, '').replace(/\.html/, '')] = _template_args[idx];
	});

	var
		_dispatcher = _.clone(Backbone.Events),

		_Upfront_ViewMixin = {
			"dispatcher": _dispatcher
		},

	/* ----- Core View Mixins ----- */

		FixedObject_Mixin = {
			activate_condition: function () {
				return false;
			}
		},

		FixedObjectInAnonymousModule_Mixin = {
			activate_condition: function () {
				var parent_view = this.parent_module_view,
					parent_model = parent_view && parent_view.model ? parent_view.model : false
				;
				if (!parent_model) return true; // Something went wrong, assume we're not in anonymos module
				return !!parent_model.get("name").length; // Anonymous parent check
			}
		},

	/* ----- Core views ----- */

		_Upfront_SingularEditor = Backbone.View.extend(_.extend({}, _Upfront_ViewMixin, {
			initialize: function () {
				this.model.bind("change", this.render, this);
				if (this.init) this.init();
			}
		})),

		_Upfront_EditableEntity = _Upfront_SingularEditor.extend({
			/*events: {
				"click .upfront-entity_meta a": "on_settings_click",
				"click .upfront-entity_meta": "on_meta_click",
				"click": "on_click",
			},*/
			// Propagate collection sorting event
			resort_bound_collection: function () {
				this.$el.trigger("resort", [this]);
			},
			get_settings: function () {
				return '';
			},
			on_click: function () {
				this.activate();
				return false;
			},
			deactivate: function () {
				this.$el.removeClass("upfront-active_entity");
				this.trigger("upfront:entity:deactivate", this);
			},
			activate: function () {
				if (this.activate_condition && !this.activate_condition()) return false;
				$(".upfront-active_entity").removeClass("upfront-active_entity");
				this.$el.addClass("upfront-active_entity");
				this.trigger("upfront:entity:activate", this);
				//return false;
			},
			// Stub handlers
			on_meta_click: function () {},
			on_delete_click: function () {
				this.$el.trigger("upfront:entity:remove", [this]);
				return false; // Stop propagation in order not to cause error with missing sortables etc
			},
			on_settings_click: function () {
				Upfront.Events.trigger("entity:settings:activate", this);
			}
		}),

		_Upfront_EditableContentEntity = _Upfront_EditableEntity.extend({
			events: {
				"click": "on_click",
				"dblclick": "on_edit"
			},
			on_edit: function () {
				Upfront.Util.log("Implement editor");
				return false;
			}

		})

		_Upfront_PluralEditor = Backbone.View.extend(_.extend({}, _Upfront_ViewMixin, {
			initialize: function () {
				this.model.bind("change", this.render, this);
				this.model.bind("add", this.render, this);
				this.model.bind("remove", this.render, this);

				if (this.init) this.init();
			}
		})),

		_Upfront_EditableEntities = _Upfront_PluralEditor.extend({
			"events": {
				"resort": "on_resort_collection",
				"upfront:entity:remove": "on_entity_remove"
			},

			on_resort_collection: function () {
				var models = [],
					collection = this.model
				;
				this.$el.find(".upfront-editable_entity").each(function () {
					var element_id = $(this).attr("id"),
						model = collection.get_by_element_id(element_id)
					;
					model && models.push(model);
				});
				this.model.reset(models);
				return false; // Don't bubble up
			},

			on_entity_remove: function (e,view) {
				var wrapper_id = view.model.get_wrapper_id();
				if ( wrapper_id ){
					var wrappers = Upfront.Application ? Upfront.Application.LayoutEditor.layout.get('wrappers') : false,
						wrapper = wrappers.get_by_wrapper_id(wrapper_id);
					if ( wrapper )
						wrappers.remove(wrapper);
				}
				view.remove();
				this.model.remove(view.model);
			}
		}),

		ObjectView = _Upfront_EditableContentEntity.extend({
			events: {
				"click .upfront-entity_meta a.upfront-entity-settings_trigger": "on_settings_click",
				"click .upfront-entity_meta a.upfront-entity-delete_trigger": "on_delete_click",
				"click .upfront-entity_meta": "on_meta_click",
				"click": "on_click",
				"dblclick": "on_edit"
			},
			initialize: function () {
				this.model.get("properties").bind("change", this.render, this);
				this.model.get("properties").bind("add", this.render, this);
				this.model.get("properties").bind("remove", this.render, this);
			},
			render: function () {
				var props = {},
					run = this.model.get("properties").each(function (prop) {
						props[prop.get("name")] = prop.get("value");
					}),
					height = ( props.row ) ? props.row * Upfront.Settings.LayoutEditor.Grid.baseline : 0,
					content = (this.get_content_markup ? this.get_content_markup() : ''),
					model = _.extend(this.model.toJSON(), {"properties": props, "content": content, "height": height}),
					template = _.template(_Upfront_Templates["object"], model)
				;
				Upfront.Events.trigger("entity:object:before_render", this, this.model);
				this.$el.html(template);
				// render subview if it exists
				if(typeof this.subview != 'undefined'){
					this.subview.setElement(this.$('.upfront-object-content')).render();
				}

				Upfront.Events.trigger("entity:object:after_render", this, this.model);
				//if (this.$el.is(".upfront-active_entity")) this.$el.trigger("upfront-editable_entity-selected", [this.model, this]);
				if ( this.on_render ) this.on_render();
			}
		}),

		Objects = _Upfront_EditableEntities.extend({
			"attributes": {
				"class": "upfront-editable_entities_container"
			},

			render: function () {
				var $el = this.$el,
					me = this
				;
				$el.html('');
				this.model.each(function (obj) {
					var view_class_prop = obj.get("properties").where({"name": "view_class"}),
						view_class = view_class_prop.length ? view_class_prop[0].get("value") : "ObjectView",
						local_view = new Upfront.Views[view_class]({model: obj})
					;
					local_view.parent_view = me;
					local_view.parent_module_view = me.parent_view;
					local_view.render();
					$el.append(local_view.el);
					local_view.bind("upfront:entity:activate", me.on_activate, me);
					local_view.model.bind("remove", me.deactivate, me);
				});
			},
			on_activate: function (view) {
				this.model.active_entity = view.model;
				Upfront.Events.trigger("entity:activated", view, view.model);
			},
			deactivate: function (removed) {
				if (removed == this.model.active_entity) this.model.active_entity = false;
				Upfront.Events.trigger("entity:deactivated", removed);
			}
		}),

		Module = _Upfront_EditableEntity.extend({
			events: {
				"click .upfront-entity_meta a.upfront-entity-settings_trigger": "on_settings_click",
				"click .upfront-entity_meta a.upfront-entity-delete_trigger": "on_delete_click",
				"click .upfront-entity_meta": "on_meta_click",
				"click": "on_click",
			},
			initialize: function () {
				var callback = this.update || this.render;
				this.model.get("properties").bind("change", callback, this);
				this.model.get("properties").bind("add", callback, this);
				this.model.get("properties").bind("remove", callback, this);

				if (this.on_resize) {
					this.on("upfront:entity:resize", this.on_resize, this);
				}
			},
			render: function () {
				var props = {},
					run = this.model.get("properties").each(function (prop) {
						props[prop.get("name")] = prop.get("value");
					}),
					height = ( props.row ) ? props.row * Upfront.Settings.LayoutEditor.Grid.baseline : 0,
					model = _.extend(this.model.toJSON(), {"properties": props, "height": height}),
					template = _.template(_Upfront_Templates["module"], model)
				;
				Upfront.Events.trigger("entity:module:before_render", this, this.model);
					
				this.$el.html(template);
				
				if ( this.model.get("shadow") )
					this.$el.find('.upfront-editable_entity:first').attr("data-shadow", this.model.get("shadow"));
				
				var objects_view = new Objects({"model": this.model.get("objects")});
				objects_view.parent_view = this;
				objects_view.render();
				this.$(".upfront-objects_container").append(objects_view.el);

				if (this.$el.is(".upfront-active_entity")) this.$el.trigger("upfront-editable_entity-selected", [this.model, this]);
				Upfront.Events.trigger("entity:module:after_render", this, this.model);
			}
		}),

		Modules = _Upfront_EditableEntities.extend({
			"attributes": {
				"class": "upfront-editable_entities_container"
			},
			render: function () {
				this.$el.html('');
				var $el = this.$el,
					me = this,
					regions = Upfront.Application ? Upfront.Application.LayoutEditor.layout.get('regions') : false,
					wrappers, current_wrapper_id, current_wrapper_el
				;
				regions.each(function(region){
					if ( region.get('modules') == me.model )
						wrappers = region.get('wrappers');
				});
				//console.log(wrappers);
				this.model.each(function (module) {
					var view_class_prop = module.get("properties").where({"name": "view_class"}),
						view_class = view_class_prop.length ? view_class_prop[0].get("value") : "Module",
						//view_class = Upfront.Views[view_class] ? view_class : "Module",
						local_view = new Upfront.Views[view_class]({model: module}),
						wrapper_id = module.get_wrapper_id(),
						wrapper = wrapper_id ? wrappers.get_by_wrapper_id(wrapper_id) : false,
						wrapper_view, wrapper_el
					;
					if ( !wrapper ){
						local_view.render();
						$el.append(local_view.el);
					}
					else {
						if ( current_wrapper_id == wrapper_id ){
							wrapper_el = current_wrapper_el;
						}
						else {
							wrapper_view = new Upfront.Views.Wrapper({model: wrapper});
							wrapper_view.render();
							wrapper_el = wrapper_view.el;
						}
						current_wrapper_id = wrapper_id;
						current_wrapper_el = wrapper_el;
						local_view.render();
						$(wrapper_el).append(local_view.el);
						if ( wrapper_view )
							$el.append(wrapper_el);
					}
					local_view.bind("upfront:entity:activate", me.on_activate, me);
					local_view.model.bind("remove", me.deactivate, me);
				});
			},
			on_activate: function (view) {
				this.model.active_entity = view.model;
				Upfront.Events.trigger("entity:activated", view, view.model);
			},
			deactivate: function (removed) {
				if (removed == this.model.active_entity) this.model.active_entity = false;
				Upfront.Events.trigger("entity:deactivated", removed);
			}
		}),

		Region = _Upfront_SingularEditor.extend({
			events: {
				"mouseup": "on_click" // Bound on mouseup because "click" prevents bubbling (for module/object activation)
			},
			attributes: function(){
				var name = this.model.get("name");
				return {
					"class": 'upfront-region' + ( ' upfront-region-' + name.toLowerCase().replace(/ /, "-") )
				}
			},
			init: function () {
				this.dispatcher.on("plural:propagate_activation", this.on_click, this);
			},
			on_click: function () {
				this.trigger("activate_region", this)
			},
			render: function () {
				this.$el.data('name', this.model.get("name"));
				this.$el.attr('data-title', this.model.get("title"));
				this.$el.html('');
				var local_view = new Modules({"model": this.model.get("modules")})
				local_view.render();
				this.$el.append(local_view.el);
			}
		}),

		Regions = _Upfront_PluralEditor.extend({
			render: function () {
				this.$el.html('');
				var me = this,
					$el = this.$el
				;
				this.model.each(function (region, index) {
					var local_view = new Region({"model": region});
					local_view.render();
					local_view.bind("activate_region", me.activate_region, me);
					$el.append(local_view.el);
					if ( index == 0 )
						local_view.trigger("activate_region", local_view);
				});
				//this.activate_region(this.model.at(0));
			},
			activate_region: function (region) {
				this.model.active_region = region.model || region;
				if ( region.$el ){
					$('.upfront-region-active').removeClass('upfront-region-active');
					region.$el.addClass('upfront-region-active');
					Upfront.Events.trigger("region:activated", region);
				}
			}
		}),
		
		Wrapper = _Upfront_SingularEditor.extend({
			attributes: function(){
				var cls = "upfront-wrapper",
					model_cls = this.model.get_property_value_by_name('class');
				return {
					"class": cls + " " + model_cls,
					"id": this.model.get_wrapper_id()
				}
			},
			init: function () {
				this.model.get("properties").bind("change", this.update, this);
			},
			update: function () {
				this.$el.attr('class', this.attributes().class);
			},
			render: function () {
			}
		}),

		Layout = _Upfront_PluralEditor.extend({
			initialize: function () {
				this.render();
			},
			render: function () {
				var template = _.template(_Upfront_Templates.layout, this.model.toJSON());
				this.$el.html(template);
				var local_view = new Regions({"model": this.model.get("regions")});
				local_view.render();
				this.$("section").append(local_view.el);
			}
		})
	;

	return {
		"Views": {
			"ObjectView": ObjectView,
			"Module": Module,
			"Wrapper": Wrapper,
			"Layout": Layout
		},
		"Mixins": {
			"FixedObject": FixedObject_Mixin,
			"FixedObjectInAnonymousModule": FixedObjectInAnonymousModule_Mixin
		}
	};
});

})(jQuery);