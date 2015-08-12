define(["scripts/upfront/settings/modules/base-module"],function(e){var t=Upfront.Settings.l10n.image_element,n=e.extend({className:"settings_module caption_location clearfix",group:!1,initialize:function(e){this.options=e||{};var n=this,r=this.options.state;this.fields=_([new Upfront.Views.Editor.Field.Checkboxes({model:this.model,className:"useCaptions checkbox-title",name:"use_captions",label:"",default_value:1,multiple:!1,values:[{label:t.settings.show_caption,value:"yes"}],change:function(e){n.model.set("use_captions",e)},show:function(e,t){var n=t.closest(".state_modules");e=="yes"?(n.find("."+r+"-caption-select").show(),n.find("."+r+"-caption-trigger").show()):(n.find("."+r+"-caption-select").hide(),n.find("."+r+"-caption-trigger").hide())}}),new Upfront.Views.Editor.Field.Select({model:this.model,className:r+"-caption-select caption_select",name:"caption-position-value",default_value:"nocaption",label:t.ctrl.caption_position,values:[{label:t.ctrl.over_top,value:"topOver",icon:"topOver"},{label:t.ctrl.over_bottom,value:"bottomOver",icon:"bottomOver"},{label:t.ctrl.cover_top,value:"topCover",icon:"topCover"},{label:t.ctrl.cover_middle,value:"middleCover",icon:"middleCover"},{label:t.ctrl.cover_bottom,value:"bottomCover",icon:"bottomCover"},{label:t.ctrl.below,value:"below",icon:"below"}],change:function(e){n.model.set("caption-position-value",e);switch(e){case"topOver":n.model.set("caption-position","over_image"),n.model.set("caption-alignment","top");break;case"bottomOver":n.model.set("caption-position","over_image"),n.model.set("caption-alignment","bottom");break;case"topCover":n.model.set("caption-position","over_image"),n.model.set("caption-alignment","fill");break;case"middleCover":n.model.set("caption-position","over_image"),n.model.set("caption-alignment","fill_middle");break;case"bottomCover":n.model.set("caption-position","over_image"),n.model.set("caption-alignment","fill_bottom");break;case"below":n.model.set("caption-position","below_image"),n.model.set("caption-alignment",!1)}}}),new Upfront.Views.Editor.Field.Radios({className:r+"-caption-trigger field-caption_trigger upfront-field-wrap upfront-field-wrap-multiple upfront-field-wrap-radios over_image_field",model:this.model,name:"caption-trigger",label:"",layout:"horizontal-inline",values:[{label:t.settings.always,value:"always_show"},{label:t.settings.hover,value:"hover_show"}],change:function(e){n.model.set("caption-trigger",e)}})])}});return n});