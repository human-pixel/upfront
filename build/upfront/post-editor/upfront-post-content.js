(function(e){define(["upfront/post-editor/upfront-post-edit"],function(t){var n=function(){this.parts={title:{replacements:["%title%","%permalink%"],editable:["%title%"]},contents:{replacements:["%contents%","%excerpt%"],editable:["%contents%","%excerpt%"]},excerpt:{replacements:["%excerpt%"],editable:["%excerpt%"]},author:{replacements:["%author%","%author_url%","%author_meta%"],editable:["%author%"],withParameters:["%author_meta_","%avatar_"]},categories:{replacements:["%categories%"],editable:[]},tags:{replacements:["%tags%"],editable:[]},comments_count:{replacements:["%comments_count%"],editable:[]},featured_image:{replacements:["%image%","%permalink%"],editable:["%image%"]},date:{replacements:["%date%","%date_iso%"],editable:["%date%"]},update:{replacements:["%update%","%date_iso%"],editable:["%update%"]},author_gravatar:{replacements:["%avatar_%"],editable:["%avatar%"],withParameters:["%avatar_"]}},this.markup=function(e,t,n,r){var i=this,s=r&&r.extraClasses?r.extraClasses:"",o=r&&r.attributes?r.attributes:{},u="";_.each(o,function(e,t){u+=t+'="'+e+'" '}),this.parts[e]&&this.parts[e].replacements&&_.each(this.parts[e].replacements,function(r){var o=t[r];i.parts[e].editable.indexOf(r)!==-1&&(o='<div class="upfront-content-marker upfront-content-marker-'+e+" "+s+'" '+u+">"+o+"</div>"),n=n.replace(r,o)});if(this.parts[e]&&this.parts[e].withParameters){var a=this.parts[e].withParameters;a&&_.each(a,function(e){var r=new RegExp(e+"[^%]+%","gm"),i=r.exec(n);_.each(i,function(e){n=typeof t[e]=="undefined"?"":n.replace(e,t[e])})})}return n}},r=new n,i=function(e){this.post=e.post,this.currentData={title:this.post.get("post_title"),content:this.post.get("post_content"),excerpt:this.post.get("post_excerpt"),author:this.post.get("post_author"),date:this.post.get("post_date")},this.inserts=this.post.meta.getValue("_inserts_data")||{},_.extend(this,Backbone.Events)},s=Backbone.View.extend({events:{"click a":"preventLinkNavigation",dblclick:"triggerEditor"},type:"",canTriggerEdit:!1,initialize:function(e){this.parent=e.parent,this.parentModel=e.parentModel,this.$("a").data("bypass",!0),this.init&&this.init()},triggerEditor:function(){if(!Upfront.Application.user_can("EDIT"))return;if(this.parent._editing)return;if(Upfront.Application.is_builder())return;if(!this.canTriggerEdit)return;this.parent.triggerEditors(),this.focus()},editContent:function(){},stopEditContent:function(){},focus:function(){},preventLinkNavigation:function(e){e.preventDefault()}});i.prototype={_editing:!1,_viewInstances:[],partView:{title:s.extend({type:"title",canTriggerEdit:!0,init:function(){this.listenTo(this.parent,"change:title",this.titleChanged)},editContent:function(){s.prototype.editContent.call(this);var t=this.$(".upostdata-part");if(t.length){var n=this._findDeep(t);e.trim(n.text())==e.trim(t.text())?this.$title=n:this.$title=t;var r=this.$title.parent();r.is("a")&&r.replaceWith(this.$title),this.$title.attr("contenteditable",!0).off("blur").on("blur",_.bind(this.blur,this)).off("keyup").on("keyup",_.bind(this.keyup,this)).off("keypress").on("keypress",_.bind(this.keypress,this))}},stopEditContent:function(){this.$title.length&&this.$title.attr("contenteditable",!1).off("blur").off("keyup").off("keypress")},blur:function(){this.parent.titleBlurred(),this.parent.currentData.title=this.$title.text(),this.parent.trigger("change:title",this.parent.currentData.title,this)},keyup:function(e){this.parent.currentData.title=this.$title.text()},keypress:function(e){e.which==13&&e.preventDefault()},focus:function(){var e=this.$title.get(0);e.focus(),this.parent.setSelection(e,!0)},titleChanged:function(e,t){if(t==this)return;this.$title.text(e)},_findDeep:function(e){var t=e.children(":not(script, style, object, iframe, embed)");return t.length>0?this._findDeep(t.first()):e}}),content:s.extend({type:"content",canTriggerEdit:!0,init:function(){this.listenTo(this.parent,"change:content",this.contentChanged),this.on("publish draft auto-draft",this.updateContent)},editContent:function(){s.prototype.editContent.call(this),this.$content=this.$(".upostdata-part"),this.$content.find(".upfront-indented_content").length&&(this.$content=this.$content.find(".upfront-indented_content"));if(this.$content.length){var e=this.model.get_property_value_by_name("content")=="excerpt",t=e?this.parent.post.get("post_excerpt"):this.parent.post.get("post_content"),n=e?this.parent.getExcerptEditorOptions():this.parent.getContentEditorOptions();this.$content.html(t).ueditor(n),this.editor=this.$content.data("ueditor"),this.$content.off("blur").on("blur",_.bind(this.blur,this))}},stopEditContent:function(){this.editor.stop(),this.$content.length&&this.$content.off("blur")},blur:function(){var e=this.$content.html();this.parent.trigger("change:content",e,this)},updateContent:function(){var t=this.model.get_property_value_by_name("content")=="excerpt",n;this.$content.find(".upfront-inline-panel").remove(),this.$content.find(".ueditor-insert-remove").remove(),this.$content.find(".upfront-inserted_image-wrapper").each(function(){var t=e(this),n=t.find(".post-images-shortcode").length?t.find(".post-images-shortcode"):t.find(".post-images-shortcode-wp"),r=e.trim(n.html().replace(/(\r\n|\n|\r)/gm,""));t.replaceWith(r)}),n=e.trim(this.editor.getValue()),n=n.replace(/(\n)*?<br\s*\/?>\n*/g,"<br/>"),t?this.parent.currentData.excerpt=n:this.parent.currentData.content=n,this.parent.currentData.inserts=this.editor.getInsertsData()},focus:function(){var e=this.$content.get(0);e.focus(),this.parent.post.is_new&&this.parent.setSelection(e,!0)},contentChanged:function(e,t){if(t==this)return;this.$content.redactor("code.set",e)}}),author:s.extend({type:"author",events:function(){return _.extend({},s.prototype.events,{"click .upostdata-part":"editAuthor"})},init:function(){this.listenTo(this.parent,"change:author",this.authorChanged)},editContent:function(){s.prototype.editContent.call(this),this.$author=this.$(".upostdata-part")},stopEditContent:function(){this.parent.removeAuthorSelect()},editAuthor:function(e){if(!this.$author||!this.$author.length)return;e.preventDefault();var t=this.parent.getAuthorSelect(),n=this.$author.position();t.$el.is(":visible")?t.close():(t.fromView=this,t.$el.appendTo(this.$author),t.open(),t.$el.css({top:0,left:n.left,display:"block"}))},authorChanged:function(e,t){}}),gravatar:s.extend({type:"gravatar",events:function(){return _.extend({},s.prototype.events,{"click .upostdata-part":"editAuthor"})},init:function(){i.prototype.partView.author.prototype.init.call(this)},editContent:function(){i.prototype.partView.author.prototype.editContent.call(this)},stopEditContent:function(){i.prototype.partView.author.prototype.stopEditContent.call(this)},editAuthor:function(e){i.prototype.partView.author.prototype.editAuthor.call(this,e)},authorChanged:function(e,t){}}),date_posted:s.extend({type:"date_posted",events:function(){return _.extend({},s.prototype.events,{"click .upostdata-part":"editDate","click .ueditor-action-pickercancel":"editDateCancel","click .ueditor-action-pickerok":"editDateOk"})},init:function(){this.listenTo(this.parent,"change:date",this.dateChanged),this.listenTo(this.parent,"bar:date:updated",this.dateChanged)},editContent:function(){s.prototype.editContent.call(this),this.$date=this.$(".upostdata-part");if(this.$date.length){var t=this,n={},r=[],i=this.parent.currentData.date,o=this.getDateFormat();n.minutes=_.range(0,60),n.hours=_.range(0,24),n.currentHour=i.getHours(),n.currentMinute=i.getHours(),this.datepickerTpl=_.template(e(Upfront.data.tpls.popup).find("#datepicker-tpl").html()),this.$el.prepend(this.datepickerTpl(n)),this.datepicker=this.$(".upfront-bar-datepicker"),this.datepicker.datepicker({changeMonth:!0,changeYear:!0,dateFormat:o,onChangeMonthYear:function(e,n,r){var i=r.selectedDay,s=new Date(e,n-1,i,t.parent.currentData.date.getHours(),t.parent.currentData.date.getMinutes());t.datepicker.datepicker("setDate",s)}})}},stopEditContent:function(){this.datepicker.parent().remove()},editDate:function(e){if(!this.$date||!this.$date.length)return;e.preventDefault();var t=this.$date.offset(),n=this.$date.height(),r=this.parent.currentData.date;this.datepicker.parent().show().offset({top:t.top+n,left:t.left});if(r){var i=r.getHours(),s=r.getMinutes();this.datepicker.datepicker("setDate",r),this.$(".ueditor-hours-select").val(i),this.$(".ueditor-minutes-select").val(s)}},getDateFormat:function(){var e=this.parentModel.get_property_value_by_name("date_posted_format");return Upfront.Util.date.php_format_to_js(e?e:Upfront.data.date.format)},editDateCancel:function(e){e.preventDefault(),this.$(".upfront-date_picker").hide()},editDateOk:function(e){e.preventDefault();var t=this.datepicker.datepicker("getDate"),n=this.datepicker.parent(),r=n.find(".ueditor-hours-select").val(),i=n.find(".ueditor-minutes-select").val();t.setHours(r),t.setMinutes(i),this.dateOk(t),this.$(".upfront-date_picker").hide()},dateOk:function(e){this.parent.currentData.date=e,this.parent.trigger("change:date",e,this)},dateChanged:function(e,t){}}),featured_image:s.extend({type:"featured_image",events:function(){return _.extend({},s.prototype.events,{"click .upost_thumbnail_changer":"editThumb"})},editContent:function(){s.prototype.editContent.call(this),this.$featured=this.$el;if(this.$featured.length){var e=this.parent.post.meta.getValue("_thumbnail_id"),t=this.parentModel.get_breakpoint_property_value("row",!0),n=t*Upfront.Settings.LayoutEditor.Grid.baseline;this.$featured.addClass("ueditor_thumb ueditable").css({position:"relative","min-height":n+"px","max-height":n+"px","overflow-y":"hidden",width:"100%"}).append('<div class="upost_thumbnail_changer" ><div>'+Upfront.Settings.l10n.global.content.trigger_edit_featured_image+"</div></div>").find("img").css({"z-index":"2",position:"relative"})}},stopEditContent:function(){},editThumb:function(e){if(!this.$featured||!this.$featured.length)return;e.preventDefault();var t=this,n=this.$featured.find("img"),r=new Upfront.Views.Editor.Loading({loading:Upfront.Settings.l10n.global.content.starting_img_editor,done:Upfront.Settings.l10n.global.content.here_we_are,fixed:!1}),i=this.parent.post.meta.getValue("_thumbnail_id"),s=this.parentModel.get_property_value_by_name("full_featured_image");if(!i||s=="1")return t.openImageSelector();r.render(),this.$featured.append(r.$el),t.getImageInfo(t.parent.post).done(function(e){r.$el.remove(),t.openImageEditor(!1,e,t.parent.post.id)})},getImageInfo:function(t){var n=this,r=t.meta.get("_thumbnail_data"),i=t.meta.get("_thumbnail_id"),s=e.Deferred(),o=this.$featured.find("img");if(!r||!_.isObject(r.get("meta_value"))||r.get("meta_value").imageId!=i.get("meta_value")){if(!i)return!1;Upfront.Views.Editor.ImageEditor.getImageData([i.get("meta_value")]).done(function(e){var t=e.data.images,n={},r=0;_.each(t,function(e,t){n=e,r=t}),s.resolve({src:n.medium?n.medium[0]:n.full[0],srcFull:n.full[0],srcOriginal:n.full[0],fullSize:{width:n.full[1],height:n.full[2]},size:{width:o.width(),height:o.height()},position:{top:0,left:0},rotation:0,id:r})})}else{var u=r.get("meta_value"),a=o.width()/u.cropSize.width;s.resolve({src:u.src,srcFull:u.srcFull,srcOriginal:u.srcOriginal,fullSize:u.fullSize,size:{width:u.imageSize.width*a,height:u.imageSize.height*a},position:{top:u.imageOffset.top*a,left:u.imageOffset.left*a},rotation:u.rotation,id:u.imageId})}return s.promise()},openImageSelector:function(t){var n=this,r=this.parentModel.get_property_value_by_name("full_featured_image");Upfront.Views.Editor.ImageSelector.open().done(function(i){var s={},o=0;_.each(i,function(e,t){s=e,o=t});var u={src:s.medium?s.medium[0]:s.full[0],srcFull:s.full[0],srcOriginal:s.full[0],fullSize:{width:s.full[1],height:s.full[2]},size:s.medium?{width:s.medium[1],height:s.medium[2]}:{width:s.full[1],height:s.full[2]},position:!1,rotation:0,id:o};e("<img>").attr("src",u.srcFull).load(function(){Upfront.Views.Editor.ImageSelector.close();if(r=="1"){var i=n.$featured.find("img"),s=e('<img style="z-index:2;position:relative">');n.parent.post.meta.add([{meta_key:"_thumbnail_id",meta_value:o},{meta_key:"_thumbnail_data",meta_value:""}],{merge:!0}),i.length?(i.replaceWith(s),i=s):i=s.appendTo(n.$(".ueditor_thumb")),i.attr("src",u.srcFull);return}n.openImageEditor(!0,u,t)})})},openImageEditor:function(t,n,r){var i=this,s=this.$el,o=this.parentModel.get_breakpoint_property_value("row",!0),u=o*Upfront.Settings.LayoutEditor.Grid.baseline,a=_.extend({},n,{element_id:this.model.get_element_id()+"_post_"+r,maskOffset:s.offset(),maskSize:{width:s.width(),height:u},setImageSize:t,extraButtons:[{id:"image-edit-button-swap",text:Upfront.Settings.l10n.global.content.swap_image,callback:function(e,t){t.cancel(),i.openImageSelector(r)}}]});if(!Upfront.Application.user_can("RESIZE"))return!1;setTimeout(function(){e("#image-edit-button-align").hide()},100),Upfront.Views.Editor.ImageEditor.open(a).done(function(t){var n=i.post,r=s.find("img"),o=e('<img style="z-index:2;position:relative">');i.parent.post.meta.add([{meta_key:"_thumbnail_id",meta_value:t.imageId},{meta_key:"_thumbnail_data",meta_value:t}],{merge:!0}),r.length?(r.replaceWith(o),r=o):r=o.appendTo(s),e("#image-edit-button-align").show(),r.attr("src",t.src)})}}),tags:s.extend({type:"tags",editContent:function(){s.prototype.editContent.call(this)},stopEditContent:function(){},blur:function(){},focus:function(){}}),categories:s.extend({type:"categories",editContent:function(){s.prototype.editContent.call(this)},stopEditContent:function(){},blur:function(){},focus:function(){}})},triggerEditors:function(){if(!Upfront.Application.user_can("EDIT"))return;var t=e(Upfront.Settings.LayoutEditor.Selectors.main);if(this._editing)return;this.prepareBox(),_.each(this._viewInstances,function(e){e.editContent()}),Upfront.Application.sidebar.visible&&Upfront.Application.sidebar.toggleSidebar(),this._editing=!0,t.addClass("upfront-editing-post-content"),this.trigger("edit:start"),Upfront.Events.trigger("post:content:edit:start",this)},stopEditors:function(){$main=e(Upfront.Settings.LayoutEditor.Selectors.main);if(!this._editing)return;_.each(this._viewInstances,function(e){e.stopEditContent()}),Upfront.Application.sidebar.visible||Upfront.Application.sidebar.toggleSidebar(),this.box=!1,this._editing=!1,$main.removeClass("upfront-editing-post-content"),this.trigger("edit:stop"),Upfront.Events.trigger("post:content:edit:stop",this)},setView:function(e,t,n,r){if(_.isUndefined(this.partView[e]))return!1;var i=new this.partView[e]({el:t,model:n,parentModel:r,parent:this});return this._viewInstances.push(i),i},prepareBox:function(){var n=this,r=e(Upfront.Settings.LayoutEditor.Selectors.main);if(this.box)return;return this.box=new t.Box({post:this.post}),this.bindBarEvents(),this.box.render(),r.append(this.box.$el),_.delay(_.bind(this.box.setPosition,this.box),10),this},bindBarEvents:function(){var e=this,t=["cancel","publish","draft","trash","auto-draft"];_.each(t,function(t){e.listenTo(e.box,t,function(){_.each(e._viewInstances,function(e){e.trigger(t)});var n={};if(t=="publish"||t=="draft"||t=="auto-draft")n.title=e.currentData.title,n.content=e.currentData.content,n.excerpt=e.currentData.excerpt,n.author=e.currentData.author,n.date=e.currentData.date,n.inserts=e.currentData.inserts;e.trigger(t,n)})}),this.listenTo(e.box.scheduleSection,"date:updated",e.updateDateFromBar)},getExcerptEditorOptions:function(){return{linebreaks:!1,autostart:!0,focus:!1,pastePlainText:!0,inserts:[],airButtons:["bold","italic"],placeholder:"<p>Excerpt here</p>"}},getContentEditorOptions:function(){return{linebreaks:!1,replaceDivs:!1,autostart:!0,focus:!1,inserts:["postImage","embed"],insertsData:this.inserts,pastePlainText:!1,placeholder:"<p>Content here</p>"}},titleBlurred:function(){this.post.is_new&&!this.box.urlEditor.hasDefinedSlug&&!_.isEmpty(this.currentData.title)&&(this.post.set("post_name",this.currentData.title.toLowerCase().replace(/\ /g,"-")),this.box.urlEditor.render())},getAuthorSelect:function(){if(this.authorSelect)return this.authorSelect;var e=this,t=Upfront.data.ueditor.authors,n=[];return _.each(t,function(e){n.push({value:e.ID,name:e.display_name})}),this.authorSelect=new u({options:n}),this.authorSelect.on("select",function(t){e.changeAuthor(t,this.fromView)}),this.authorSelect},removeAuthorSelect:function(){if(!this.authorSelect)return;this.authorSelect.remove(),this.authorSelect=!1},changeAuthor:function(e,t){this.currentData.author=e,this.trigger("change:author",e,t)},getAuthorData:function(e){var t=-1,n=!1,r=Upfront.data.ueditor.authors;while(++t<r.length&&!n)r[t].ID==e&&(n=r[t]);return n},updateDateFromBar:function(e){this.currentData.date=e,this.trigger("bar:date:updated",e)},setSelection:function(e,t){var n,r;document.createRange?(n=document.createRange(),n.selectNodeContents(e),t||n.collapse(!1),r=window.getSelection(),r.removeAllRanges(),r.addRange(n)):document.selection&&(n=document.body.createTextRange(),n.moveToElementText(e),selectall||n.collapse(!1),n.select())}};var o=Backbone.View.extend(_.extend({},i.prototype,{events:{"click a":"preventLinkNavigation","click .upfront-content-marker-author":"editAuthor","click .upfront-content-marker-date":"editDate","click .upost_thumbnail_changer":"editThumb","click .ueditor-action-pickercancel":"editDateCancel","click .ueditor-action-pickerok":"editDateOk"},initialize:function(t){this.post=t.post,this.postView=t.postView,this.triggeredBy=t.triggeredBy||this.$(".upfront-content-marker").first(),this.parts={},this.partOptions=t.partOptions,this.postAuthor=this.post.get("post_author"),this.authorTpl=t.authorTpl,this.contentMode=t.content_mode,this.inserts=this.post.meta.getValue("_inserts_data")||{},this.$el.addClass("clearfix").css("padding-bottom","60px"),this.rawContent=t.rawContent,this.rawExcerpt=t.rawExcerpt,this.$("a").data("bypass",!0);var n=this.$el.closest(".ui-draggable");n.length&&(cancel=n.draggable("disable")),this.$el.closest(".upfront-module-view").append("<div class='editing-overlay'></div>"),this.$el.closest(".upfront-module").addClass("editing-content"),e(".upfront-module").not(".editing-content").addClass("fadedOut").fadeTo("slow",.3),e(".change_feature_image").addClass("ueditor-display-block"),this.prepareEditableRegions(),this.prepareBox()},title_blurred:function(){this.post.is_new&&!this.box.urlEditor.hasDefinedSlug&&!_.isEmpty(this.parts.titles.html())&&(this.post.set("post_name",this.parts.titles.html().toLowerCase().replace(/\ /g,"-")),this.box.urlEditor.render())},prepareEditableRegions:function(){var t=this;this.parts.titles=this.$(".upfront-content-marker-title");if(this.parts.titles.length){var n=this.parts.titles.parent();n.is("a")&&n.replaceWith(this.parts.titles),this.onTitleEdited=_.bind(this.titleEdited,this),this.parts.titles.attr("contenteditable",!0).off("blur").on("blur",_.bind(t.title_blurred,t))}this.parts.contents=this.$(".upfront-content-marker-contents");if(this.parts.contents.length){var r=this.contentMode=="post_excerpt",i=r?this.rawExcerpt:this.rawContent,s=r?this.getExcerptEditorOptions():this.getContentEditorOptions();this.onContentsEdited=_.bind(this.contentEdited,this),this.editors=[],this.parts.contents.html(i).ueditor(s),this.parts.contents.on("keyup",this.onContentsEdited),this.parts.contents.each(function(){t.editors.push(e(this).data("ueditor"))}),this.currentContent=this.parts.contents[0]}this.parts.authors=this.$(".upfront-content-marker-author");if(this.parts.authors.length){var t=this,o=Upfront.data.ueditor.authors,a=[];_.each(o,function(e){a.push({value:e.ID,name:e.display_name})}),this.authorSelect=new u({options:a}),this.authorSelect.on("select",function(e){t.changeAuthor(e)}),this.$el.append(this.authorSelect.$el)}this.parts.author_gravatars=this.$(".upfront-content-marker-author-gravatar");if(this.parts.authors.length){var t=this,o=Upfront.data.ueditor.authors,a=[];_.each(o,function(e){a.push({value:e.ID,name:e.display_name})}),this.authorSelect=new u({options:a}),this.authorSelect.on("select",function(e){t.changeAuthor(e)}),this.$el.append(this.authorSelect.$el)}this.parts.dates=this.$(".upfront-content-marker-date");if(this.parts.dates.length){var t=this,f={},a=[],l=this.post.get("post_date"),c=this.getDateFormat();f.minutes=_.range(0,60),f.hours=_.range(0,24),f.currentHour=l.getHours(),f.currentMinute=l.getHours(),this.datepickerTpl=_.template(e(Upfront.data.tpls.popup).find("#datepicker-tpl").html()),this.$el.prepend(this.datepickerTpl(f)),this.datepicker=this.$(".upfront-bar-datepicker"),this.datepicker.datepicker({changeMonth:!0,changeYear:!0,dateFormat:c,onChangeMonthYear:function(n,r,i){var s=i.selectedDay,o=new Date(t.parts.dates.text()),u=new Date(n,r-1,s,o.getHours(),o.getMinutes());t.parts.dates.html(e.datepicker.formatDate(c,u)),t.post.set("post_date",u),t.datepicker.datepicker("setDate",u)},onSelect:function(e){t.parts.dates.html(e)}})}this.parts.featured=this.$(".upfront-content-marker-featured_image");if(this.parts.featured.length){var h=this.post.meta.getValue("_thumbnail_id"),p=this.partOptions.featured_image&&this.partOptions.featured_image.height?this.partOptions.featured_image.height:60;this.parts.featured.addClass("ueditor_thumb ueditable").css({position:"relative","min-height":p+"px","max-height":p+"px","overflow-y":"hidden",width:"100%"}).append('<div class="upost_thumbnail_changer" ><div>'+Upfront.Settings.l10n.global.content.trigger_edit_featured_image+"</div></div>").find("img").css({"z-index":"2",position:"relative"})}this.parts.tags=this.$(".upfront-postpart-tags"),this.parts.categories=this.$(".upfront-postpart-categories"),setTimeout(function(){t.triggeredBy.length&&t.focus(t.triggeredBy,!0)},200)},editThumb:function(t){t.preventDefault();var n=this,r=e(t.target),i=this.postId,s=r.parent().find("img"),o=new Upfront.Views.Editor.Loading({loading:Upfront.Settings.l10n.global.content.starting_img_editor,done:Upfront.Settings.l10n.global.content.here_we_are,fixed:!1}),u=this.post.meta.getValue("_thumbnail_id"),a=this.postView.property("full_featured_image");if(!u||a=="1")return n.openImageSelector();o.render(),r.parent().append(o.$el),n.getImageInfo(n.post).done(function(e){o.$el.remove(),n.openImageEditor(!1,e,n.post.id)})},getImageInfo:function(t){var n=this,r=t.meta.get("_thumbnail_data"),i=t.meta.get("_thumbnail_id"),s=e.Deferred(),o=this.$(".ueditor_thumb").find("img");if(!r||!_.isObject(r.get("meta_value"))||r.get("meta_value").imageId!=i.get("meta_value")){if(!i)return!1;Upfront.Views.Editor.ImageEditor.getImageData([i.get("meta_value")]).done(function(e){var t=e.data.images,n={},r=0;_.each(t,function(e,t){n=e,r=t}),s.resolve({src:n.medium?n.medium[0]:n.full[0],srcFull:n.full[0],srcOriginal:n.full[0],fullSize:{width:n.full[1],height:n.full[2]},size:{width:o.width(),height:o.height()},position:{top:0,left:0},rotation:0,id:r})})}else{var u=r.get("meta_value"),a=o.width()/u.cropSize.width;s.resolve({src:u.src,srcFull:u.srcFull,srcOriginal:u.srcOriginal,fullSize:u.fullSize,size:{width:u.imageSize.width*a,height:u.imageSize.height*a},position:{top:u.imageOffset.top*a,left:u.imageOffset.left*a},rotation:u.rotation,id:u.imageId})}return s.promise()},openImageSelector:function(t){var n=this,r=this.postView.property("full_featured_image");Upfront.Views.Editor.ImageSelector.open().done(function(i){var s={},o=0;_.each(i,function(e,t){s=e,o=t});var u={src:s.medium?s.medium[0]:s.full[0],srcFull:s.full[0],srcOriginal:s.full[0],fullSize:{width:s.full[1],height:s.full[2]},size:s.medium?{width:s.medium[1],height:s.medium[2]}:{width:s.full[1],height:s.full[2]},position:!1,rotation:0,id:o};e("<img>").attr("src",u.srcFull).load(function(){Upfront.Views.Editor.ImageSelector.close();if(r=="1"){var i=n.$(".ueditor_thumb img"),s=e('<img style="z-index:2;position:relative">');n.post.meta.add([{meta_key:"_thumbnail_id",meta_value:o},{meta_key:"_thumbnail_data",meta_value:""}],{merge:!0}),i.length?(i.replaceWith(s),i=s):i=s.appendTo(n.$(".ueditor_thumb")),i.attr("src",u.srcFull);return}n.openImageEditor(!0,u,t)})})},openImageEditor:function(t,n,r){var i=this,s=this.$(".ueditor_thumb"),o=this.partOptions.featured_image&&this.partOptions.featured_image.height?this.partOptions.featured_image.height:60;editorOptions=_.extend({},n,{element_id:"post_"+r,maskOffset:s.offset(),maskSize:{width:s.width(),height:o},setImageSize:t,extraButtons:[{id:"image-edit-button-swap",text:Upfront.Settings.l10n.global.content.swap_image,callback:function(e,t){t.cancel(),i.openImageSelector(r)}}]});if(!Upfront.Application.user_can("RESIZE"))return!1;setTimeout(function(){e("#image-edit-button-align").hide()},100),Upfront.Views.Editor.ImageEditor.open(editorOptions).done(function(t){var n=i.post,r=s.find("img"),o=e('<img style="z-index:2;position:relative">');i.post.meta.add([{meta_key:"_thumbnail_id",meta_value:t.imageId},{meta_key:"_thumbnail_data",meta_value:t}],{merge:!0}),r.length?(r.replaceWith(o),r=o):r=o.appendTo(s),e("#image-edit-button-align").show(),r.attr("src",t.src)})},focus:function(t,n){var r="upfront-content-marker-";typeof t.length=="undefined"&&(t=e(t));if(t.hasClass(r+"title")||t.hasClass(r+"contents"))t.get(0).focus(),this.setSelection(t[0],n)},changeAuthor:function(e){var t=this,n=t.getAuthorData(e);this.$(".upfront-content-marker-author").html(n.display_name),this.postAuthor=e},editAuthor:function(t){t.preventDefault();var n=e(t.target);this.authorSelect.open(),this.authorSelect.$el.css({top:t.offsetY+50,left:t.offsetX+n.width(),display:"block"})},editDate:function(t){t.preventDefault();var n=e(t.target);this.datepicker.is(":visible")&&this.datepicker.offset({top:n.offset().top+30,left:n.offset().left+n.width()});var r=this.selectedDate||this.post.get("post_date");this.datepicker.parent().show().offset({top:n.offset().top+30,left:n.offset().left+n.width()});if(r){var i=r.getHours(),s=r.getMinutes();this.datepicker.datepicker("setDate",r),this.$(".ueditor-hours-select").val(i),this.$(".ueditor-minutes-select").val(s)}},getDateFormat:function(){return Upfront.Util.date.php_format_to_js(this.partOptions.date&&this.partOptions.date.format?this.partOptions.date.format:Upfront.data.date.format)},updateDateParts:function(t){this.parts.dates.html(e.datepicker.formatDate(this.getDateFormat(),t))},editDateCancel:function(){this.updateDateParts(this.selectedDate||this.post.get("post_date")),this.$(".upfront-date_picker").hide()},editDateOk:function(){var e=this.datepicker.datepicker("getDate"),t=this.datepicker.parent(),n=t.find(".ueditor-hours-select").val(),r=t.find(".ueditor-minutes-select").val();e.setHours(n),e.setMinutes(r),this.dateOk(e),this.$(".upfront-date_picker").hide()},dateOk:function(e){this.selectedDate=e},updateDateFromBar:function(e){this.updateDateParts(e),this.dateOk(e)},editTags:function(e){this.box.editTaxonomies(e,"post_tag")},editCategories:function(e){this.box.editTaxonomies(e,"category")},getAuthorData:function(e){var t=-1,n=!1,r=Upfront.data.ueditor.authors;while(++t<r.length&&!n)r[t].ID==e&&(n=r[t]);return n},updateStatus:function(e){this.postStatus=e},updateVisibility:function(e,t){this.postVisibility=e,this.postPassword=t},titleEdited:function(e){var t=e.target.innerHTML;this.parts.titles.each(function(){this!=e.target&&(this.innerHTML=t)})},contentEdited:function(t){var n=t.currentTarget.innerHTML;this.parts.contents.each(function(){this!=t.currentTarget&&e(this).redactor("set",n,!1)}),this.currentContent=t.currentTarget},prepareBox:function(){var e=this;if(this.box)return;return this.box=new t.Box({post:this.post}),this.bindBarEvents(),this.box.render(),this.$el.append(this.box.$el),_.delay(_.bind(this.box.setPosition,this.box),10),this.box.toggleRegionClass(!0),this},bindBarEvents:function(){var t=this,n=["cancel","publish","draft","trash","auto-draft"];_.each(n,function(n){t.listenTo(t.box,n,function(){var r={};if("publish"===n||"draft"===n||"auto-draft"===n){t.parts.titles&&(r.title=e.trim(t.parts.titles.text()));if(t.currentContent){var i=e(t.currentContent).data("ueditor");"publish"===n&&(t.$el.find(".upfront-inline-panel").remove(),t.$el.find(".ueditor-insert-remove").remove()),t.$(".upfront-inserted_image-wrapper").each(function(){var t=e(this),n=t.find(".post-images-shortcode").length?t.find(".post-images-shortcode"):t.find(".post-images-shortcode-wp"),r=e.trim(n.html().replace(/(\r\n|\n|\r)/gm,""));t.replaceWith(r)}),r.content=e.trim(i.getValue()),r.content=r.content.replace(/(\n)*?<br\s*\/?>\n*/g,"<br/>"),r.inserts=i.getInsertsData(),r.author=t.postAuthor}t.selectedDate&&(r.date=t.selectedDate),t.postStatus&&(r.status=t.postStatus),t.postVisibility&&(r.visibility=t.postVisibility),t.postPassword&&(r.pass=t.postPassword),t.postView&&(t.postView||{}).markup&&(t.postView.markup=!1)}t.trigger(n,r)})}),this.listenTo(t.box.scheduleSection,"date:updated",t.updateDateFromBar).listenTo(t.box.statusSection,"status:change",t.updateStatus).listenTo(t.box.visibilitySection,"visibility:change",t.updateVisibility),Upfront.Events.on("editor:post:tax:updated",_.bind(t.refreshTaxonomies,t))},refreshTaxonomies:function(){if(!this.parts.tags.length&&!this.parts.categories.length)return;if(this.taxLoading)return;var e=this,t=this.postView.partOptions||{},n=this.postView.partTemplates||{},r={action:"content_part_markup",post_id:this.post.get("ID"),parts:[],templates:{}};this.parts.tags.length&&(r.parts.push({slug:"tags",options:t.tags||{}}),r.templates.tags=n.tags||""),this.parts.categories.length&&(r.parts.push({slug:"categories",options:t.categories||{}}),r.templates.categories=n.categories||""),r.parts=JSON.stringify(r.parts),setTimeout(function(){e.taxLoading=Upfront.Util.post(r).done(function(t){var n=e.postView.partContents;_.extend(n.replacements,t.data.replacements),_.extend(n.tpls,t.data.tpls),e.parts.tags.html(t.data.tpls.tags),e.parts.categories.html(t.data.tpls.categories),e.taxLoading=!1})},300)},stop:function(){this.onTitleEdited&&this.parts.titles.off("change",this.onTitleEdited),this.editors&&_.each(this.editors,function(e){e.stop()});var e=this.$el.closest(".ui-draggable");e.length&&(cancel=e.draggable("enable")),Upfront.Application.sidebar.visible||Upfront.Application.sidebar.toggleSidebar(),this.$("a").data("bypass",!1)},preventLinkNavigation:function(e){e.preventDefault()}})),u=Backbone.View.extend({tpl:!1,className:"ueditor-select ueditor-popup upfront-ui",events:{"blur input":"close","click .ueditor-select-option":"select"},initialize:function(e){this.opts=e.options,this.render()},render:function(){this.tpl||(this.tpl=this.getTpl()),this.tpl&&this.$el.html(this.tpl({options:this.opts}))},open:function(){var t=this;this.tpl||this.render(),this.$el.css("display","inline-block"),this.delegateEvents(),e(document).one("click",function(n){var r=t.$el.parent().length?t.$el.parent():t.$el,i=e(n.target);!i.is(r[0])&&!i.closest(r[0]).length&&t.close()})},close:function(e){var t=this;setTimeout(function(){t.$el.hide()},200)},select:function(t){t.preventDefault();var n=e(t.target).data("id");this.trigger("select",n),this.$("input").val("value"),this.$el.hide()},getTpl:function(){return this.tpl?this.tpl:Upfront.data&&Upfront.data.tpls?_.template(e(Upfront.data.tpls.popup).find("#microselect-tpl").html()):!1}});return{PostContentEditor:i,PostContentEditorLegacy:o,getMarkupper:function(){return r}}})})(jQuery);