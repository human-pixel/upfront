define(["text!scripts/upfront/settings/modules/menu-structure/menu-item-editor.tpl"],function(e){var t=function(){var e=Upfront.Application.layout.get("regions"),t=[],n;return n=function(e){e.each(function(e){var r=e.get_property_value_by_name("anchor");r&&r.length&&t.push({id:"#"+r,label:r}),e.get("objects")?e.get("objects").each(function(e){var n=e.get_property_value_by_name("anchor");n&&n.length&&t.push({id:"#"+n,label:n})}):e.get("modules")&&n(e.get("modules"))})},e.each(function(e){n(e.get("modules"))}),t},n=function(){var e=[];return _.each(Upfront.data.ugallery.postTypes,function(t){t.name!="attachment"&&e.push({name:t.name,label:t.label})}),e},r=Backbone.View.extend({className:"menu-item-editor",events:{"click .menu-item-entry-input":"showPagePostSelector"},initialize:function(e){this.options=e||{},this.type=Upfront.Util.guessLinkType(this.model.get("menu-item-url")),this.type==="unlink"&&(this.type="external")},render:function(){return console.log("rendering",this.type),this.$el.html(_.template(e,{title:this.model.get("menu-item-title"),type:this.type,url:this.model.get("menu-item-url")})),this.renderTypeSelect(),this},renderTypeSelect:function(){var e=this,t=[];_.each(["external","entry","anchor","lightbox","email"],function(e){t.push(this.getLinkTypeValue(e))},this),this.typeSelect=new Upfront.Views.Editor.Field.Select({label:"",values:t,default_value:this.type||"external",change:function(t){e.onTypeChange(t)}}),this.typeSelect.render(),this.$el.find(".item-links-to-label").after(this.typeSelect.el),this.type==="anchor"&&this.renderAnchorSelect()},getLinkTypeValue:function(e){var t=Upfront.Settings.l10n.global.content;switch(e){case"unlink":return{value:"unlink",label:t.no_link};case"external":return{value:"external",label:t.url};case"email":return{value:"email",label:"Email address"};case"entry":return{value:"entry",label:t.post_or_page};case"anchor":return{value:"anchor",label:t.anchor};case"image":return{value:"image",label:t.larger_image};case"lightbox":return{value:"lightbox",label:t.lightbox}}},showPagePostSelector:function(e){e&&e.preventDefault();var t=this,r={postTypes:n()};Upfront.Views.Editor.PostSelector.open(r).done(function(e){t.model.set({"menu-item-url":e.get("permalink")}),t.saveItem(),t.render()})},saveItem:function(){Upfront.Util.post({action:"upfront_update_single_menu_item",menuId:this.options.menuId,menuItemData:this.model.toJSON()})},onTypeChange:function(e){this.model.set({"menu-item-url":""}),this.type=e,this.render(),this.type==="entry"&&this.showPagePostSelector()},renderAnchorSelect:function(){var e=this,n=[{label:"Choose Anchor...",value:""}];_.each(t(),function(e){n.push({label:e.label,value:e.id})});var r=this.model.get("menu-item-url");r=r?r:"",r=r.match(/^#/)?r:"",this.anchorSelect=new Upfront.Views.Editor.Field.Select({label:"",values:n,default_value:r,change:function(){e.model.set({"menu-item-url":this.get_value()}),e.saveItem()}}),this.anchorSelect.render(),this.$el.find(".anchor-selector").append(this.anchorSelect.el)}});return r});