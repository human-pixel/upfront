define([],function(){var e=Upfront.Views.Editor.Settings.Item.extend({className:"font_settings_item",group:!1,initialize:function(e){this.options=e||{};var t=this,n=this.options.state;this.fields=_([new Upfront.Views.Editor.Field.Number({className:"font-size",model:this.model,name:n+"-font-size",min:8,suffix:"px",label:"Tab Trigger Font:",change:function(e){t.model.set(n+"-font-size",e)}}),new Upfront.Views.Editor.Field.Select({values:Upfront.Views.Editor.Fonts.theme_fonts_collection.get_fonts_for_select(),model:this.model,name:n+"-font-family",label_style:"inline",className:"font-face",change:function(e){t.model.set(n+"-font-family",e)}}),new Upfront.Views.Editor.Field.Color({className:"upfront-field-wrap upfront-field-wrap-color sp-cf font-color",blank_alpha:0,model:this.model,name:n+"-font-color",label_style:"inline",label:"",spectrum:{preferredFormat:"rgb",change:function(e){t.model.set(n+"-font-color",e.toRgbString())},move:function(e){t.model.set(n+"-font-color",e.toRgbString())}}})])}});return e});