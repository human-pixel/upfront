define(["scripts/upfront/inline-panels/control"],function(i){var t=Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.content:Upfront.mainData.l10n.global.content,n=i.extend({className:"upfront-inline-panel-item visit-link-control",initialize:function(i){this.options=i||{},this.constructor.__super__.initialize.call(this,i),this.linkLabel=_.extend({unlink:t.not_linked,lightbox:t.open_lightbox,anchor:t.scroll_to_anchor,entry:t.go_to_post,external:t.open_ext_link,email:t.send_email,phone:t.dial_number},i.linkLabel||{}),this.setOptions(this.options.url,this.options.type),this.hideIfUnlink=i.hideIfUnlink===!0,this.setOptions(this.options.url)},setOptions:function(i,t){var n=t?t:Upfront.Util.guessLinkType(i);this.url=i,this.icon="visit-link-"+n,this.label=this.getTextByLinkType(n)},clicked:function(i){this.constructor.__super__.clicked.call(this,i),""!==this.url&&Upfront.Util.visitLink(this.url)},setLink:function(i,t){this.setOptions(i,t),this.render()},on_render:function(){this.hideIfUnlink&&"unlink"==Upfront.Util.guessLinkType(this.url)?this.$el.hide():this.$el.is(":visible")||this.$el.show()},getTextByLinkType:function(i){return this.linkLabel[i]}});return n});