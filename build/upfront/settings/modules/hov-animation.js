define(["scripts/upfront/settings/modules/base-module"],function(e){var t=Upfront.Settings.l10n.preset_manager,i=e.extend({className:"settings_module hov_animation_settings_item clearfix",group:!1,initialize:function(e){this.options=e||{};var i=this,s=this.options.state,l="no-toggle";i.options.toggle===!0&&(l="element-toggled"),this.fields=_([new Upfront.Views.Editor.Field.Number({model:this.model,className:s+"-duration duration field-grid-half "+l,name:i.options.fields.duration,min:0,step:.1,label:"",change:function(e){i.model.set(i.options.fields.duration,e)}}),new Upfront.Views.Editor.Field.Select({model:this.model,name:i.options.fields.easing,step:.1,values:[{label:"ease",value:"ease"},{label:"linear",value:"linear"},{label:"ease-in",value:"ease-in"},{label:"ease-out",value:"ease-out"},{label:"ease-in-out",value:"ease-in-out"}],className:s+"-transition transition field-grid-half field-grid-half-last "+l,change:function(e){i.model.set(i.options.fields.easing,e)}})]),this.options.toggle===!0&&(this.group=!1,this.fields.unshift(new Upfront.Views.Editor.Field.Toggle({model:this.model,className:"useAnimation checkbox-title upfront-toggle-field",name:i.options.fields.use,label:"",default_value:1,multiple:!1,values:[{label:t.animate_hover_changes,value:"yes"}],change:function(e){i.model.set(i.options.fields.use,e)},show:function(e,t){var i=t.closest(".upfront-settings-item-content");"yes"==e?i.find("."+s+"-toggle-wrapper").show():i.find("."+s+"-toggle-wrapper").hide()}})))}});return i});