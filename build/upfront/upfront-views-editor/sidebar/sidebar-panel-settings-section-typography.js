!function(t){var e=Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.views:Upfront.mainData.l10n.global.views;define(["scripts/upfront/upfront-views-editor/sidebar/sidebar-panel-settings-section","scripts/upfront/upfront-views-editor/sidebar/sidebar-panel-settings-item-typography-editor","scripts/upfront/upfront-views-editor/commands/command-edit-custom-css"],function(n,s,i){return n.extend({initialize:function(){this.settings=_([new s({model:this.model})]),this.edit_css=new i({model:this.model}),this.listenTo(Upfront.Events,"entity:breakpoint:change",this.update_buttons_position)},get_title:function(){return e.typography},on_render:function(){this.$el.find(".panel-section-content").addClass("typography-section-content"),this.edit_css.render(),this.edit_css.delegateEvents(),this.$el.find(".panel-section-content").append(this.edit_css.el),Upfront.plugins.call("insert-command-after-typography-commands",{rootEl:this.$el,model:this.model});var t=this;Upfront.Events.on("color:spectrum:show",function(){t.$el.closest(".sidebar-panel-content.ps-theme-default").css("position","static"),t.$el.closest(".sidebar-panel-settings").css("position","relative")}),Upfront.Events.on("color:spectrum:hide",function(){t.$el.closest(".sidebar-panel-content.ps-theme-default").css("position","relative"),t.$el.closest(".sidebar-panel-settings").css("position","static")}),this.$el.find(".open-theme-fonts-manager").after(this.$el.find(".command-edit-css")),this.$el.find(".command-edit-css").before(this.$el.find(".command-open-font-manager"))},update_buttons_position:function(){t(".open-theme-fonts-manager").after(t(".command-edit-css")),t(".command-edit-css").before(t(".command-open-font-manager"))}})})}(jQuery);