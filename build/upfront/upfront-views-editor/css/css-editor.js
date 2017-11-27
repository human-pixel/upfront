!function(e){var t=Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.views:Upfront.mainData.l10n.global.views;upfrontrjs.define(["text!upfront/templates/popup.html","scripts/upfront/upfront-views-editor/fields","scripts/upfront/upfront-views-editor/fonts","scripts/upfront/upfront-views-editor/notifier","scripts/perfect-scrollbar/perfect-scrollbar"],function(s,i,l,n,o){var r=function(e){return"/"===e.trim().charAt(0)},a=function(e){return""===e.trim()},d=function(e){var t=e.innerText.split("/*"),s=[];t.forEach(function(e){return""===e.trim()?void s.push(e):void s.push("/*"+e)});var i=[];s.forEach(function(e){if(null===e.match(/\*\//))return void i.push(e);var t=e.split("*/");t.forEach(function(e){return""===e.trim()?void i.push(e):null===e.match(/\/\*/)?void i.push(e):void i.push(e+"*/")})});var l=[],n=0;i.forEach(function(e,t){if(!(n>t)){if(n=t,""===e.trim())return void l.push(e);if("/"===e.charAt(0))return void l.push(e);var s=e.match(/{/g);s=null===s?0:s.length;var o=e.match(/}/g);if(o=null===o?0:o.length,s===o)return void l.push(e);var r=e;for(t++;t<i.length;t++)if(r+=i[t],s=r.match(/{/g),s=null===s?0:s.length,o=r.match(/}/g),o=null===o?0:o.length,s===o){t++,l.push(r);break}n=t}});var o=[];return l.forEach(function(e,t){if(""===e.trim())return void o.push(e);if("/"===e.charAt(0))return void o.push(e);for(;""===e.charAt(0).trim();)o.push(e.charAt(0)),e=e.substring(1);for(var s="";""===e.charAt(e.length-1).trim();)s+=e.charAt(e.length-1),e=e.substring(0,e.length-1);o.push(e),o.push(s)}),o};return Backbone.View.extend({className:"upfront-ui",id:"upfront-csseditor",tpl:_.template(e(s).find("#csseditor-tpl").html()),prepareAce:!1,ace:!1,events:{"click .upfront-css-save-ok":"save","click .upfront-css-close":"close","click .upfront-css-theme_image":"openThemeImagePicker","click .upfront-css-media_image":"openImagePicker","click .upfront-css-font":"startInsertFontWidget","click .upfront-css-selector":"addSelector","click .upfront-css-type":"scrollToElement","click .upfront-css-delete":"deleteStyle","change .upfront-css-save-name-field":"updateStylename","mouseenter .upfront-css-selector":"hiliteElement","mouseleave .upfront-css-selector":"unhiliteElement","keyup .upfront-css-save-name-field":"checkDeleteToggle"},elementTypes:{UaccordionModel:{label:t.accordion,id:"uaccordion"},UcommentModel:{label:t.comments,id:"ucomment"},UcontactModel:{label:t.contact_form,id:"ucontact"},UgalleryModel:{label:t.gallery,id:"ugallery"},UimageModel:{label:t.image,id:"image"},LoginModel:{label:t.login,id:"upfront-login_element"},LikeBox:{label:t.like_box,id:"Like-box-object"},MapModel:{label:t.map,id:"upfront-map_element"},UnewnavigationModel:{label:t.navigation,id:"unewnavigation"},ButtonModel:{label:t.button,id:"ubutton"},PostsModel:{label:t.posts,id:"uposts"},UsearchModel:{label:t.search,id:"usearch"},USliderModel:{label:t.slider,id:"uslider"},SocialMediaModel:{label:t.social,id:"SocialMedia"},UtabsModel:{label:t.tabs,id:"utabs"},ThisPageModel:{label:t.page,id:"this_page"},ThisPostModel:{label:t.post,id:"this_post"},UwidgetModel:{label:t.widget,id:"uwidget"},UyoutubeModel:{label:t.youtube,id:"uyoutube"},PlainTxtModel:{label:t.text,id:"plain_text"},CodeModel:{label:t.code,id:"upfront-code_element"},Layout:{label:t.body,id:"layout"},GalleryLightbox:{label:t.body,id:"gallery-lightbox"},RegionContainer:{label:t.region,id:"region-container"},Region:{label:t.inner_region,id:"region"},RegionLightbox:{label:t.ltbox_region,id:"region"},ModuleGroup:{label:t.group,id:"module-group"},PostPart_titleModel:{label:t.postpart_title,id:"PostPart_title"},PostPart_contentsModel:{label:t.postpart_content,id:"PostPart_contents"},PostPart_excerptModel:{label:t.postpart_excerpt,id:"PostPart_excerpt"},PostPart_featured_imageModel:{label:t.postpart_featured,id:"PostPart_featured_image"},PostPart_authorModel:{label:t.postpart_author,id:"PostPart_author"},PostPart_author_gravatarModel:{label:t.postpart_author_gravatar,id:"PostPart_author_gravatar"},PostPart_dateModel:{label:t.postpart_date,id:"PostPart_date"},PostPart_updateModel:{label:t.postpart_update,id:"PostPart_update"},PostPart_comments_countModel:{label:t.postpart_comments,id:"PostPart_comments_count"},PostPart_tagsModel:{label:t.postpart_tags,id:"PostPart_tags"},PostPart_categoriesModel:{label:t.postpart_categories,id:"PostPart_categories"}},initialize:function(){e("#"+this.id).length||e("body").append(this.el),Upfront.Events.on("command:region:edit_toggle",this.close,this),Upfront.plugins.call("insert-css-editor-types",{types:this.elementTypes})},init:function(t){var s=this,i=e.Deferred();this.$style&&this.close(),this.no_render=t.no_render===!0,this.no_stylename_fallback=t.no_stylename_fallback===!0,this.model=t.model,this.sidebar=t.sidebar!==!1,this.toolbar=t.toolbar!==!1,this.readOnly=t.readOnly===!0,this.global=t.global===!0,this.modelType=t.type?t.type:this.model.get_property_value_by_name("type"),this.elementType=this.elementTypes[this.modelType]||{label:"Unknown",id:"unknown"},this.is_global_stylesheet="Layout"===t.type&&"layout"===t.element_id,this.is_global_stylesheet&&(this.sidebar=!0),this.resolve_stylename(t),this.ensure_style_element(),this.selectors=this.elementSelectors[this.modelType]||{},this.element_id=t.element_id?t.element_id:this.model.get_property_value_by_name("element_id"),this.no_render||(this.prepareAce=i.promise(),upfrontrjs=window.upfrontrjs||{define:define,require:require,requirejs:requirejs},upfrontrjs.require([Upfront.Settings.ace_url],function(){i.resolve()}),this.resizeHandler=this.resizeHandler||function(){window.innerWidth<1366?s.$el.width(e(window).width()-130):s.$el.width(e(window).width()-e("#sidebar-ui").width()-1)},e(window).on("resize",this.resizeHandler),"function"==typeof t.change&&this.on("change",t.change),this.render(),Upfront.Events.on("command:undo",function(){setTimeout(function(){var e=Upfront.Util.Transient.pop("css-"+s.element_id);e&&(s.get_style_element().html(e.replace(/#page/g,"div#page.upfront-layout-view .upfront-editable_entity.upfront-module")),s.render())},200)}),this.startResizable(),Upfront.Events.trigger("csseditor:open",this.element_id))},resolve_stylename:function(t){if(this.stylename="",this.is_global_stylesheet?this.stylename="layout-style":this.stylename=t.stylename,this.is_region_style()){var s=_upfront_post_data.layout.specificity||_upfront_post_data.layout.item||_upfront_post_data.layout.type,i="global"==this.model.get("scope"),l=this.elementType.id+"-"+this.model.get("name")+"-style",n=s+"-"+this.model.get("name")+"-style";i?this.stylename=l:(this.stylename=n,_.isArray(Upfront.data.styles[this.elementType.id])&&Upfront.data.styles[this.elementType.id].indexOf(l)!==-1&&Upfront.data.styles[this.elementType.id].indexOf(n)===-1&&!this.no_stylename_fallback&&(this.stylename=l))}""===this.stylename&&(this.stylename=this.get_temp_stylename(),e("#"+this.model.get_property_value_by_name("element_id")).addClass(this.stylename)),this.is_default_style="_default"===this.stylename},is_region_style:function(){return"region-container"===this.elementType.id||"region"===this.elementType.id},get_style_id:function(){return this.is_default_style?this.elementType.id+"_default":this.stylename},get_css_selector:function(){var e=Upfront.plugins.call("get-css-editor-selector",{object:this});return e.status&&"called"===e.status&&e.result?e.result:this.is_global_stylesheet?"":this.is_region_style()?".upfront-"+this.elementType.id+"-"+this.model.get("name"):this.is_default_style===!1?"#page ."+this.stylename:".upfront-output-"+this.elementType.id},ensure_style_element:function(){var t=this.get_style_element();return 0!==t.length?void(this.$style=t):(this.$style=e('<style id="'+this.get_style_id()+'"></style>'),void e("body").append(this.$style))},get_style_element:function(){return e("style#"+this.get_style_id())},close:function(t){t&&_.isFunction(t.preventDefault)&&t.preventDefault(),e(window).off("resize",this.resizeHandler),this.off("change"),this.$style=!1,this.editor&&this.editor.destroy(),e("#page").css("padding-bottom",0),this.$el.hide(),Upfront.Events.trigger("csseditor:closed",this.element_id)},render:function(){var t=this;e("#"+this.id).length||e("#page").append(this.$el),this.sidebar?this.$el.removeClass("upfront-css-no-sidebar"):this.$el.addClass("upfront-css-no-sidebar"),this.$el.html(this.tpl({name:this.stylename,elementType:this.elementType.label,selectors:this.selectors,show_style_name:this.is_region_style()===!1&&this.is_global_stylesheet===!1&&this.sidebar!==!0,showToolbar:this.toolbar})),this.resizeHandler(".");var s=this.$el.height()-this.$(".upfront-css-top").outerHeight();this.$(".upfront-css-body").height(s),this.prepareAce.done(function(){t.startAce()}),this.prepareSpectrum(),this.checkDeleteToggle(this.stylename),this.$el.show()},startAce:function(){var t,s,i,l=this,n=ace.edit(this.$(".upfront-css-ace")[0]),r=n.getSession(),a=!1;r.setUseWorker(!1),n.setShowPrintMargin(!1),n.setReadOnly(this.readOnly),r.setMode("ace/mode/css"),n.setTheme("ace/theme/monokai"),n.on("change",function(t){if(l.timer&&clearTimeout(l.timer),l.timer=setTimeout(function(){l.updateStyles(n.getValue())},800),l.trigger("change",n),"undefined"!=typeof l.editor){var s=e(l.editor.container).get(0).scrollWidth,i=e(l.editor.container).find(".ace_content").innerWidth();s<i+40?(a||l.startResizable(),a=!0):a=!1}}),i=Upfront.Util.colors.convert_string_color_to_ufc(this.get_style_element().html().replace(/div#page.upfront-layout-view .upfront-editable_entity.upfront-module/g,"#page")),this.is_global_stylesheet===!1&&(t=this.get_css_selector().replace(/[.+*\[\]]/g,"\\$&"),s=new RegExp(t+"\\s*","g"),i=i.replace(s,"")),n.setValue(e.trim(i),-1),n.renderer.scrollBar.width=5,n.renderer.scroller.style.right="5px",o.withDebounceUpdate(this.$el.find(".ace_scrollbar")[0],!1,!1,!0),n.focus(),this.editor=n,l.timer&&clearTimeout(l.timer),l.timer=setTimeout(function(){l.startResizable()},300)},prepareSpectrum:function(){var e=this,t=function(t){var s;s=t.get_is_theme_color()!==!1?t.theme_color:t.alpha<1?t.toRgbString():t.toHexString(),e.editor.insert(s),e.editor.focus()},s=new i.Color({default_value:"#ffffff",showAlpha:!0,showPalette:!0,maxSelectionSize:9,localStorageKey:"spectrum.recent_bgs",preferredFormat:"hex",chooseText:Upfront.Settings.l10n.global.content.ok,showInput:!0,allowEmpty:!0,autohide:!1,spectrum:{show:function(){},choose:t}});s.render(),e.$(".upfront-css-color").html(s.el)},startResizable:function(){var t=this,s=t.$(".upfront-css-body"),i=0,l=t.$(".upfront-css-selectors"),n=t.$(".upfront-css-save-form"),o=this.$(".upfront-css-resizable"),r=function(r,a){var d=a?a.size.height:t.$(".upfront-css-resizable").height(),c=d-i;s.height(c),t.editor&&t.editor.resize(),l.outerHeight(c-n.outerHeight()),o.css({width:"",height:"",left:"",top:""}),e("#page").css("padding-bottom",d)};o.find(".upfront-css-top").removeClass("ui-resizable-handle").addClass("ui-resizable-handle").removeClass("ui-resizable-n").addClass("ui-resizable-n"),i=t.$(".upfront-css-top").outerHeight(),r(),o.resizable({handles:{n:".upfront-css-top"},resize:r,minHeight:200,delay:100})},scrollToElement:function(){var t=e("#"+this.element_id);if(t.length){var s=t.offset().top-50;e(document).scrollTop(s>0?s:0),this.blink(t,4)}},blink:function(e,t){var s=this;e.css("outline","3px solid #3ea"),setTimeout(function(){e.css("outline","none"),t--,t>0&&setTimeout(function(){s.blink(e,t-1)},100)},100)},hiliteElement:function(t){var s=e(t.target).data("selector");if(s.length){var i=this.is_region_style()===!1?e("#"+this.element_id).parent():e("#"+this.element_id);i.find(s).addClass("upfront-css-hilite")}},unhiliteElement:function(t){var s=e(t.target).data("selector");if(s.length){var i=this.is_region_style()===!1?e("#"+this.element_id).parent():e("#"+this.element_id);i.find(s).removeClass("upfront-css-hilite")}},remove:function(){Backbone.View.prototype.remove.call(this),e(window).off("resize",this.resizeHandler)},updateStyles:function(e){var t=this.get_style_element();Upfront.Util.Transient.push("css-"+this.element_id,t.html()),e=Upfront.Util.colors.convert_string_ufc_to_color(e),t.html(this.stylesAddSelector(e,this.is_default_style?"":this.get_css_selector()).replace(/#page/g,"div#page.upfront-layout-view .upfront-editable_entity.upfront-module")),this.trigger("updateStyles",this.element_id)},stylesAddSelector:function(e,t){if(this.is_global_stylesheet&&empty(t))return e;var s=this,i=d(e);return processed="",_.each(i,function(e){if(r(e)||a(e))return void(processed+=e);var i=e.split("{"),l=i[0].split(","),n=[];_.each(l,function(e){for(var i="",l="";""===e.charAt(0).trim();)openingWs+=e.charAt(0),e=e.substring(1);for(;""===e.charAt(e.length-1).trim();)l+=e.charAt(e.length-1),e=e.substring(0,e.length-1);var o=e.replace(/:[^\s]+/,""),r="@"===o[0]||s.recursiveExistence(t,o),a=r?"":" ";n.push(i+t+a+e+l)}),processed+=n.join(",")+"{"+i[1]}),processed},recursiveExistence:function(t,s){for(var i=s.split(" "),l=this;i.length>0;){try{if(e(t+i.join(" ")).closest("#"+l.element_id).length)return!0}catch(e){}i.pop()}return!1},updateStylename:function(){var s=e.trim(this.$(".upfront-css-save-name-field").val()),i=this.stylename;return s=s.replace(/\s/g,"-").replace(/[^A-Za-z0-9_-]/gi,"").replace(/-+/g,"-").toLowerCase(),"_default"===i?(this.$(".upfront-css-save-name-field").val("_default"),void Upfront.Views.Editor.notify(t.default_style_name_nag,"error")):(e("#"+this.model.get_property_value_by_name("element_id")).removeClass(this.stylename),e("#"+this.model.get_property_value_by_name("element_id")).addClass(s),this.get_style_element().attr("id",s),this.stylename=s,this.get_style_element().html(this.get_style_element().html().replace(new RegExp(i,"g"),s)),this.model.set_breakpoint_property("theme_style",s),void(i!==this.get_temp_stylename&&this.save()))},get_temp_stylename:function(){return this.modelType.toLowerCase().replace("model","")+"-new-style"},save:function(s){s&&s.preventDefault();var i,l=this,o=e.trim(this.editor.getValue());if(this.is_global_stylesheet===!1&&this.stylename===this.get_temp_stylename())return n.addMessage(t.style_name_nag,"error");o=this.stylesAddSelector(o,this.is_default_style?"":this.get_css_selector()),i={styles:o,elementType:this.elementType.id,global:this.global};var r=Upfront.plugins.call("css-editor-save-style",{data:i,stylename:this.get_style_id(),isGlobalStylesheet:this.is_global_stylesheet,styles:o});r.status&&"called"===r.status||(i.name=this.get_style_id(),i.action="upfront_save_styles",Upfront.Util.post(i).success(function(e){var s=e.data,i=l.elementType.id;return Upfront.data.styles[i]||(Upfront.data.styles[i]=[]),Upfront.data.styles[i].indexOf(l.get_style_id())===-1&&Upfront.data.styles[i].push(l.get_style_id()),Upfront.Events.trigger("upfront:themestyle:saved",l.get_style_id()),l.checkDeleteToggle(s.name),n.addMessage(t.style_saved_as.replace(/%s/,l.get_style_id()))}).error(function(e){return n.addMessage(t.there_was_an_error)}))},saveCall:function(s){var i,l=this,o=e.trim(this.get_style_element().html());i={styles:o,elementType:this.elementType.id,global:this.global};var r=Upfront.plugins.call("css-editor-headless-save-style",{data:i,stylename:this.get_style_id()});r.status&&"called"===r.status||(i.name=this.get_style_id(),i.action="upfront_save_styles",Upfront.Util.post(i).success(function(e){var i=(e.data,l.elementType.id);return Upfront.data.styles[i]||(Upfront.data.styles[i]=[]),Upfront.data.styles[i].indexOf(l.get_style_id())===-1&&Upfront.data.styles[i].push(l.get_style_id()),Upfront.Events.trigger("upfront:themestyle:saved",l.get_style_id()),!s||n.addMessage(t.style_saved_as.replace(/%s/,l.get_style_id()))}).error(function(e){return!s||n.addMessage(t.there_was_an_error)}))},checkDeleteToggle:function(s){if(!_.isUndefined(s)){this.deleteToggle||(this.deleteToggle=e('<a href="#" class="upfront-css-delete">'+t.delete_style+"</a>"));var i=_.isString(s)?s:s.target.value,l=this.elementType.id,n=Upfront.data.styles[l],o=n&&n.indexOf(l+"-"+i)!=-1,r=this.deleteToggle.parent().length;o&&!r?this.$(".upfront-css-save-form").append(this.deleteToggle):!o&&r&&this.deleteToggle.detach()}},deleteStyle:function(s){s.preventDefault();var i=this,l=this.elementType.id,o=l+"-"+this.$(".upfront-css-save-name-field").val();if(confirm(t.delete_stylename_nag.replace(/%s/,o))){var r={elementType:l,styleName:o,action:"upfront_delete_styles"};Upfront.Util.post(r).done(function(){var s=Upfront.data.styles[l].indexOf(o);n.addMessage(t.stylename_deleted.replace(/%s/,o)),i.$(".upfront-css-save-name-field").val(""),i.editor.setValue(""),s!=-1&&Upfront.data.styles[l].splice(s,1),e("#upfront-style-"+o).remove(),i.model.get_property_value_by_name("theme_style")==o&&i.model.set_property("theme_style",""),i.deleteToggle.detach()})}},fetchThemeStyles:function(t){var s={action:"upfront_theme_styles",separately:t},i=e.Deferred();return Upfront.Util.post(s).success(function(e){i.resolve(e.data.styles)}),i.promise()},createSelectors:function(e){var t=this,s={};_.each(e,function(e){s[e.cssSelectorsId]=e.cssSelectors||{}}),t.elementSelectors=s},createSelector:function(e,t,s){var i=new e,l=new t({model:i});this.elementSelectors[s]=l.cssSelectors||{},l.remove()},openThemeImagePicker:function(){this._open_media_popup({themeImages:!0})},openImagePicker:function(){this._open_media_popup()},_open_media_popup:function(e){e=_.isObject(e)?e:{};var t=this,s=_.extend({},e);Upfront.Media.Manager.open(s).done(function(e,s){if(Upfront.Events.trigger("upfront:element:edit:stop"),s&&0!==s.length){var i=s.models[0],l=i.get("image")?i.get("image"):s.models[0],n="src"in l?l.src:"get"in l&&l.get("original_url");t.editor.insert('url("'+n+'")'),t.editor.focus()}})},startInsertFontWidget:function(){var t=new l.Insert_Font_Widget({collection:l.theme_fonts_collection});e("#insert-font-widget").html(t.render().el)},getElementType:function(e){var t=e.get_property_value_by_name("type"),s=this.elementTypes[t];return s||t},addSelector:function(t){var s=e(t.target).data("selector");_.isUndefined(this.editor)||(this.editor.insert(s),this.editor.focus())}})})}(jQuery);