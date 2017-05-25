!function(e){define(["scripts/redactor/ueditor-insert","text!scripts/redactor/ueditor-templates.html"],function(t,n){var i=t.UeditorInsert.extend({type:"embed",className:"ueditor-insert upfront-inserted_embed-wrapper uinsert-drag-handle",defaultData:{code:""},start:function(){var t=this,n=new r({code:this.data.get("code")}),i=new e.Deferred;return n.on("done",function(e){t.data.set({code:e}),n.remove(),i.resolve(this,e)}),n.on("render",function(e,i,r){t.trigger("manager:rendered",n,e,i,r)}),Upfront.Events.on("upfront:element:edit:stop",function(){n.remove(),i.resolve()}),this.get_manager=function(){return n},i},get_manager:function(){return{}},render:function(){var t=this,n=this.data.get("code"),i=e("<div />").append(n);this.$el.empty(),n&&(i.append('<div class="upfront-edit_insert">edit</div>'),this.$el.append(e("<div />").append(i).html()),this.$el.off("click",".upfront-edit_insert").on("click",".upfront-edit_insert",function(e){e.preventDefault(),e.stopPropagation(),t.start()}))},getOutput:function(){return this._get_output()},getSimpleOutput:function(){return this._get_output()},_get_output:function(){var t=this.data.get("code"),n=e("<div />").append('<div class="upfront-inserted_embed">'+t+"</div>");return t?n.html():""},importInserts:function(t,n){var r={};return t.find(".upfront-inserted_embed").each(function(){var t=e(this),n=new i({data:{code:t.html()}});r[n.data.id]=n,n.render(),t.replaceWith(n.$el)}),r}}),r=Backbone.View.extend({className:"upfront-inserts-markup-editor",initialize:function(e){var t=this,n=e&&e.code?e.code:"";require([Upfront.Settings.ace_url],function(){t.render(n)})},render:function(t){var n=new o.Main({code:t}),i=new o.Bar,r=new o.OK;n.render(),i.render(),r.render(),this.$el.empty().append(i.$el).append(r.$el).append(n.$el),e("body").append(this.$el),n.boot_editor(),this.$el.width(e(window).width()-parseInt(e("#page").css("marginLeft"),10)),i.on("insert",function(e){n.insert(e)}),this._main=n,r.on("done",this.done,this),this.trigger("render",n,i,r)},done:function(){if(!this._main||!this._main.get_value)return!1;var e=this._main.get_value();this.trigger("done",e)}}),o={l10n:Upfront.Settings.l10n.markup_embeds,OK:Backbone.View.extend({className:"upfront-inserts-markup-apply",events:{click:"propagate_apply"},propagate_apply:function(e){e.stopPropagation(),e.preventDefault(),this.trigger("done")},render:function(){this.$el.empty().append('<a href="#">'+o.l10n.done+"</a>")}}),Bar:Backbone.View.extend({className:"upfront-inserts-markup-bar",events:{click:"stop_prop","click .inserts-shortcode":"request_shortcode","click .inserts-image":"request_image"},stop_prop:function(e){e.stopPropagation()},render:function(){this.$el.empty().append('<ul><li><a href="#" class="inserts-shortcode">'+o.l10n.insert_shortcode+'</a></li><li><a href="#" class="inserts-image">'+o.l10n.insert_image+"</a></li></ul>")},request_shortcode:function(t){t.stopPropagation(),t.preventDefault();var n=this;Upfront.Popup.open(function(){var t=new o.ShortcodesList;t.render(),t.on("done",function(e){Upfront.Popup.close(e)}),e(this).empty().append(t.$el)},{},"embed-shortcode").done(function(e,t){t&&n.trigger("insert",t)})},request_image:function(e){e.stopPropagation(),e.preventDefault();var t=this;Upfront.Media.Manager.open({multiple_selection:!1,media_type:["images"],hold_editor:!0}).done(function(e,n){if(n){var i=n.models[0],r=i.get("image").src;r=r.replace(document.location.origin,""),t.trigger("insert",r)}})}}),Main:Backbone.View.extend({className:"upfront-embed_editor",events:{click:"stop_prop"},code:"",initialize:function(e){e&&e.code&&(this.code=e.code)},stop_prop:function(e){e.stopPropagation()},render:function(){this.$el.empty().append('<div class="upfront-inserts-markup active"><div class="upfront-inserts-ace"></div></div>').show()},boot_editor:function(){var e=this.$el,t=e.find(".upfront-inserts-ace"),n=(t.html(),ace.edit(t.get(0)));t.data("type");n.getSession().setUseWorker(!1),n.setTheme("ace/theme/monokai"),n.getSession().setMode("ace/mode/html"),n.setShowPrintMargin(!1),n.getSession().setValue(this.code),n.renderer.scrollBar.width=5,n.renderer.scroller.style.right="5px",t.height(e.height()),n.resize(),n.focus(),this.editor=n},insert:function(e){this.editor.insert(e)},get_value:function(){return this.editor.getValue()}}),ShortcodesList:Backbone.View.extend({events:{click:"stop_prop"},stop_prop:function(e){e.stopPropagation()},render:function(){var e=this;this.$el.empty().append(o.l10n.waiting),Upfront.Util.post({action:"upfront_list_shortcodes"}).done(function(t){e.$el.empty().append('<div class="shortcode-types" />').append('<div class="shortcode-list" />'),e.render_types(t.data),e.render_list()})},render_types:function(e){var t=this,n=[{label:o.l10n.select_area,value:0}],i=this.$el.find(".shortcode-types");_.each(_.keys(e),function(e){n.push({label:e,value:e})});var r=new Upfront.Views.Editor.Field.Select({label:"",name:"shortcode-selection",width:"100%",values:n,multiple:!1,change:function(){var n=this.get_value();return n in e&&void t.render_list(e[n])}});r.render(),i.empty().append(r.$el)},render_list:function(e){var t=this,n=this.$el.find(".shortcode-list");return n.empty(),!empty(e)&&void _.each(e,function(e){var e=new o.Shortcode({code:e});e.render(),e.on("done",function(e){t.trigger("done",e)}),n.append(e.$el)})}}),Shortcode:Backbone.View.extend({tagName:"pre",events:{click:"send_shortcode"},initialize:function(e){this.code=e.code},send_shortcode:function(e){return e.stopPropagation(),e.preventDefault(),!!this.code&&void this.trigger("done","["+this.code+"]")},render:function(){this.$el.empty().append("<code>["+this.code+"]</code>")}})};return{EmbedInsert:i}})}(jQuery);