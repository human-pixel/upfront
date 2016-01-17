(function(e){define(["scripts/redactor/ueditor-insert","scripts/redactor/ueditor-inserts","text!scripts/redactor/ueditor-templates.html","scripts/redactor/ueditor-insert-utils"],function(t,n,r,i){var s=Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.ueditor:Upfront.mainData.l10n.global.ueditor,o=t.UeditorInsert.extend({$editor:!1,caption_active:!1,className:"ueditor-insert upfront-inserted_image-wrapper",tpl:_.template(e(r).find("#image-insert-tpl").html()),resizable:!1,defaultData:{insert_type:"image_insert",caption:"<p>Default caption</p>",show_caption:1,imageFull:{src:"",width:100,height:100},imageThumb:{src:"",width:100,height:100},selectedImage:{src:"",width:100,height:100},linkType:"do_nothing",linkUrl:"",isLocal:1,alignment:{vid:"center",label:"Center"},externalImage:{top:0,left:0,width:0,height:0},variant_id:"",style:{label_id:"",vid:"",caption:{order:1,height:50,width_cls:"",left_cls:"ml0",top_cls:"mt0",show:1},group:{"float":"none",width_cls:"",left_cls:"ml0",height:0,marginRight:0,marginLeft:0},image:{width_cls:"",left_cls:"ml0",top_cls:"mt0",src:"",height:0}}},wp_defaults:{insert_type:"wp_default",attachment_id:"",caption:"<p>Default caption</p>",link_url:"",image:{src:"",url:"",width:0,height:0},style:{wrapper:{alignment:"alignnone",width:"310"},caption:{show:!0},image:{size_class:"size-medium"}}},events:{"click .ueditor-insert-remove":"click_remove","dragstart img":"on_image_dragstart"},is_post_image_insert:function(){return!this.is_image_insert()},is_image_insert:function(){return this.$editor.find(".plain-text-container").length},get_type:function(){return this.$editor&&this.$editor.data("ueditor")?_.contains(this.$editor.data("ueditor").options.inserts,"image")?n.NAMES.IMAGE:n.NAMES.POSTIMAGE:!1},get_caption_state:function(){return this.data.get("show_caption")?0:1},click_remove:function(e){e.preventDefault(),this.trigger("remove",this)},get_data_json:function(){return typeof this.prepare_data=="function"?this.prepare_data():this.data.toJSON()},make_caption_editable:function(){var t=this,n=this.data.get("style"),r=this.$(".wp-caption-text");if(!n)return!1;if(!n.caption||!this.data.get("show_caption")||this.$(".wp-caption-text").length===0)return;r.off("keyup").on("keyup",function(e){t.data.set("caption",this.innerHTML,{silent:!0}),t.data.trigger("update"),t.render_shortcode&&t.render_shortcode(t.get_data_json())}).ueditor({linebreaks:!1,autostart:!0,pastePlainText:!0,buttons:[],placeholder:t.defaultData.caption,inserts:[],focus:!1,paragraphize:!1}).attr("contenteditable",!1),this.caption_ueditor=r.data("ueditor"),this.caption_ueditor.redactor.events.on("ueditor:change",function(e){t.data.set("caption",t.caption_ueditor.$el.html(),{silent:!0}),t.data.trigger("update")}),this.caption_ueditor.redactor.events.on("ueditor:focus",function(e){if(e!=t.caption_ueditor.redactor||t.caption_active===!0)return;var n=t.$el.closest(".redactor-editor"),i=n.data("ueditor"),s=i?i.redactor:!1;if(!s)return;e.$element.is(r)?(n.attr("contenteditable",!1),r.attr("contenteditable",!0),t.caption_active=!0):(n.attr("contenteditable",!0),r.attr("contenteditable",!1),t.caption_active=!1),s.$editor.off("drop.redactor paste.redactor keydown.redactor keyup.redactor focus.redactor blur.redactor"),s.$textarea.on("keydown.redactor-textarea")}),this.caption_ueditor.redactor.events.on("ueditor:blur",function(e){if(e!=t.caption_ueditor.redactor||t.caption_active===!1)return;var n=t.$el.closest(".redactor-editor"),i=n.data("ueditor"),s=i?i.redactor:!1;if(!s)return;e.$element.is(r)?(n.attr("contenteditable",!0),r.attr("contenteditable",!1),t.caption_active=!1):(n.attr("contenteditable",!1),r.attr("contenteditable",!0),t.caption_active=!0),s.build.setEvents()}),t.$el.on("hover, click",function(e){e.stopPropagation();var n=t.$editor.is(".redactor-editor")?t.$editor:t.$editor.find(".upfront-object-content");r.attr("contenteditable",!0),n.attr("contenteditable",!1),t.caption_active=!0}),this.$editor.on("mouseenter, click",function(n){var i=e(this).is(".redactor-editor")?e(this):e(this).find(".upfront-object-content");r.attr("contenteditable",!1),i.attr("contenteditable",!0),t.caption_active=!1})},controlEvents:function(){var e=this;this.stopListening(this.controls),this.listenTo(this.controls,"control:ok:link",function(e,t){var n=e.$("input[type=text]").val(),r=e.$("input[type=radio]:checked").val()||"do_nothing",i={};"external"===r&&!n.match(/https?:\/\//)&&!n.match(/\/\/:/)&&(n=n.match(/^www\./)||n.match(/\./)?"http://"+n:n),i={linkType:r,linkUrl:n},this.data.set(i),e.model.set(i),t.close()}),this.listenTo(this.controls,"control:click:toggle_caption",function(e){var t=1;this.data.get("show_caption")&&(t=0),this.data.set("show_caption",t)}),this.listenTo(this.controls,"control:click:change_image",this.change_image),typeof this.control_events=="function"&&this.control_events()},updateControlsPosition:function(){this.controls.$el.css({left:15,top:15})},getSimpleOutput:function(){var t=this.el.cloneNode(!0),n=this.data.toJSON();return n.image=this.get_proper_image(),this.data.set("width",this.$el.width(),{silent:!0}),this.data.trigger("update"),n.isLocal=parseInt(n.isLocal,10),t.innerHTML=this.tpl(n),e(t).width(this.data.get("width")),e("<div>").html(t).html()},get_proper_image:function(){var e=this.data.toJSON(),t=e.imageFull,n=Upfront.Settings.LayoutEditor.Grid;return e.style=e.style||{image_col:0,group:"",image:"",caption:""},e.imageThumb&&e.style&&e.style.image&&e.style.image.col&&e.style.image.col*n.column_width<=e.imageThumb.width&&(t=e.imageThumb),t},getOutput:function(){var t=this.el.cloneNode(),n=this.data.toJSON();return n.image=this.get_proper_image(),n.image?(this.data.set("width",this.$el.width(),{silent:!0}),this.data.trigger("update"),n.isLocal=parseInt(n.isLocal,10),t.innerHTML=this.tpl(n),e("<div>").html(t).html()):!1},getImageData:function(e){if(!e)return!1;var t=e.at(0).toJSON(),n=this.getSelectedImage(t),r=this.is_wp?_.extend({},this.wp_defaults,{attachment_id:t.ID,caption:t.post_excerpt?t.post_excerpt:"",link_url:"",image:n,style:{caption:{show:!0},wrapper:{alignment:"alignnone",width:n.width},image:{size_class:"size-"+n.selected_size}}}):_.extend({},this.defaultData,{attachmentId:t.ID,title:t.post_tite,imageFull:t.image,imageThumb:this.getThumb(t.additional_sizes),selectedImage:_.isUndefined(t.selected_size)?t.image:_.filter(t.additional_sizes,function(e){var n=t.selected_size.toLowerCase().split("x"),r=n[0],i=n[1];return e.width==r&&e.height==i})[0],linkType:"do_nothing",linkUrl:"",align:"center"});return r},getThumb:function(e){var t={width:0};return _.each(e,function(e){e.width<=500&&e.width>t.width&&(t=e)}),t},getSelectedImage:function(e){e.image.selected_size="full";if(e.selected_size=="full")return e.image;var t=e.selected_size?e.selected_size.split("x"):[],n=["thumbnail","medium","large"];if(t.length!=2)return e.image;for(var r=0;r<e.additional_sizes.length;r++){var i=e.additional_sizes[r];i.selected_size=n[r];if(i.width==t[0]&&i.height==t[1])return i}return e.image},importInserts:function(t,n,r){var i=this,s={},o={};return remaining_images=t.find("img"),t.is(".wp-caption-text")||(this.$editor=t),i.importFromShortcode&&this.is_post_image_insert()&&(o=i.importFromShortcode(t,n,r)),this.is_post_image_insert()&&(remaining_images=t.find("img").filter(function(){return!e(this).closest(".ueditor-insert").length})),_.each(remaining_images,function(e){var t=!1;t=i.importFromImage(e),t&&(s[t.data.id]=t)}),_.extend(s,o)},importFromWrapper:function(e,t,n){var r=e.attr("id"),i=!1,s=!1,o=!1,u=ImageInsert;return _.contains(n,"postImage")&&(u=PostImageInsert),t[r]?i=new u({data:t[r]}):i=this.importFromImage(e.find("img")),i.render(),e.replaceWith(i.$el),i},getLinkView:function(){if(this.linkView)return this.linkView;var e=new i.LinkView({data:{linkType:this.data.get("linkType"),linkUrl:this.data.get("linkUrl")}});return this.linkView=e,e},getStyleView:function(){if(this.styleView)return this.styleView;var e=new i.PostImageStylesView(this.data);return this.styleView=e,e},calculateRealSize:function(e){var t=new Image;return t.src=e,{width:t.width,height:t.height}},generateThumbSrc:function(e,t){var n=this.data.get("imageFull").src,r=n.split("."),i=r.pop();return n=r.join(".")+"-"+e+"x"+t+"."+i,n},calculateImageResize:function(e,t){var n=t.width/t.height>e.width/e.height?"height":"width",r=t[n]/e[n],i={width:Math.round(t.width/r),height:Math.round(t.height/r)},s=n=="width";return i.top=s?-Math.round((i.height-e.height)/2):0,i.left=s?0:-Math.round((i.width-e.width)/2),i},render_shortcode:function(e){if(this.caption_ueditor&&!this.caption_ueditor.options.inserts.length)return;e=e instanceof Backbone.Model?e.toJSON():e;var t=this.shortcode_tpl(e);t=t.replace(/\[caption[\s\S]+?\[\/caption\]/g,function(e){return e.replace(/<br([^>]*)>/g,"<wp-temp-br$1>").replace(/[\r\n\t]+/,"")}),t=t.replace(/\s*<div/g,"\n<div"),t=t.replace(/<\/div>\s*/g,"</div>\n"),t=t.replace(/\s*\[caption([^\[]+)\[\/caption\]\s*/gi,"\n\n[caption$1[/caption]\n\n"),t=t.replace(/caption\]\n\n+\[caption/g,"caption]\n\n[caption"),t=t.replace(/\s+/g," "),this.$shortcode_el.html(t)},on_image_dragstart:function(e){e.preventDefault()},change_image:function(){var e=this;return Upfront.Media.Manager.open({multiple_selection:!1,insert_options:!1,button_text:s.change_image,hide_sizes:this.data.get("insert_type")==="image_insert"}).done(function(t,n){if(_.isEmpty(n))return;e.start(n)}),!1}});return{ImageInsertBase:o}})})(jQuery);