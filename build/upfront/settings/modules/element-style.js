define(["scripts/upfront/settings/modules/base-module"],function(e){var t=Upfront.Settings.l10n.preset_manager,n=e.extend({className:"upfront-settings-item-anchor",initialize:function(e){this.options=e;var t=this,n=new Upfront.Views.Editor.Field.Text({model:this.model,property:"theme_style",label:"Element style:"}),r=new Upfront.Views.Editor.Field.Button({label:"Show style",compact:!0,on_click:function(){t.openCssEditor()},display:"inline"}),i=new Upfront.Views.Editor.Field.Button({label:"Remove style",compact:!0,on_click:function(){t.removeStyle()},display:"inline"});this.listenTo(n,"rendered",function(){n.$el.find("input").attr("readonly","readonly")}),this.fields=_([n,r,i]),this.on("panel:set",function(){t.fields.each(function(e){e.panel=t.panel,e.trigger("panel:set")})})},openCssEditor:function(){var e=this.model.get_property_value_by_name("theme_style");Upfront.Application.cssEditor.init({model:this.model,stylename:e,sidebar:!1,toolbar:!1,readOnly:!0})},removeStyle:function(){this.$el.find("input[type=text]").val(""),this.$el.hide(),this.model.set_property("theme_style","")}});return n});