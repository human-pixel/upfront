!function(e){var t=Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.views:Upfront.mainData.l10n.global.views;define(["scripts/upfront/upfront-views-editor/region/region-bg-setting","scripts/upfront/upfront-views-editor/fields","text!upfront/templates/region_edit_panel.html"],function(i,r,n){return i.extend({get_template:function(){var t=e(n);return _.template(t.find("#upfront-region-bg-setting-fixed").html())},render_main_settings:function(e){var i=new r.Checkboxes({model:this.model,name:"restrict_to_container",default_value:"",layout:"horizontal-inline",values:[{label:t.restrict_to_parent,value:"1"}],change:function(){var e=this.get_value();this.model.set({restrict_to_container:e},{silent:!0}),this.model.trigger("restrict_to_container",e),this.model.get("properties").trigger("change")},multiple:!1});this.render_fixed_settings(e.find(".upfront-region-bg-setting-fixed-region")),i.render(),e.find(".upfront-region-bg-setting-floating-restrict").append(i.$el),this.$el.addClass("upfront-modal-bg-settings-fixed")},render_fixed_settings:function(e){var i=Upfront.Settings.LayoutEditor.Grid,r=this.model.get_property_value_by_name("top"),n="number"==typeof r,o=this.model.get_property_value_by_name("left"),l="number"==typeof o,s=this.model.get_property_value_by_name("bottom"),a="number"==typeof s,p=this.model.get_property_value_by_name("right"),d="number"==typeof p,m=function(){var e=this.get_value(),t=this.get_saved_value();if(e!=t){switch(this.options.property){case"top":this.model.remove_property("bottom",!0);break;case"bottom":this.model.remove_property("top",!0);break;case"left":this.model.remove_property("right",!0);break;case"right":this.model.remove_property("left",!0)}this.property.set({value:parseInt(e,10)})}},g={width:new Upfront.Views.Editor.Field.Number({model:this.model,property:"width",label:t.width+":",label_style:"inline",min:3*i.column_width,max:Math.floor(i.size/2)*i.column_width,change:m}),height:new Upfront.Views.Editor.Field.Number({model:this.model,property:"height",label:t.height+":",label_style:"inline",min:3*i.baseline,change:m})};n||!a?g.top=new Upfront.Views.Editor.Field.Number({model:this.model,property:"top",label:t.top+":",label_style:"inline",min:0,change:m}):g.bottom=new Upfront.Views.Editor.Field.Number({model:this.model,property:"bottom",label:t.bottom+":",label_style:"inline",min:0,change:m}),l||!d?g.left=new Upfront.Views.Editor.Field.Number({model:this.model,property:"left",label:t.left+":",label_style:"inline",min:0,change:m}):g.right=new Upfront.Views.Editor.Field.Number({model:this.model,property:"right",label:t.right+":",label_style:"inline",min:0,change:m}),_.each(g,function(t){t.render(),t.delegateEvents(),e.append(t.$el)})}})})}(jQuery);