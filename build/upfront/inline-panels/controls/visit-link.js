define(["scripts/upfront/inline-panels/control"],function(e){var t=e.extend({initialize:function(e){this.constructor.__super__.initialize.call(this,e),this.setOptions(this.options.url)},setOptions:function(e){this.url=e,this.icon="visit-link-"+Upfront.Util.guessLinkType(e),this.label=this.getTextByLinkType(Upfront.Util.guessLinkType(e))},clicked:function(e){this.constructor.__super__.clicked.call(this,e),this.url!==""&&Upfront.Util.visitLink(this.url)},setLink:function(e){this.setOptions(e),this.render()},getTextByLinkType:function(e){switch(e){case"unlink":return"Not Linked";case"lightbox":return"Open Lightbox";case"anchor":return"Scroll to Anchor";case"entry":return"Go To Post / Page";case"external":return"Open Ext. Link";case"email":return"Send Email"}}});return t});