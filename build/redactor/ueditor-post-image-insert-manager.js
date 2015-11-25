(function(e){define(["scripts/redactor/ueditor-insert","scripts/redactor/ueditor-image-insert-base","text!scripts/redactor/ueditor-templates.html","scripts/redactor/ueditor-image-insert-post"],function(t,n,r,i){var s=i.PostImageInsert,o=i.WP_PostImageInsert,u=n.ImageInsertBase.extend({start:function(t,n){var r=this,i=Upfront.Media.Manager.open({multiple_selection:!1,insert_options:!0}),u=e.Deferred();return i.done(function(e,t){if(_.isEmpty(t))return;var r=t.at(0).get("insert_option")==="wp_default";if(r){var i=new o({start:t,$editor:n});u.resolve(i)}else{var i=new s({start:t,$editor:n});u.resolve(i)}}),e.when(i,u.promise())},importFromShortcode:function(t,n,r){var i=this,s,r={};this.$editor=t;var o=wp.shortcode.replace("caption",t.html(),function(t){return t.parse_content=e.parseHTML(t.content),t.get("id").indexOf("uinsert-")!==-1?s=i.importFromShortcode_UF(t):s=i.importFromShortcode_WP(t),r[s.data.id]=s,s.el.outerHTML});return t.html(o),r},importFromShortcode_UF:function(e){var t=_.extend({},this.defaultData),n=this.calculateRealSize(t.imageThumb.src);t.imageThumb.src=this.get_shortcode_image_src(e.content),t.caption=this.get_shortcode_caption_text(e.parse_content),t=this.populate_link(e.content,t),t.imageFull={width:n.width,height:n.height,src:t.imageThumb.src},t.style=Upfront.Content.ImageVariants.findWhere({vid:e.get("uf_variant")}).toJSON(),t.style.caption.show=e.get("uf_show_caption"),t.variant_id=t.style.vid;var r=new s({data:t,$editor:this.$editor});return r.render(),r},importFromShortcode_WP:function(t){var n=_.extend({},this.wp_defaults,{attachment_id:t.get("id").replace("attachment_",""),caption:this.get_shortcode_caption_text(e.parseHTML(t.content)),link_url:this.get_shortcode_url(t.content),image:{height:this.get_shortcode_content_image_height(t.content),width:t.get("width"),src:this.get_shortcode_image_src(t.content)},style:{caption:{show:parseInt(t.get("show_caption"),10)},wrapper:{alignment:t.get("align"),width:parseInt(t.get("width"),10)},image:{size_class:this.get_shortcode_content_image_size_class(t.content)}}}),r=new o({data:n,$editor:this.$editor});return r.render(),r},get_shortcode_image_src:function(t){return e("<div>").html(t).find("img").attr("src")},get_shortcode_caption_text:function(e){var t="";return _.each(e,function(e,n){e.innerHtml&&(t+=e.innerHtml),e.textContent&&(t+=e.textContent)}),t},get_shortcode_content_image_size_class:function(t){var n=/(?:^|\W)size-(\w+)(?!\w)/g,r=e("<div>").html(t).find("img"),i=r.length?r.attr("class").match(n):!1;return i?i[0]:""},get_shortcode_content_image_height:function(t){var n=e("<div>").html(t).find("img");return(n.length?n.attr("height"):"")||"auto"},populate_link:function(e,t){t.linkUrl=this.get_shortcode_url(e);if(!t.linkUrl)return t;var n=document.createElement("a");return n.href=t.linkUrl,n.origin!=window.location.origin&&(t.linkType="external"),n.origin==window.location.origin&&t.imageThumb.src!=t.linkUrl&&(t.linkType="post"),n.origin==window.location.origin&&t.imageThumb.src==t.linkUrl&&(t.linkType="show_larger_image"),t},get_shortcode_url:function(t){return e("<div>").html(t).find("a").attr("href")},get_image_size_class:function(e){var t=/(?:^|\W)size-(\w+)(?!\w)/g,n=e.className?e.className.match(t):!1;return n?n[0]:""},get_image_attachment_id:function(e){var t=/(?:^|\W)wp-image-(\w+)(?!\w)/g,n=e.className?e.className.match(t):!1;return n?n[0]:""},importFromImage:function(t){var n=e(t),r=_.extend({},this.wp_defaults,{attachment_id:this.get_image_attachment_id(t),caption:e.trim(n.attr("alt")),link_url:t.src,image:{height:parseInt(n.height(),10),width:parseInt(n.width(),10),src:t.src},style:{caption:{show:!1},wrapper:{alignment:"alignnone",width:parseInt(n.width(),10)},image:{size_class:this.get_image_size_class(t)}}}),i=new o({data:r,$editor:this.$editor});return i.render(),n.replaceWith(i.$el),i},importFromImage_prev:function(t){var n=_.extend({},this.defaultData),r={src:t.attr("src"),width:t.width(),height:t.height()},i=e("<a>").attr("href",r.src)[0],o=this.calculateRealSize(r.src),u=t.closest(".ueditor-insert-variant-group"),a=u.attr("class"),f=u.find(".wp-caption-text"),l=f.attr("class"),c=u.find(".uinsert-image-wrapper"),h=c.attr("class"),p=1;i.origin!=window.location.origin&&(n.isLocal=0),this.calculateRealSize(r.src),n.imageThumb=r,n.imageFull={width:o.width,height:o.height,src:r.src};var d=t.parent();d.is("a")&&(n.linkUrl=d.attr("href"),n.linkType="external");var v=t.attr("class");v?(v=v.match(/wp-image-(\d+)/),v?n.attachmentId=v[1]:n.attachmentId=!1):n.attachmentId=!1,n.title=t.attr("title"),_.isEmpty(f.text())||(n.caption=f.html()),p=f.prev(c).length?1:0,f.length===0&&(p=1),u.length?(n.style={caption:{order:p,height:f.css("minHeight")?f.css("minHeight").replace("px",""):f.height(),width_cls:Upfront.Util.grid.derive_column_class(l),left_cls:Upfront.Util.grid.derive_marginleft_class(l),top_cls:Upfront.Util.grid.derive_margintop_class(l),show:f.length},group:{"float":u.css("float"),width_cls:Upfront.Util.grid.derive_column_class(a),left_cls:Upfront.Util.grid.derive_marginleft_class(a),height:u&&u.css("minHeight")?u.css("minHeight").replace("px",""):r.height+f.height(),marginRight:0,marginLeft:0},image:{width_cls:Upfront.Util.grid.derive_column_class(h),left_cls:Upfront.Util.grid.derive_marginleft_class(h),top_cls:Upfront.Util.grid.derive_margintop_class(h),src:"",height:0}},n.variant_id=u.data("variant")):(n.style=Upfront.Content.ImageVariants.first().toJSON(),n.variant_id=n.style.vid);var m=new s({data:n});return m.render(),t.replaceWith(m.$el),m}});return{PostImageInsert_Manager:u}})})(jQuery);