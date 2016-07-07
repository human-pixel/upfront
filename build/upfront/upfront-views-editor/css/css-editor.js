!function(e){var t=Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.views:Upfront.mainData.l10n.global.views;define(["text!upfront/templates/popup.html","scripts/upfront/upfront-views-editor/fields","scripts/upfront/upfront-views-editor/fonts","scripts/upfront/upfront-views-editor/notifier"],function(s,i,l,o){return Backbone.View.extend({className:"upfront-ui",id:"upfront-csseditor",tpl:_.template(e(s).find("#csseditor-tpl").html()),prepareAce:!1,ace:!1,events:{"click .upfront-css-save-ok":"save","click .upfront-css-close":"close","click .upfront-css-theme_image":"openThemeImagePicker","click .upfront-css-media_image":"openImagePicker","click .upfront-css-font":"startInsertFontWidget","click .upfront-css-selector":"addSelector","click .upfront-css-type":"scrollToElement","click .upfront-css-delete":"deleteStyle","change .upfront-css-save-name-field":"updateStylename","mouseenter .upfront-css-selector":"hiliteElement","mouseleave .upfront-css-selector":"unhiliteElement","keyup .upfront-css-save-name-field":"checkDeleteToggle"},elementTypes:{UaccordionModel:{label:t.accordion,id:"uaccordion"},UcommentModel:{label:t.comments,id:"ucomment"},UcontactModel:{label:t.contact_form,id:"ucontact"},UgalleryModel:{label:t.gallery,id:"ugallery"},UimageModel:{label:t.image,id:"image"},LoginModel:{label:t.login,id:"upfront-login_element"},LikeBox:{label:t.like_box,id:"Like-box-object"},MapModel:{label:t.map,id:"upfront-map_element"},UnewnavigationModel:{label:t.navigation,id:"unewnavigation"},ButtonModel:{label:t.button,id:"ubutton"},PostsModel:{label:t.posts,id:"uposts"},UsearchModel:{label:t.search,id:"usearch"},USliderModel:{label:t.slider,id:"uslider"},SocialMediaModel:{label:t.social,id:"SocialMedia"},UtabsModel:{label:t.tabs,id:"utabs"},ThisPageModel:{label:t.page,id:"this_page"},ThisPostModel:{label:t.post,id:"this_post"},UwidgetModel:{label:t.widget,id:"uwidget"},UyoutubeModel:{label:t.youtube,id:"uyoutube"},PlainTxtModel:{label:t.text,id:"plain_text"},CodeModel:{label:t.code,id:"upfront-code_element"},Layout:{label:t.body,id:"layout"},GalleryLightbox:{label:t.body,id:"gallery-lightbox"},RegionContainer:{label:t.region,id:"region-container"},Region:{label:t.inner_region,id:"region"},RegionLightbox:{label:t.ltbox_region,id:"region"},ModuleGroup:{label:t.group,id:"module-group"},PostPart_titleModel:{label:t.postpart_title,id:"PostPart_title"},PostPart_contentsModel:{label:t.postpart_content,id:"PostPart_contents"},PostPart_excerptModel:{label:t.postpart_excerpt,id:"PostPart_excerpt"},PostPart_featured_imageModel:{label:t.postpart_featured,id:"PostPart_featured_image"},PostPart_authorModel:{label:t.postpart_author,id:"PostPart_author"},PostPart_author_gravatarModel:{label:t.postpart_author_gravatar,id:"PostPart_author_gravatar"},PostPart_dateModel:{label:t.postpart_date,id:"PostPart_date"},PostPart_updateModel:{label:t.postpart_update,id:"PostPart_update"},PostPart_comments_countModel:{label:t.postpart_comments,id:"PostPart_comments_count"},PostPart_tagsModel:{label:t.postpart_tags,id:"PostPart_tags"},PostPart_categoriesModel:{label:t.postpart_categories,id:"PostPart_categories"}},initialize:function(){e("#"+this.id).length||e("body").append(this.el),Upfront.Events.on("command:region:edit_toggle",this.close,this)},init:function(t){var s=this,i=e.Deferred();this.$style&&this.close(),this.no_render=t.no_render===!0,this.no_stylename_fallback=t.no_stylename_fallback===!0,this.model=t.model,this.sidebar=t.sidebar!==!1,this.toolbar=t.toolbar!==!1,this.readOnly=t.readOnly===!0,this.global=t.global===!0,this.modelType=t.type?t.type:this.model.get_property_value_by_name("type"),this.elementType=this.elementTypes[this.modelType]||{label:"Unknown",id:"unknown"},this.is_global_stylesheet="Layout"===t.type&&"layout"===t.element_id,this.is_global_stylesheet&&(this.sidebar=!0),this.resolve_stylename(t),this.ensure_style_element(),this.selectors=this.elementSelectors[this.modelType]||{},this.element_id=t.element_id?t.element_id:this.model.get_property_value_by_name("element_id"),this.no_render||(this.prepareAce=i.promise(),require([Upfront.Settings.ace_url],function(){i.resolve()}),this.resizeHandler=this.resizeHandler||function(){s.$el.width(e(window).width()-e("#sidebar-ui").width()-1)},e(window).on("resize",this.resizeHandler),"function"==typeof t.change&&this.on("change",t.change),this.render(),Upfront.Events.on("command:undo",function(){setTimeout(function(){var e=Upfront.Util.Transient.pop("css-"+s.element_id);e&&(s.get_style_element().html(e.replace(/#page/g,"div#page.upfront-layout-view .upfront-editable_entity.upfront-module")),s.render())},200)}),this.startResizable(),Upfront.Events.trigger("csseditor:open",this.element_id))},resolve_stylename:function(t){if(this.stylename="",this.is_global_stylesheet?this.stylename="layout-style":this.stylename=t.stylename,this.is_region_style()){var s=_upfront_post_data.layout.specificity||_upfront_post_data.layout.item||_upfront_post_data.layout.type,i="global"==this.model.get("scope"),l=this.elementType.id+"-"+this.model.get("name")+"-style",o=s+"-"+this.model.get("name")+"-style";i?this.stylename=l:(this.stylename=o,_.isArray(Upfront.data.styles[this.elementType.id])&&-1!==Upfront.data.styles[this.elementType.id].indexOf(l)&&-1===Upfront.data.styles[this.elementType.id].indexOf(o)&&!this.no_stylename_fallback&&(this.stylename=l))}""===this.stylename&&(this.stylename=this.get_temp_stylename(),e("#"+this.model.get_property_value_by_name("element_id")).addClass(this.stylename)),this.is_default_style="_default"===this.stylename},is_region_style:function(){return"region-container"===this.elementType.id||"region"===this.elementType.id},get_style_id:function(){return this.is_default_style?this.elementType.id+"_default":this.stylename},get_css_selector:function(){return this.is_global_stylesheet?"":this.is_region_style()?".upfront-"+this.elementType.id+"-"+this.model.get("name"):this.is_default_style===!1?"#page ."+this.stylename:".upfront-output-"+this.elementType.id},ensure_style_element:function(){var t=this.get_style_element();return 0!==t.length?void(this.$style=t):(this.$style=e('<style id="'+this.get_style_id()+'"></style>'),void e("body").append(this.$style))},get_style_element:function(){return e("style#"+this.get_style_id())},close:function(t){t&&_.isFunction(t.preventDefault)&&t.preventDefault(),e(window).off("resize",this.resizeHandler),this.off("change"),this.$style=!1,this.editor&&this.editor.destroy(),e("#page").css("padding-bottom",0),this.$el.hide(),Upfront.Events.trigger("csseditor:closed",this.element_id)},render:function(){var t=this;e("#"+this.id).length||e("#page").append(this.$el),this.sidebar?this.$el.removeClass("upfront-css-no-sidebar"):this.$el.addClass("upfront-css-no-sidebar"),this.$el.html(this.tpl({name:this.stylename,elementType:this.elementType.label,selectors:this.selectors,show_style_name:this.is_region_style()===!1&&this.is_global_stylesheet===!1&&this.sidebar!==!0,showToolbar:this.toolbar})),this.resizeHandler(".");var s=this.$el.height()-this.$(".upfront-css-top").outerHeight();this.$(".upfront-css-body").height(s),this.prepareAce.done(function(){t.startAce()}),this.prepareSpectrum(),this.checkDeleteToggle(this.stylename),this.$el.show()},startAce:function(){var t,s,i=this,l=ace.edit(this.$(".upfront-css-ace")[0]),o=l.getSession(),n=!1;o.setUseWorker(!1),l.setShowPrintMargin(!1),l.setReadOnly(this.readOnly),o.setMode("ace/mode/css"),l.setTheme("ace/theme/monokai"),l.on("change",function(t){if(i.timer&&clearTimeout(i.timer),i.timer=setTimeout(function(){i.updateStyles(l.getValue())},800),i.trigger("change",l),"undefined"!=typeof i.editor){var s=e(i.editor.container).get(0).scrollWidth,o=e(i.editor.container).find(".ace_content").innerWidth();o+40>s?(n||i.startResizable(),n=!0):n=!1}}),s=Upfront.Util.colors.convert_string_color_to_ufc(this.get_style_element().html().replace(/div#page.upfront-layout-view .upfront-editable_entity.upfront-module/g,"#page")),this.is_global_stylesheet===!1&&(t=new RegExp(this.get_css_selector()+"\\s*","g"),s=s.replace(t,"")),l.setValue(e.trim(s),-1),l.renderer.scrollBar.width=5,l.renderer.scroller.style.right="5px",l.focus(),this.editor=l,i.timer&&clearTimeout(i.timer),i.timer=setTimeout(function(){i.startResizable()},300)},prepareSpectrum:function(){var e=this,t=new i.Color({default_value:"#ffffff",showAlpha:!0,showPalette:!0,maxSelectionSize:9,localStorageKey:"spectrum.recent_bgs",preferredFormat:"hex",chooseText:Upfront.Settings.l10n.global.content.ok,showInput:!0,allowEmpty:!0,autohide:!1,spectrum:{show:function(){},choose:function(t){var s;s=t.get_is_theme_color()!==!1?t.theme_color:t.alpha<1?t.toRgbString():t.toHexString(),e.editor.insert(s),e.editor.focus()}}});t.render(),e.$(".upfront-css-color").html(t.el)},startResizable:function(){var t=this,s=t.$(".upfront-css-body"),i=0,l=t.$(".upfront-css-selectors"),o=t.$(".upfront-css-save-form"),n=this.$(".upfront-css-resizable"),r=function(r,a){var d=a?a.size.height:t.$(".upfront-css-resizable").height(),p=d-i;s.height(p),t.editor&&t.editor.resize(),l.outerHeight(p-o.outerHeight()),n.css({width:"",height:"",left:"",top:""}),e("#page").css("padding-bottom",d)};n.find(".upfront-css-top").removeClass("ui-resizable-handle").addClass("ui-resizable-handle").removeClass("ui-resizable-n").addClass("ui-resizable-n"),i=t.$(".upfront-css-top").outerHeight(),r(),n.resizable({handles:{n:".upfront-css-top"},resize:r,minHeight:200,delay:100})},scrollToElement:function(){var t=e("#"+this.element_id);if(t.length){var s=t.offset().top-50;e(document).scrollTop(s>0?s:0),this.blink(t,4)}},blink:function(e,t){var s=this;e.css("outline","3px solid #3ea"),setTimeout(function(){e.css("outline","none"),t--,t>0&&setTimeout(function(){s.blink(e,t-1)},100)},100)},hiliteElement:function(t){var s=e(t.target).data("selector");if(s.length){var i=this.is_region_style()===!1?e("#"+this.element_id).parent():e("#"+this.element_id);i.find(s).addClass("upfront-css-hilite")}},unhiliteElement:function(t){var s=e(t.target).data("selector");if(s.length){var i=this.is_region_style()===!1?e("#"+this.element_id).parent():e("#"+this.element_id);i.find(s).removeClass("upfront-css-hilite")}},remove:function(){Backbone.View.prototype.remove.call(this),e(window).off("resize",this.resizeHandler)},updateStyles:function(e){var t=this.get_style_element();Upfront.Util.Transient.push("css-"+this.element_id,t.html()),e=Upfront.Util.colors.convert_string_ufc_to_color(e),t.html(this.stylesAddSelector(e,this.is_default_style?"":this.get_css_selector()).replace(/#page/g,"div#page.upfront-layout-view .upfront-editable_entity.upfront-module")),this.trigger("updateStyles",this.element_id)},stylesAddSelector:function(t,s){if(this.is_global_stylesheet&&empty(s))return t;var i=this,l=t.split("}"),o="";return _.each(l,function(t){var l=e.trim(t).split("{");if(2!=l.length)return!0;var n=l[0].split(","),r=[];_.each(n,function(t){t=e.trim(t);var l=t.replace(/:[^\s]+/,""),o="@"===l[0]||i.recursiveExistence(s,l),n=o?"":" ";r.push(""+s+n+t)}),o+=r.join(", ")+" {"+l[1]+"\n}\n"}),t.match(/\*\/\s*$/)&&!o.match(/\*\/\s*$/)&&(o+="\n*/"),o},recursiveExistence:function(t,s){for(var i=s.split(" "),l=this;i.length>0;){try{if(e(t+i.join(" ")).closest("#"+l.element_id).length)return!0}catch(o){}i.pop()}return!1},updateStylename:function(){var s=e.trim(this.$(".upfront-css-save-name-field").val()),i=this.stylename;return s=s.replace(/\s/g,"-").replace(/[^A-Za-z0-9_-]/gi,"").replace(/-+/g,"-").toLowerCase(),"_default"===i?(this.$(".upfront-css-save-name-field").val("_default"),void Upfront.Views.Editor.notify(t.default_style_name_nag,"error")):(e("#"+this.model.get_property_value_by_name("element_id")).removeClass(this.stylename),e("#"+this.model.get_property_value_by_name("element_id")).addClass(s),this.get_style_element().attr("id",s),this.stylename=s,this.get_style_element().html(this.get_style_element().html().replace(new RegExp(i,"g"),s)),this.model.set_breakpoint_property("theme_style",s),void(i!==this.get_temp_stylename&&this.save()))},get_temp_stylename:function(){return this.modelType.toLowerCase().replace("model","")+"-new-style"},save:function(s){s&&s.preventDefault();var i,l=this,n=e.trim(this.editor.getValue());if(this.is_global_stylesheet===!1&&this.stylename===this.get_temp_stylename())return o.addMessage(t.style_name_nag,"error");if(n=this.stylesAddSelector(n,this.is_default_style?"":this.get_css_selector()),i={styles:n,elementType:this.elementType.id,global:this.global},Upfront.Application.is_builder()){if(i.stylename=this.get_style_id(),this.is_global_stylesheet){var r=Upfront.Application.current_subapplication.layout.get("properties"),a=r&&r.findWhere?r.findWhere({name:"layout_style"}):!1;a&&a.set?a.set({value:n}):r.add({name:"layout_style",value:n})}return void Upfront.Behaviors.LayoutEditor.export_element_styles(i)}i.name=this.get_style_id(),i.action="upfront_save_styles",Upfront.Util.post(i).success(function(e){var s=e.data,i=l.elementType.id;return Upfront.data.styles[i]||(Upfront.data.styles[i]=[]),-1===Upfront.data.styles[i].indexOf(l.get_style_id())&&Upfront.data.styles[i].push(l.get_style_id()),Upfront.Events.trigger("upfront:themestyle:saved",l.get_style_id()),l.checkDeleteToggle(s.name),o.addMessage(t.style_saved_as.replace(/%s/,l.get_style_id()))}).error(function(e){return o.addMessage(t.there_was_an_error)})},saveCall:function(s){var i,l=this,n=e.trim(this.get_style_element().html());return i={styles:n,elementType:this.elementType.id,global:this.global},Upfront.Application.is_builder()?(i.stylename=this.get_style_id(),void Upfront.Behaviors.LayoutEditor.export_element_styles(i)):(i.name=this.get_style_id(),i.action="upfront_save_styles",void Upfront.Util.post(i).success(function(e){var i=(e.data,l.elementType.id);return Upfront.data.styles[i]||(Upfront.data.styles[i]=[]),-1===Upfront.data.styles[i].indexOf(l.get_style_id())&&Upfront.data.styles[i].push(l.get_style_id()),Upfront.Events.trigger("upfront:themestyle:saved",l.get_style_id()),s?o.addMessage(t.style_saved_as.replace(/%s/,l.get_style_id())):!0}).error(function(e){return s?o.addMessage(t.there_was_an_error):!0}))},checkDeleteToggle:function(s){if(!_.isUndefined(s)){this.deleteToggle||(this.deleteToggle=e('<a href="#" class="upfront-css-delete">'+t.delete_style+"</a>"));var i=_.isString(s)?s:s.target.value,l=this.elementType.id,o=Upfront.data.styles[l],n=o&&-1!=o.indexOf(l+"-"+i),r=this.deleteToggle.parent().length;n&&!r?this.$(".upfront-css-save-form").append(this.deleteToggle):!n&&r&&this.deleteToggle.detach()}},deleteStyle:function(s){s.preventDefault();var i=this,l=this.elementType.id,n=l+"-"+this.$(".upfront-css-save-name-field").val();if(confirm(t.delete_stylename_nag.replace(/%s/,n))){var r={elementType:l,styleName:n,action:"upfront_delete_styles"};Upfront.Util.post(r).done(function(){var s=Upfront.data.styles[l].indexOf(n);o.addMessage(t.stylename_deleted.replace(/%s/,n)),i.$(".upfront-css-save-name-field").val(""),i.editor.setValue(""),-1!=s&&Upfront.data.styles[l].splice(s,1),e("#upfront-style-"+n).remove(),i.model.get_property_value_by_name("theme_style")==n&&i.model.set_property("theme_style",""),i.deleteToggle.detach()})}},fetchThemeStyles:function(t){var s={action:"upfront_theme_styles",separately:t},i=e.Deferred();return Upfront.Util.post(s).success(function(e){i.resolve(e.data.styles)}),i.promise()},createSelectors:function(e){var t=this,s={};_.each(e,function(e){s[e.cssSelectorsId]=e.cssSelectors||{}}),t.elementSelectors=s},createSelector:function(e,t,s){var i=new e,l=new t({model:i});this.elementSelectors[s]=l.cssSelectors||{},l.remove()},openThemeImagePicker:function(){this._open_media_popup({themeImages:!0})},openImagePicker:function(){this._open_media_popup()},_open_media_popup:function(e){e=_.isObject(e)?e:{};var t=this,s=_.extend({},e);Upfront.Media.Manager.open(s).done(function(e,s){if(Upfront.Events.trigger("upfront:element:edit:stop"),s&&0!==s.length){var i=s.models[0],l=i.get("image")?i.get("image"):s.models[0],o="src"in l?l.src:"get"in l?l.get("original_url"):!1;t.editor.insert('url("'+o+'")'),t.editor.focus()}})},startInsertFontWidget:function(){var t=new l.Insert_Font_Widget({collection:l.theme_fonts_collection});e("#insert-font-widget").html(t.render().el)},getElementType:function(e){var t=e.get_property_value_by_name("type"),s=this.elementTypes[t];return s||t},addSelector:function(t){var s=e(t.target).data("selector");_.isUndefined(this.editor)||(this.editor.insert(s),this.editor.focus())}})})}(jQuery);