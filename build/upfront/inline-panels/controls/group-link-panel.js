!function(t){define(["scripts/upfront/inline-panels/controls/link-panel","scripts/upfront/link-model"],function(i,n){var o=Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.views:Upfront.mainData.l10n.global.views,e=i.extend({className:"upfront-inline-panel-item group-link-control",initialize:function(t){var i=this;this.options=t||{},this.constructor.__super__.constructor.__super__.initialize.call(this,t),this.icon=this.options.icon,this.tooltip=this.options.tooltip,this.id=this.options.id,this.link=new n({type:this.options.linkType,url:this.options.linkUrl,target:this.options.linkTarget,object:this.options.linkObject,object_id:this.options.linkObjectId}),this.view=new Upfront.Views.Editor.LinkPanel({model:this.link,button:!1,title:o.link_group_to}),this.listenTo(this.link,"change change:target change:type",function(t){i.render_label(),this.trigger("change",{url:t.get("url"),target:t.get("target"),type:t.get("type")})})},onClickControl:function(i){this.$el.siblings(".upfront-control-dialog-open").removeClass("upfront-control-dialog-open"),t(i.target).closest(".inline-panel-control-dialog").length||(i.preventDefault(),this.isopen?this.close():this.open())}});return e})}(jQuery);