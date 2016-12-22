!function(e){define(["scripts/upfront/link-model","text!scripts/upfront/templates/link-panel.html","scripts/upfront/inline-panels/inline-tooltip"],function(t,n,l){var i=function(){var e,t=Upfront.Application.layout.get("regions"),n=[{id:"#page",label:Upfront.Settings.l10n.global.views.back_to_top}];return e=function(t){t.each(function(t){var l=t.get_property_value_by_name("anchor");l&&l.length&&n.push({id:"#"+l,label:l}),t.get("objects")&&(t.get("objects")||{}).each?t.get("objects").each(function(e){var t=e.get_property_value_by_name("anchor");t&&t.length&&n.push({id:"#"+t,label:t})}):t.get("modules")&&e(t.get("modules"))})},t.each(function(t){if("shadow"!=t.get("name")){var l=t.attributes.title,i="#upfront-region-container-"+t.attributes.name;n.push({id:i,label:l}),e(t.get("modules"))}}),n},o=function(){var e=[];return _.each(Upfront.data.ugallery.postTypes,function(t){"attachment"!=t.name&&e.push({name:t.name,label:t.label})}),e},a=function(){var e=[],t=(Upfront.Application.layout||{}).get?Upfront.Application.layout.get("regions"):[];return _.each(t.models,function(t){"lightbox"==t.attributes.sub&&e.push({id:"#"+t.get("name"),label:t.get("title")})}),e},s=Backbone.View.extend({tpl:_.template(n),defaultLinkTypes:{unlink:!0,external:!0,entry:!0,anchor:!0,image:!1,lightbox:!0,email:!0,phone:!0,homepage:!0},events:{"click .js-ulinkpanel-input-entry":"openPostSelector","keydown .js-ulinkpanel-lightbox-input":"onLightboxNameInputChange","click .upfront-apply":"saveControls","blur .js-ulinkpanel-input-external":"onUrlInputBlur","click .upfront-save_settings":"onOkClick","keydown .js-ulinkpanel-input-url.js-ulinkpanel-input-external":"onExternalUrlKeydown","click .link-panel-lightbox-trigger":"visit_lightbox"},className:"ulinkpanel-dark upfront-panels-shadow",visit_lightbox:function(t){t.preventDefault();var n=e(t.target).attr("href");if(n&&""!==n){var l=Upfront.Application.layout.get("regions");if(region=!!l&&l.get_by_name(this.getUrlanchor(n)),region){_.each(l.models,function(e){"lightbox"==e.attributes.sub&&Upfront.data.region_views[e.cid].hide()});var i=Upfront.data.region_views[region.cid];i.show()}}},getUrlanchor:function(t){if("undefined"==typeof t&&(t=e(location).attr("href")),t.indexOf("#")>=0){var n=t.split("#");return n[1]}return!1},initialize:function(e){if(e.linkTypes&&e.linkTypes.image&&e.linkTypes.image===!0&&_.isUndefined(e.imageUrl))throw'Provide "imageUrl" if "linkTypes" option has { image: true } when initializing LinkPanel.';if(this.options=e||{},this.linkTypes=_.extend({},this.defaultLinkTypes,e.linkTypes||{}),this.theme=e.theme||"dark",this.button=e.button||!1,this.title=e.title||Upfront.Settings.l10n.global.content.links_to,"undefined"==typeof e.model)return void Upfront.Util.log("There was no link model, use new linking.");var t=this.get_mapped_url();"anchor"===this.model.get("type")&&null!==this.model.get("url").match(/^#/)&&this.model.set({url:t+this.model.get("url")},{silent:!0}),this.listenTo(this.model,"change:type",this.handleTypeChange)},get_mapped_url:function(){var e=Upfront.mainData.site||document.location.origin,t=Upfront.mainData.siteUrl||document.location.origin,n=t.split("/")[3],l=document.location.pathname;if(e!==t&&n&&""!==n&&l.search(n)>-1){var i=l.split("/");i.shift(),i.shift(),l="/"+i.join("/")}return l.search("edit")>-1?"":e+l},onOkClick:function(){"lightbox"===this.model.get("type")&&""!==this.$el.find(".js-ulinkpanel-lightbox-input").val()?this.createLightBox():(this.close(),this.model.trigger("change"))},onExternalUrlKeydown:function(e){return 13!==e.which||(e.preventDefault&&e.preventDefault(),e.stopPropagation&&e.stopPropagation(),this.onOkClick(e),this.trigger("url:changed"),Upfront.Events.trigger("tooltip:close"),!1)},close:function(){this.trigger("linkpanel:close")},handleTypeChange:function(){"homepage"===this.model.get("type")?this.model.set({url:Upfront.mainData.site},{silent:!0}):this.model.set({url:""},{silent:!0}),this.render(),"entry"===this.model.get("type")&&this.openPostSelector(),"image"===this.model.get("type")&&this.model.set({url:this.options.imageUrl})},getLinkTypeValue:function(e){var t=Upfront.Settings.l10n.global.content;switch(e){case"homepage":return{value:"homepage",label:t.homepage,icon:"link-homepage",tooltip:t.homepage};case"unlink":return{value:"unlink",label:t.no_link,icon:"link-unlink",tooltip:t.unlink};case"external":return{value:"external",label:t.url,icon:"link-external",tooltip:t.external};case"email":return{value:"email",label:t.email,icon:"link-email",tooltip:t.email};case"phone":return{value:"phone",label:t.phone,icon:"link-phone",tooltip:t.phone};case"entry":return{value:"entry",label:t.post_or_page,icon:"link-entry",tooltip:t.post_or_page};case"anchor":return{value:"anchor",label:t.anchor,icon:"link-anchor",tooltip:t.anchor};case"image":return{value:"image",label:t.larger_image,icon:"link-image",tooltip:t.larger_image};case"lightbox":return{value:"lightbox",label:t.lightbox,icon:"link-lightbox",tooltip:t.lightbox}}},openPostSelector:function(e){e&&e.preventDefault(),this.trigger("linkpanel:update:wrapper");var t=this,n={postTypes:o()};Upfront.Views.Editor.PostSelector.open(n).done(function(e){t.model.set({title:e.get("post_title"),url:e.get("permalink"),object:e.get("post_type"),object_id:e.get("ID")}),t.render()})},onLightboxNameInputChange:function(e){13===e.which&&(e.preventDefault(),this.createLightBox(),this.saveControls(),Upfront.Events.trigger("tooltip:close"))},createLightBox:function(){var t=e.trim(this.$(".js-ulinkpanel-lightbox-input").val());return t?(this.model.set({url:"#"+Upfront.Application.LayoutEditor.getLightboxSafeName(t)}),Upfront.Application.LayoutEditor.createLightboxRegion(t),this.model.trigger("change",!0),void this.render()):(Upfront.Views.Editor.notify(Upfront.Settings.l10n.global.views.ltbox_empty_name_nag,"error"),!1)},onUrlInputBlur:function(t){var n=e(t.currentTarget).val().trim();"external"!==this.model.get("type")||n.match(/https?:\/\//)||_.isEmpty(n)||(n="http://"+n),"email"!==this.model.get("type")||n.match(/^mailto:/)||(n="mailto:"+n),"phone"!==this.model.get("type")||n.match(/^tel:/)||(n="tel:"+n,this.model.set({target:"_self"})),this.model.set({url:n}),this.render()},render:function(){if(!this.model)return void this.$el.html("Error occurred, link panel switch to new style.");this.model.get("url")||this.model.get("type")&&"unlink"!==this.model.get("type")||this.model.set({type:"external"},{silent:!0});var e=this.model,t=e.get("title"),n=e.get("url");"undefined"!=typeof t&&t.length>25&&e.set("title",t.substr(0,25)+"..."),"undefined"!=typeof n&&n.length>25&&e.set("url",n.substr(0,25)+"...");var l={title:this.title,link:e.toJSON(),checked:'checked="checked"',lightboxes:a(),button:this.button,type:this.model.get("type")};this.$el.html(this.tpl(l)),this.renderTypeSelect(),"anchor"==this.model.get("type")&&this.renderAnchorSelect(),"lightbox"==this.model.get("type")&&(a().length?(this.renderLightBoxesSelect(),this.$el.find(".js-ulinkpanel-new-lightbox").hide()):this.$el.find(".js-ulinkpanel-new-lightbox").show()),_.contains(["external"],this.model.get("type"))&&this.renderTargetRadio(),this.updateWrapperSize(),this.delegateEvents(),this.renderTooltips()},saveControls:function(){this.$el.find(".lightbox-selector").show(),this.$el.find(".js-ulinkpanel-new-lightbox").hide()},newLightbox:function(){this.$el.find(".lightbox-selector").hide(),this.$el.find(".js-ulinkpanel-new-lightbox").show()},updateWrapperSize:function(){var t=0;this.$el.children().each(function(n,l){var i=0;i=e(l).hasClass("upfront-field-post-pages")?parseInt(e(l).find(".js-ulinkpanel-input-entry").width(),10):e(l).hasClass("upfront-settings-link-target")?0:parseInt(e(l).width(),10),t+=i}),this.$el.css("width",t+10),this.$el.closest(".ulinkpanel-dark").css("width",t+10),this.$el.closest(".redactor_air").css("width",t+10)},getTooltipSelect:function(t){var n=this,l=Upfront.Views.Editor.Field.Select.extend({className:"upfront-field-wrap upfront-field-wrap-select",render:function(){l.__super__.render.apply(this,arguments);var e=this;_.each(this.options.values,function(l){var i=e.$el.find('[value="'+l.value+'"]').parent();n.addTooltip(i,l.tooltip?l.tooltip:l.label,t)})},openOptions:function(t){if(t&&t.stopPropagation(),this.$el.find(".upfront-field-select").hasClass("upfront-field-select-expanded"))return void e(".upfront-field-select-expanded").removeClass("upfront-field-select-expanded");e(".upfront-field-select-expanded").removeClass("upfront-field-select-expanded"),this.$el.find(".upfront-field-select").css("min-width","").css("min-width",this.$el.find(".upfront-field-select").width()),this.$el.find(".upfront-field-select").addClass("upfront-field-select-expanded");var n=this;_.delay(function(){var t=n.$el.parents("#sidebar-ui").length,l=n.$el.parents("#element-settings-sidebar").length,i=46;if(1==t||1==l){var o=n.$el.find(".upfront-field-select-options"),a=o.parent(),s=a.offset().top-e("#element-settings-sidebar").offset().top;s+=i,o.css("width",a.width()+3),o.css("top",s+"px"),Upfront.Util.isRTL()?o.css("right",e(window).width()-a.offset().left-a.width()+"px"):o.css("left",a.offset().left+"px"),o.css("display","block")}},10),e(".sidebar-panel-content, #sidebar-scroll-wrapper").on("scroll",this,this.on_scroll),this.trigger("focus")}});return l},renderTypeSelect:function(){var e=this,t=[];_.each(this.linkTypes,function(n,l){n&&(e.model.get("url")||"unlink"!==l)&&t.push(this.getLinkTypeValue(l))},this);var n=this.getTooltipSelect("side");this.typeSelect=new n({label:"",className:"upfront-link-select",values:t,default_value:this.model.get("type"),change:function(){e.model.set({type:this.get_value()}),Upfront.Events.trigger("tooltip:close")}}),this.typeSelect.render(),this.$el.find(".upfront-settings-link-select").prepend(this.typeSelect.el)},renderTooltips:function(){this.$el.find(".upfront-link-back, .js-ulinkpanel-input-external, .js-ulinkpanel-input-url, .ulinkpanel-entry-browse, .js-ulinkpanel-input-phone, .upfront-home-link, .js-ulinkpanel-input-url, .anchor-selector, .js-ulinkpanel-input-email, .upfront-create-new-lightbox").utooltip({fromTitle:!0});var e=this.model.get("type"),t=this.getLinkTypeValue(e);this.$el.find(".upfront-link-select .upfront-field-select").utooltip({fromTitle:!1,content:t.tooltip});var n,l=this.model.get("target");n="_blank"===l?Upfront.Settings.l10n.global.content.blank_label:Upfront.Settings.l10n.global.content.self_label,this.$el.find(".uf-link-target-select .upfront-field-select").utooltip({fromTitle:!1,content:n})},addTooltip:function(t,n,l){e(t).utooltip({fromTitle:!1,content:n,panel:l})},renderTargetRadio:function(){var e=this,t=this.getTooltipSelect("normal");this.targetRadio=new t({label:"",className:"uf-link-target-select",default_value:this.model.get("target")||"_self",values:[{label:Upfront.Settings.l10n.global.content.blank,value:"_blank",tooltip:Upfront.Settings.l10n.global.content.blank_label},{label:Upfront.Settings.l10n.global.content.self,value:"_self",tooltip:Upfront.Settings.l10n.global.content.self_label}],change:function(){e.model.set({target:this.get_value()}),e.renderTooltips()}}),this.targetRadio.render(),this.$el.find(".upfront-settings-link-target").append(this.targetRadio.el)},renderAnchorSelect:function(){var e=this.model,t=this.get_mapped_url(),n=[{label:"Choose Anchor...",value:""}];_.each(i(),function(e){n.push({label:e.label,value:t+e.id})});var l=this.model.get("url");l=l?l:"",l=l.indexOf("#")!==-1?l:"",this.anchorSelect=new Upfront.Views.Editor.Field.Select({label:"",values:n,default_value:l,change:function(){var t=this.get_value();null!==document.location.pathname.match(/^\/create_new\//)&&(t="#"+t.split("#")[1]),e.set({url:t})}}),this.anchorSelect.render(),this.$el.find(".anchor-selector").append(this.anchorSelect.el)},renderLightBoxesSelect:function(){var t=this.model,n=this,l=[];_.each(a()||[],function(e){l.push({label:e.label,value:e.id})});var i=this.model.get("url");i=i?i:"",i=i.match(/^#/)?i:"",this.lightboxSelect=new Upfront.Views.Editor.Field.Select({label:"",className:"upfront-lightbox-select",values:l,default_value:i,change:function(){t.set({url:this.get_value()}),e(".link-panel-lightbox-trigger").attr("href",this.get_value())}}),this.lightboxSelect.render(),this.$el.find(".lightbox-selector").append(this.lightboxSelect.el),this.$el.find(".upfront-lightbox-select ul").prepend('<li class="upfront-field-select-option upfront-create-new-lightbox" title="'+Upfront.Settings.l10n.global.content.create_lightbox+'"><label>'+Upfront.Settings.l10n.global.content.new_lightbox+"</label></li>"),l.length>4&&this.$el.find(".upfront-lightbox-select ul").addClass("upfront-field-select-options-scrollbar"),this.$el.find(".upfront-create-new-lightbox").on("click",function(e){n.newLightbox()})},delegateEvents:function(e){this.typeSelect&&this.typeSelect.delegateEvents(),this.anchorSelect&&this.anchorSelect.delegateEvents(),this.lightboxSelect&&this.lightboxSelect.delegateEvents(),Backbone.View.prototype.delegateEvents.call(this,e)}});return s})}(jQuery);