define(["scripts/upfront/settings/modules/base-module"],function(e){var o=Upfront.Settings.l10n.image_element,t=e.extend({className:"settings_module image-caption-location caption_location clearfix",group:!1,initialize:function(e){this.options=e||{};var t=this,i=this.options.state;this.options.toggle=!0,this.fields=_([new Upfront.Views.Editor.Field.Toggle({model:this.model,className:"useCaptions checkbox-title upfront-toggle-field",name:"use_captions",label:"",default_value:1,multiple:!1,values:[{label:o.settings.show_caption,value:"yes"}],change:function(e){t.model.set("use_captions",e)},show:function(e,o){var t=o.closest(".upfront-settings-item-content");"yes"==e?t.find("."+i+"-toggle-wrapper").show():t.find("."+i+"-toggle-wrapper").hide()}}),new Upfront.Views.Editor.Field.Select({model:this.model,className:i+"-caption-select caption_select",name:"caption-position-value",default_value:"topOver",label:o.ctrl.caption_position,label_style:"inline",values:[{label:o.ctrl.over_top,value:"topOver"},{label:o.ctrl.over_bottom,value:"bottomOver"},{label:o.ctrl.cover_top,value:"topCover"},{label:o.ctrl.cover_middle,value:"middleCover"},{label:o.ctrl.cover_bottom,value:"bottomCover"},{label:o.ctrl.below,value:"below"}],change:function(e){switch(t.model.set("caption-position-value",e),e){case"topOver":t.model.set("caption-position","over_image"),t.model.set("caption-alignment","top");break;case"bottomOver":t.model.set("caption-position","over_image"),t.model.set("caption-alignment","bottom");break;case"topCover":t.model.set("caption-position","over_image"),t.model.set("caption-alignment","fill");break;case"middleCover":t.model.set("caption-position","over_image"),t.model.set("caption-alignment","fill_middle");break;case"bottomCover":t.model.set("caption-position","over_image"),t.model.set("caption-alignment","fill_bottom");break;case"below":t.model.set("caption-position","below_image"),t.model.set("caption-alignment",!1),t.model.set("caption-trigger","always_show")}}}),new Upfront.Views.Editor.Field.Radios_Inline({className:i+"-caption-trigger field-caption_trigger upfront-field-wrap-multiple upfront-field-wrap-radios-inline over_image_field",model:this.model,name:"caption-trigger",label:o.ctrl.show_caption,label_style:"inline",layout:"horizontal-inline",values:[{label:o.settings.always,value:"always_show"},{label:o.settings.hover,value:"hover_show"}],change:function(e){t.model.set("caption-trigger",e)},init:function(){t.listenTo(this.model,"change",t.render)},rendered:function(){_.delay(this.options.disable_hover_show,200)},disable_hover_show:function(){t.$el.find("[value='hover_show']").attr("disabled",!1),"below_image"===t.model.get("caption-position")&&t.$el.find("[value='hover_show']").attr("disabled",!0)}})])}});return t});