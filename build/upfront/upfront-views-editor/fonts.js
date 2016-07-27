!function(e){var t=Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.views:Upfront.mainData.l10n.global.views;define(["text!upfront/templates/popup.html","scripts/upfront/upfront-views-editor/fields"],function(i,n){var o=Backbone.View.extend({initialize:function(e){this.options=e||{}},className:function(){var e="font-variant-preview";return this.model.get("already_added")&&(e+=" font-variant-already-added"),e},template:_.template('<span class="font-family">{{family}} — {{name}}</span>{[ if(already_added) { ]} <span class="already-added">'+t.already_added+'</span>{[ } ]}{[ if(heading_preview) { ]}<h1 style="font-family: {{family}}; font-weight: {{weight}}; font-style: {{style}};" class="heading-font-preview font-preview">'+t.header_preview_quote+'</h1>{[ } else { ]}<p style="font-family: {{family}}; font-weight: {{weight}}; font-style: {{style}};" class="paragraph-font-preview font-preview">'+t.body_preview_quote+"</p>{[ } ]}"),events:{click:"on_click"},render:function(){return this.$el.html(this.template(_.extend({heading_preview:this.options.heading_preview},this.model.toJSON()))),this},on_click:function(){this.model.get("already_added")||(this.model.set({selected:!this.model.get("selected")}),this.$el.toggleClass("font-variant-selected"))}}),a=Backbone.Model.extend({},{parse_variant:function(e){var t;return"inherit"===e?{weight:"inherit",style:"inherit"}:!_.isUndefined(e)&&e.match(/^(\d+) *(normal|italic|oblique)$/)?(t=e.match(/^(\d+) *(normal|italic|oblique)/),{weight:t[1],style:t[2]}):"italic"===e?{weight:"400",style:"italic"}:!_.isUndefined(e)&&e.match(/^\d+$/)?{weight:e,style:"normal"}:{weight:"400",style:"normal"}},get_variant:function(e,t){return"inherit"===e||"inherit"===t?"inherit":(e=this.normalize_weight(e),""===t&&(t="normal"),"400"===e&&"normal"===t?"regular":"400"===e&&"italic"===t?"italic":e+" "+t)},normalize_variant:function(e){var t=this.parse_variant(e);return this.get_variant(t.weight,t.style)},normalize_weight:function(e){return"normal"==e||""===e?400:"lighter"==e?100:"bold"==e?700:"bolder"==e?900:e},get_default_variant:function(e){return"inherit"}}),s=Backbone.Collection.extend({model:a}),l=function(){var e=!1;this.get_fonts=function(){if(e)return e;var t=Upfront.Util.post({action:"upfront_list_google_fonts"});return t=t.then(function(t){return e=new s(t.data)})}},r=new l,f=function(){var e=[{family:"Andale Mono",category:"monospace"},{family:"Arial",category:"sans-serif"},{family:"Arial Black",category:"sans-serif"},{family:"Courier New",category:"monospace"},{family:"Georgia",category:"serif"},{family:"Impact",category:"sans-serif"},{family:"Times New Roman",category:"serif"},{family:"Trebuchet MS",category:"sans-serif"},{family:"Verdana",category:"sans-serif"}],t=new s,i=function(){var i;i=["Inherit","400","400 italic","700","700 italic"],_.each(e,function(e){e.variants=i,t.add(e)})};this.get_fonts=function(){return t},i()},c=new f,d=Backbone.Model.extend({initialize:function(e){this.set({displayVariant:a.normalize_variant(e.variant)},{silent:!0})}}),h=Backbone.Collection.extend({model:d,get_fonts_for_select:function(){var e=[{label:t.choose_font,value:""}],i=[];return _.each(p.models,function(e){i.push(e.get("font").family)}),_.each(_.uniq(i),function(t){e.push({label:t,value:t})}),_.each(Upfront.mainData.additionalFonts,function(t){e.push({label:t.family,value:t.family})}),_.each(c.get_fonts().models,function(t){e.push({label:t.get("family"),value:t.get("family")})}),e},get_variants:function(e){var t;return _.each(c.get_fonts().models,function(i){e===i.get("family")&&(t=i.get("variants"))}),t?t:(_.each(Upfront.mainData.additionalFonts,function(i){e===i.family&&(t=["inherit"].concat(i.variants))}),t?t:(t=[],_.each(p.models,function(i){e===i.get("font").family&&t.push(i.get("displayVariant"))}),t.unshift("inherit"),t))},get_variants_for_select:function(e){var t=[];return _.each(c.get_fonts().models,function(i){e===i.get("family")&&_.each(i.get("variants"),function(e){t.push({label:e,value:e})})}),_.each(Upfront.mainData.additionalFonts,function(i){e===i.family&&_.each(i.variants,function(e){t.push({label:e,value:e})})}),_.each(p.models,function(i){if(e===i.get("font").family){var n=i.get("displayVariant");t.push({label:n,value:n})}}),t},get_additional_font:function(e){var t=_.findWhere(Upfront.mainData.additionalFonts,{family:e});return t?new Backbone.Model(t):void 0}}),p=new h(Upfront.mainData.themeFonts),u=Backbone.Model.extend({getFullCollectionSet:function(){return["eot","woff","ttf","svg"]},getUploadStatus:function(){var e=this.getFullCollectionSet()||[],t=this.get("files")||{};return _.keys(t).length>=e.length},getUploadStatusMessage:function(){var e=t.icon_fonts_collection_incomplete||"",i=this.get("files")||{},n=[];return e?(_.each(this.getFullCollectionSet(),function(e){return e in i?!0:void n.push(e)}),n.length?e.replace(/%s/,n.join(", ")):""):""}}),m=Backbone.Collection.extend({model:u}),g=new m(Upfront.mainData.iconFonts),v=function(e){var i=function(){var e=_.debounce(n,100);p.on("add remove",e)},n=function(){var e={action:"upfront_update_theme_fonts",theme_fonts:p.toJSON()};Upfront.Util.post(e).error(function(){return notifier.addMessage(t.theme_fonts_save_fail)})};i()},y=(new v,Backbone.View.extend({className:"theme-font-list-item",events:{click:"on_click","click .delete":"on_delete"},template:e(i).find("#theme-font-list-item").html(),render:function(){return this.$el.html(_.template(this.template,{family:this.model.get("font").family,variant:this.model.get("displayVariant")})),this},on_click:function(){this.$el.siblings().removeClass("theme-font-list-item-selected"),this.$el.addClass("theme-font-list-item-selected"),this.trigger("selected",this.model.toJSON())},on_delete:function(){p.remove(this.model),this.remove()}})),w=Backbone.View.extend({className:"theme-fonts-panel panel",template:_.template(e(i).find("#theme-fonts-panel").html()),initialize:function(e){this.options=e||{},this.listenTo(this.collection,"add remove",this.update_stats),this.listenTo(this.collection,"add remove",this.render)},render:function(){return this.$el.html(""),this.$el.html(this.template({show_no_styles_notice:0===this.collection.length})),this.collection.length>0&&this.$el.find(".font-list").css("background","white"),_.each(this.collection.models,function(e){this.add_one(e)},this),this.update_stats(),this},update_stats:function(){var e=t.font_styles_selected.replace(/%d/,this.collection.length);this.$el.find(".font-stats").html("<strong>"+e+"</strong>")},add_one:function(e){var t=new y({model:e});this.options.parent_view.listenTo(t,"selected",this.options.parent_view.replaceFont),this.$el.find(".font-list").append(t.render().el)}}),b=Backbone.View.extend({id:"font-variants-preview",initialize:function(e){this.options=e||{}},addOne:function(e){var t=new o({model:e,heading_preview:this.options.heading_preview});this.$el.append(t.render().el)},render:function(){return _.each(this.collection.models,function(e){this.addOne(e)},this),this},get_selected:function(){var e=[];return _.each(this.collection.models,function(t){t.get("selected")&&e.push(t.get("variant"))}),e}}),k=Backbone.View.extend({id:"icon-fonts-manager",className:"clearfix",template:_.template(e(i).find("#icon-fonts-manager-tpl").html()),events:{"click .upload-icon-font":"triggerFileChooser","click .icon-font-upload-status":"triggerFileChooser","click .icon-fonts-list-item":"makeFontActive","click .icon-fonts-list-item a.expand-toggle":"expandListItems","click .font-filename a":"removeFontFile"},triggerFileChooser:function(e){return e&&e.preventDefault&&e.preventDefault(),e&&e.stopPropagation&&e.stopPropagation(),this.$el.find("#upfront-icon-font-input").click(),!1},render:function(){return this.$el.html(this.template({url:Upfront.mainData.ajax,show_no_fonts_notice:!1,fonts:this.collection.models})),_.isUndefined(this.collection.findWhere({active:!0}))&&this.$el.find('[data-family="icomoon"]').addClass("icon-fonts-list-item-active"),this.fileUploadInitialized||(this.fileUploadInitialized=!0,this.initializeFileUpload()),this},expandListItems:function(t){t&&t.preventDefault&&t.preventDefault(),t&&t.stopPropagation&&t.stopPropagation();var i=e(t.target),n=i.closest(".icon-fonts-list-item");return n.length&&n.toggleClass("expanded"),!1},removeFontFile:function(t){t&&t.preventDefault&&t.preventDefault(),t&&t.stopPropagation&&t.stopPropagation();var i=this,n=e(t.target),o=n.closest(".font-filename"),a=o.attr("data-name"),s=o.attr("data-idx");return a&&s?(Upfront.Util.post({action:"upfront_remove_icon_font_file",name:a,idx:s}).error(function(e){var t=((e||{}).responseJSON||{}).error||"Oops, something went wrong";!_.isString(t)&&(t||{}).message&&(t=t.message),Upfront.Views.Editor.notify(t,"error")}).done(function(){i.collection.each(function(e){var t=e.get("files");t&&t[s]&&a===t[s]&&(delete t[s],e.set("files",t))}),i.fileUploadInitialized=!1,i.render()}),!1):!1},initializeFileUpload:function(){if(!jQuery.fn.fileupload)return!1;var t=this;this.$el.find("#upfront-upload-icon-font").fileupload({dataType:"json",add:function(t,i){if(t.isDefaultPrevented())return!1;var n=!0;return i.files&&i.files.length&&_.each(i.files,function(e){n&&(n=!!(e||{}).name.match(/\.(eot|woff|woff2|ttf|svg)$/))}),n?void((i.autoUpload||i.autoUpload!==!1&&e(this).fileupload("option","autoUpload"))&&i.process().done(function(){i.submit()})):!1},done:function(e,i){var n,o=i.result.data.font;1===_.keys(o.files).length?(t.$el.find(".icon-fonts-list").append('<div data-family="'+o.family+'" class="icon-fonts-list-item">'+o.name+"</div>"),t.collection.add(o)):(n=t.collection.findWhere({family:o.family}),n.set({files:o.files}),n.get("active")===!0&&t.updateActiveFontStyle(o.family)),t.fileUploadInitialized=!1,t.render()},fail:function(e,t){var i=(((t||{}).jqXHR||{}).responseJSON||{}).error||"Oops, something went wrong";!_.isString(i)&&(i||{}).message&&(i=i.message),Upfront.Views.Editor.notify(i,"error")}})},makeFontActive:function(t){var i=e(t.currentTarget);i.siblings().removeClass("icon-fonts-list-item-active"),i.addClass("icon-fonts-list-item-active");var n={action:"upfront_update_active_icon_font",family:i.data("family")};Upfront.Util.post(n).error(function(){return notifier.addMessage("Could not update active icon font")}),e("#active-icon-font").remove(),_.each(this.collection.models,function(e){e.set({active:!1})}),"icomoon"!==i.data("family")&&(this.collection.findWhere({family:i.data("family")}).set({active:!0}),this.updateActiveFontStyle(i.data("family")))},updateActiveFontStyle:function(t){var i=this.collection.findWhere({family:t}),n="";_.each(i.get("files"),function(e,t){switch(n+="url('"+Upfront.mainData.currentThemeUrl+"/icon-fonts/"+e+"') format('",t){case"eot":n+="embedded-opentype";break;case"woff":n+="woff";break;case"woff2":n+="woff2";break;case"ttf":n+="truetype";break;case"svg":n+="svg"}n+="'),"});var o="@font-face {	font-family: '"+i.get("family")+"';";i.get("files").eot&&(o+="src: url('"+Upfront.mainData.currentThemeUrl+"/icon-fonts/"+i.get("files").eot+"');"),o+="	src:"+n.substring(0,n.length-1)+";",o+="	font-weight: normal;	font-style: normal;}.uf_font_icon, .uf_font_icon * {	font-family: '"+i.get("family")+"'!important;}",e("body").append('<style id="active-icon-font">'+o+"</style>")}}),U=Backbone.View.extend({id:"text-fonts-manager",className:"clearfix",template:_.template(e(i).find("#text-fonts-manager-tpl").html()),events:{"click .add-font-button":"add_font","click .preview-size-p":"on_p_click","click .preview-size-h1":"on_h1_click"},initialize:function(){this.theme_fonts_panel=new w({collection:this.collection,parent_view:this}),this.listenTo(this.collection,"remove",this.update_variants_on_remove)},render:function(){var t=this;return this.$el.html(this.template({show_no_styles_notice:0===this.collection.length})),e.when(r.get_fonts()).done(function(e){t.load_google_fonts(e)}),this.$el.find(".add-font-panel").after(this.theme_fonts_panel.render().el),Upfront.mainData.userDoneFontsIntro||this.$el.addClass("no-styles"),this.$el.find(".choose-font").after('<div class="preview-type"><span class="preview-type-title">'+Upfront.Settings.l10n.global.behaviors.preview_size+'</span><span class="preview-size-p selected-preview-size">P</span><span class="preview-size-h1">H1</span></div>'),this},on_p_click:function(){this.$el.find(".preview-size-h1").removeClass("selected-preview-size"),this.$el.find(".preview-size-p").addClass("selected-preview-size"),this.heading_preview=!1,this.update_variants()},on_h1_click:function(){this.$el.find(".preview-size-h1").addClass("selected-preview-size"),this.$el.find(".preview-size-p").removeClass("selected-preview-size"),this.heading_preview=!0,this.update_variants()},add_font:function(){var e,i=r.get_fonts().findWhere({family:this.font_family_select.get_value()});return _.isEmpty(i)?void alert(t.choose_font_weight):(e=this.choose_variants.get_selected(),_.isEmpty(e)?void alert(t.choose_one_font_weight):(_.each(e,function(e){p.add({id:i.get("family")+e,font:i.toJSON(),variant:e})}),void this.update_variants()))},load_google_fonts:function(i){var o=this.$el.find(".add-font-panel"),a=[{label:t.click_to_pick_google_font,value:""}];_.each(i.pluck("family"),function(e){a.push({label:e,value:e})}),o.find(".loading-fonts").remove(),this.font_family_select=new n.Chosen_Select({label:t.typeface,values:a,placeholder:t.choose_font,additional_classes:"choose-font"}),this.font_family_select.render(),o.find(".font-weights-list").before(this.font_family_select.el),e(".upfront-chosen-select",this.$el).chosen({width:"289px"}),this.listenTo(this.font_family_select,"changed",this.update_variants)},update_variants_on_remove:function(){this.update_variants()},update_variants:function(t){if(this.$el.find(".font-weights-list").css("background","white"),t||(t=r.get_fonts().findWhere({family:this.font_family_select.get_value()})),t){var i=new Backbone.Collection;_.each(t.get("variants"),function(n){0===e("#"+t.get("family").toLowerCase()+n+"-css").length&&e("head").append('<link rel="stylesheet" id="'+t.get("family").toLowerCase()+"-"+n+'-css" href="//fonts.googleapis.com/css?family='+t.get("family")+"%3A"+n+'" type="text/css" media="all">');var o=a.parse_variant(n);i.add({family:t.get("family"),name:a.normalize_variant(n),variant:n,already_added:!!p.get(t.get("family")+n),weight:o.weight,style:o.style})}),this.choose_variants&&this.choose_variants.remove(),this.choose_variants=new b({collection:i,heading_preview:this.heading_preview}),this.choose_variants.render(),this.$el.find(".font-weights-list-wrapper").html(this.choose_variants.el)}},set_ok_button:function(e){e.on("click",this.on_ok_click)},on_ok_click:function(e){Upfront.Events.trigger("upfront:render_typography_sidebar"),Upfront.mainData.userDoneFontsIntro||(Upfront.Util.post({action:"upfront_user_done_font_intro"}),Upfront.mainData.userDoneFontsIntro=!0)}}),x=Backbone.View.extend({initialize:function(){var e=this;this.fields=[new n.Typeface_Chosen_Select({label:"",compact:!0,values:p.get_fonts_for_select(),additional_classes:"choose-typeface",select_width:"230px"}),new n.Typeface_Style_Chosen_Select({label:"",compact:!0,values:[],additional_classes:"choose-variant",select_width:"120px"}),new n.Button({label:t.insert_font,compact:!0,on_click:function(){e.finish()}})]},render:function(){return e("#insert-font-widget").html("").addClass("open"),this.$el.html(""),_.each(this.fields,function(e){e.render(),this.$el.append(e.el)},this),this.listenTo(this.fields[0],"changed",function(){var e=p.get_variants(this.fields[0].get_value());this.render_variants(e)}),this.listenTo(this.fields[1],"changed",function(){this.preview_font()}),e(".choose-typeface select",this.$el).chosen({width:"230px",disable_search:!0}),e(".choose-variant select",this.$el).chosen({width:"120px",disable_search:!0}),this},render_variants:function(e){var i=this.$el.find(".choose-variant select");i.find("option").remove(),i.append('<option value="">'+t.choose_variant+"</option>"),_.each(e,function(e){i.append('<option value="'+e+'">'+e+"</option>")}),i.trigger("chosen:updated")},preview_font:function(){this.replaceFont({font_family:this.fields[0].get_value(),variant:a.parse_variant(this.fields[1].get_value())})},replaceFont:function(e){var t;this.editor=Upfront.Application.cssEditor.editor||Upfront.Application.generalCssEditor.editor,this.style_doc=this.editor.getSession().getDocument(),this.last_selected_font=e,this.font_family_range?this.font_family_range.end=this.end_point:this.font_family_range=this.editor.getSelection().getRange(),this.end_point=this.style_doc.replace(this.font_family_range,e.font_family),this.reset_properties(),t=[],e.variant.weight&&t.push("    font-weight: "+e.variant.weight+";"),e.variant.style&&t.push("    font-style: "+e.variant.style+";"),t.length>0&&this.style_doc.insertLines(this.font_family_range.start.row+1,t)},reset_properties:function(){var e,t,i;for(this.editor=Upfront.Application.cssEditor.editor||Upfront.Application.generalCssEditor.editor,this.style_doc=this.editor.getSession().getDocument(),i={},e=this.font_family_range.start.row+1,t=this.style_doc.getLine(e);t.indexOf("}")<0&&(-1!==t.indexOf("font-weight")&&(i.weight=e,this.starting_weight||(this.starting_weight=t)),-1!==t.indexOf("font-style")&&(i.style=e,this.starting_style||(this.starting_style=t)),e++,t=this.style_doc.getLine(e)););i.weight&&i.style&&(i.weight>i.style?(this.style_doc.removeLines(i.weight,i.weight),this.style_doc.removeLines(i.style,i.style)):(this.style_doc.removeLines(i.style,i.style),this.style_doc.removeLines(i.weight,i.weight)),i.weight=!1,i.style=!1),i.weight&&this.style_doc.removeLines(i.weight,i.weight),i.style&&this.style_doc.removeLines(i.style,i.style)},finish:function(){e("#insert-font-widget").html('<a class="upfront-css-font" href="#">'+t.insert_font+"</a>").removeClass("open")}});return{System:c,Google:r,Text_Fonts_Manager:U,Icon_Fonts_Manager:k,theme_fonts_collection:p,icon_fonts_collection:g,Insert_Font_Widget:x,Model:a}})}(jQuery);