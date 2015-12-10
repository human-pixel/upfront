(function(e){define(["scripts/upfront/link-model","text!scripts/upfront/templates/link-panel.html"],function(t,n){var r=function(){var e=Upfront.Application.layout.get("regions"),t=[{id:"#page",label:Upfront.Settings.l10n.global.views.back_to_top}],n;return n=function(e){e.each(function(e){var r=e.get_property_value_by_name("anchor");r&&r.length&&t.push({id:"#"+r,label:r}),e.get("objects")?e.get("objects").each(function(e){var n=e.get_property_value_by_name("anchor");n&&n.length&&t.push({id:"#"+n,label:n})}):e.get("modules")&&n(e.get("modules"))})},e.each(function(e){n(e.get("modules"))}),t},i=function(){var e=[];return _.each(Upfront.data.ugallery.postTypes,function(t){t.name!="attachment"&&e.push({name:t.name,label:t.label})}),e},s=function(){var e=[],t=Upfront.Application.layout.get("regions");return _.each(t.models,function(t){t.attributes.sub=="lightbox"&&e.push({id:"#"+t.get("name"),label:t.get("title")})}),e},o=Backbone.View.extend({tpl:_.template(n),defaultLinkTypes:{unlink:!0,external:!0,entry:!0,anchor:!0,image:!1,lightbox:!0,email:!0,homepage:!0},events:{"click .js-ulinkpanel-input-entry":"openPostSelector","keydown .js-ulinkpanel-lightbox-input":"onLightboxNameInputChange","blur .js-ulinkpanel-input-external":"onUrlInputBlur","click .upfront-save_settings":"onOkClick","click .link-panel-lightbox-trigger":"visit_lightbox"},className:"ulinkpanel-dark",visit_lightbox:function(t){t.preventDefault();var n=e(t.target).attr("href");if(!n||n==="")return;var r=Upfront.Application.layout.get("regions");region=r?r.get_by_name(this.getUrlanchor(n)):!1;if(region){_.each(r.models,function(e){e.attributes.sub=="lightbox"&&Upfront.data.region_views[e.cid].hide()});var i=Upfront.data.region_views[region.cid];i.show()}},getUrlanchor:function(t){if(typeof t=="undefined")var t=e(location).attr("href");if(t.indexOf("#")>=0){var n=t.split("#");return n[1]}return!1},initialize:function(e){if(e.linkTypes&&e.linkTypes.image&&e.linkTypes.image===!0&&_.isUndefined(e.imageUrl))throw'Provide "imageUrl" if "linkTypes" option has { image: true } when initializing LinkPanel.';var t=this;this.options=e||{},this.linkTypes=_.extend({},this.defaultLinkTypes,e.linkTypes||{}),this.theme=e.theme||"dark",this.button=e.button||!1,this.title=e.title||Upfront.Settings.l10n.global.content.links_to;if(typeof e.model=="undefined"){Upfront.Util.log("There was no link model, use new linking.");return}var n=document.location.origin+document.location.pathname;this.model.get("type")==="anchor"&&this.model.get("url").match(/^#/)!==null&&this.model.set({url:n+this.model.get("url")},{silent:!0}),this.listenTo(this.model,"change:type",this.handleTypeChange)},onOkClick:function(){this.model.get("type")=="lightbox"&&this.$el.find(".js-ulinkpanel-lightbox-input").val()!==""?this.createLightBox():this.close(),this.trigger("change",this.model),this.model.trigger("change")},close:function(){this.trigger("linkpanel:close")},handleTypeChange:function(){this.model.get("type")==="homepage"?this.model.set({url:Upfront.mainData.site},{silent:!0}):this.model.set({url:""},{silent:!0}),this.render(),this.model.get("type")==="entry"&&this.openPostSelector(),this.model.get("type")==="image"&&this.model.set({url:this.options.imageUrl})},getLinkTypeValue:function(e){var t=Upfront.Settings.l10n.global.content;switch(e){case"homepage":return{value:"homepage",label:t.homepage};case"unlink":return{value:"unlink",label:t.no_link};case"external":return{value:"external",label:t.url};case"email":return{value:"email",label:t.email};case"entry":return{value:"entry",label:t.post_or_page};case"anchor":return{value:"anchor",label:t.anchor};case"image":return{value:"image",label:t.larger_image};case"lightbox":return{value:"lightbox",label:t.lightbox}}},openPostSelector:function(e){e&&e.preventDefault();var t=this,n={postTypes:i()};Upfront.Views.Editor.PostSelector.open(n).done(function(e){t.model.set({url:e.get("permalink"),object:e.get("post_type"),object_id:e.get("ID")}),t.render()})},onLightboxNameInputChange:function(e){e.which==13&&(e.preventDefault(),this.createLightBox())},createLightBox:function(){var t=e.trim(this.$(".js-ulinkpanel-lightbox-input").val());if(!t)return Upfront.Views.Editor.notify(Upfront.Settings.l10n.global.views.ltbox_empty_name_nag,"error"),!1;this.model.set({url:"#"+Upfront.Application.LayoutEditor.createLightboxRegion(t)}),this.render()},onUrlInputBlur:function(t){var n=e(t.currentTarget).val().trim();this.model.get("type")==="external"&&!n.match(/https?:\/\//)&&(n="http://"+n),this.model.get("type")==="email"&&!n.match(/^mailto:/)&&(n="mailto:"+n),this.model.set({url:n}),this.render()},render:function(){var e=this;if(!this.model){this.$el.html("Error occurred, link panel switch to new style.");return}var t={title:this.title,link:this.model.toJSON(),checked:'checked="checked"',lightboxes:s(),button:this.button,type:this.model.get("type")};this.$el.html(this.tpl(t)),this.renderTypeSelect(),this.model.get("type")=="anchor"&&this.renderAnchorSelect(),this.model.get("type")=="lightbox"&&s()&&this.renderLightBoxesSelect(),_.contains(["external","entry","homepage"],this.model.get("type"))&&this.renderTargetRadio(),this.delegateEvents()},renderTypeSelect:function(){var e=this,t=[];_.each(this.linkTypes,function(e,n){if(!e)return;t.push(this.getLinkTypeValue(n))},this),this.typeSelect=new Upfront.Views.Editor.Field.Select({label:"",values:t,default_value:this.model.get("type"),change:function(){e.model.set({type:this.get_value()})}}),this.typeSelect.render(),this.$el.find("form").prepend(this.typeSelect.el)},renderTargetRadio:function(){var e=this;this.targetRadio=new Upfront.Views.Editor.Field.Radios({label:"Target:",default_value:this.model.get("target")||"_self",layout:"horizontal-inline",values:[{label:"blank",value:"_blank"},{label:"self",value:"_self"}],change:function(){e.model.set({target:this.get_value()})}}),this.targetRadio.render(),this.$el.find("form").append(this.targetRadio.el)},renderAnchorSelect:function(){var e=this.model,t=document.location.origin+document.location.pathname,n=[{label:"Choose Anchor...",value:""}];_.each(r(),function(e){n.push({label:e.label,value:t+e.id})});var i=this.model.get("url");i=i?i:"",i=i.indexOf("#")!==-1?i:"",this.anchorSelect=new Upfront.Views.Editor.Field.Select({label:"",values:n,default_value:i,change:function(){e.set({url:this.get_value()})}}),this.anchorSelect.render(),this.$el.find(".anchor-selector").append(this.anchorSelect.el)},renderLightBoxesSelect:function(){var t=this.model,n=[{label:"Choose Lightbox...",value:""}];_.each(s()||[],function(e){n.push({label:e.label,value:e.id})});var r=this.model.get("url");r=r?r:"",r=r.match(/^#/)?r:"",this.lightboxSelect=new Upfront.Views.Editor.Field.Select({label:"",values:n,default_value:r,change:function(){t.set({url:this.get_value()}),e(".link-panel-lightbox-trigger").attr("href",this.get_value())}}),this.lightboxSelect.render(),this.$el.find(".lightbox-selector").append(this.lightboxSelect.el)},delegateEvents:function(e){this.typeSelect&&this.typeSelect.delegateEvents(),this.anchorSelect&&this.anchorSelect.delegateEvents(),this.lightboxSelect&&this.lightboxSelect.delegateEvents(),Backbone.View.prototype.delegateEvents.call(this,e)}});return o})})(jQuery);