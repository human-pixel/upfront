!function(t){var e=Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.views:Upfront.mainData.l10n.global.views;define(["scripts/upfront/upfront-views-editor/settings/settings-item","scripts/upfront/upfront-views-editor/settings/settings-panel","scripts/upfront/upfront-views-editor/settings/settings-item-tabbed","scripts/upfront/upfront-views-editor/settings/settings-anchor-trigger","scripts/upfront/upfront-views-editor/settings/settings-labeled-anchor-trigger","scripts/upfront/upfront-views-editor/settings/settings-lightbox-trigger","scripts/upfront/upfront-views-editor/settings/settings-labeled-lightbox-trigger"],function(s,i,n,o,r,l,f){var p=Backbone.View.extend({has_tabs:!0,initialize:function(t){this.options=t,this.panels=_([])},get_title:function(){return e.settings},render:function(){var e=this,s=e.for_view.$el.hasClass("upfront-editable_entity")?e.for_view.$el:e.for_view.$el.find(".upfront-editable_entity:first"),i=s.offset(),n=s.outerWidth(),o=i.left+n,r=(s.hasClass("upfront-object")?s.closest(".upfront-module"):s).find("> .upfront-element-controls .upfront-icon-region-settings"),l=r.offset(),f=(l.left+r.outerWidth(),t(Upfront.Settings.LayoutEditor.Selectors.main)),p=f.offset(),a=p.left+f.outerWidth();e.$el.empty().show().html('<div class="upfront-settings_title">'+this.get_title()+"</div>"),Upfront.Events.trigger("settings:prepare"),e.panels.each(function(t){t.render(),e.listenTo(t,"upfront:settings:panel:toggle",e.toggle_panel),e.listenTo(t,"upfront:settings:panel:close",e.close_panel),e.listenTo(t,"upfront:settings:panel:refresh",e.refresh_panel),t.parent_view=e,e.$el.append(t.el)}),this.toggle_panel(this.panels.first());var g=this.panels.first().$el.find(".upfront-settings_label").outerWidth(),h=this.panels.first().$el.find(".upfront-settings_panel").outerWidth();this.has_tabs||(g=0,this.$el.addClass("settings-no-tabs")),this.$el.css({position:"absolute","z-index":1e7}).offset({top:i.top,left:i.left+n-(o+g+h>a?g+h+(o-l.left)+5:0)}).addClass("upfront-ui"),this.trigger("open")},set_title:function(t){return t&&t.length?void this.$el.find(".upfront-settings_title").html(t):!1},toggle_panel:function(t){this.panels.invoke("conceal"),t.$el.find(".upfront-settings_panel").css("height",""),t.show(),t.reveal(),this.set_title(t.get_title());var e=0;this.panels.each(function(t){e+=t.$el.find(".upfront-settings_label").outerHeight()});var s=t.$el.find(".upfront-settings_panel").outerHeight()-1;s>=e?this.$el.css("height",s):(t.$el.find(".upfront-settings_panel").css("height",e),this.$el.css("height",e))},refresh_panel:function(t){t.is_active()&&this.toggle_panel(t)},close_panel:function(t){this.panels.invoke("conceal"),this.panels.invoke("show"),this.set_title(this.get_title())},remove:function(){this.panels&&this.panels.each(function(t){t.remove()}),Backbone.View.prototype.remove.call(this)}});return{Settings:p,Panel:i,Item:s,ItemTabbed:n,Lightbox:{Trigger:l,LabeledTrigger:f},Anchor:{Trigger:o,LabeledTrigger:r}}})}(jQuery);