!function(e){Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.views:Upfront.mainData.l10n.global.views;define(["scripts/upfront/upfront-views-editor/sidebar/sidebar-panel-post-editor","scripts/upfront/upfront-views-editor/sidebar/sidebar-panel-posts","scripts/upfront/upfront-views-editor/sidebar/sidebar-panel-draggable-elements","scripts/upfront/upfront-views-editor/sidebar/sidebar-panel-settings"],function(t,i,n,s){return Backbone.View.extend({tagName:"ul",className:"sidebar-panels",initialize:function(){this.init_modules(),this.listenTo(Upfront.Events,"click:edit:navigate",this.init_modules)},init_modules:function(o){this.panels={};var p=Upfront.Application.is_plugin_layout(o);p&&p.killPostSettings?this.panels.post_editor=new t({message:p.killPostSettings}):this.panels.post_editor=new t({model:this.model}),this.panels.posts=new i({model:this.model}),this.panels.elements=new n({model:this.model}),this.panels.settings=new s({model:this.model}),"undefined"!=typeof o?o===!1&&(this.panels=_.omit(this.panels,"post_editor")):"undefined"!=typeof _upfront_post_data.post_id&&_upfront_post_data.post_id!==!1||(this.panels=_.omit(this.panels,"post_editor")),e("#upfront-inline-tooltip").hide(),Upfront.Application.remove_plugin_body_classes(),p&&p.bodyclass&&e("body").addClass(p.bodyclass)},render:function(){var e=this;e.$el.empty(),_.each(this.panels,function(t,i){t.remove(),t=e.panels[i],"post_editor"===i&&t.initialize(),t.render(),"undefined"!=typeof t.global_option&&t.global_option?Upfront.Settings.Application.PERMS.OPTIONS&&e.$el.append(t.el):Upfront.Application.user_can_save_content()&&"post_editor"===i?e.$el.append(t.el):Upfront.Application.user_can_modify_layout()&&e.$el.append(t.el),t.delegateEvents()})}})})}(jQuery);