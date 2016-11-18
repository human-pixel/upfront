!function(t){define(["scripts/upfront/inline-panels/control","text!scripts/upfront/inline-panels/templates/link-control-template.html"],function(n,e){var i=Upfront.mainData.l10n.image_element,o=n.extend({multiControl:!0,hideOnClick:!0,events:{click:"onClickControl","click .upfront-apply":"close","click .upfront-link-back":"close"},initialize:function(t){var n=this;this.options=t||{},this.listenTo(Upfront.Events,"dialog-control:open",function(t){n!==t&&n.close()})},render:function(){n.prototype.render.call(this,arguments);var o,l=this;this.$el.hasClass("link-control-panel-item")||this.$el.addClass("link-control-panel-item"),this.options.firstLevel!==!0||this.$el.hasClass("link-control-panel-first-level")||this.$el.addClass("link-control-panel-first-level"),this.view&&(this.view.render(),this.view.delegateEvents()),this.panel||(o=t(_.template(e,{l10n:i.template,hideOkButton:this.hideOkButton})),o.addClass("inline-panel-control-dialog"),o.addClass("inline-panel-control-dialog-"+this.id),this.$el.append(o),o.find(".link-control-panel-content").html("").append(this.view.$el),this.panel=o,t(document).on("click.dialog-control."+l.cid,l,l.onDocumentClick));var s='<span class="upfront-control-arrow"></span>';return this.$el.find(".link-control-panel").prepend(s),this},remove:function(){t(document).off("click.dialog-control."+this.cid)},onDocumentClick:function(n){var e=t(n.target),i=n.data;e.closest("#page").length&&e[0]!==i.el&&!e.closest(i.el).length&&i.isopen&&i.close()},onClickControl:function(n){return this.$el.siblings(".upfront-control-dialog-open").removeClass("upfront-control-dialog-open"),!t(n.target).closest(".upfront-icon").length||t(n.target).closest("upfront-icon-media-label-delete").length?void n.stopPropagation():(n.preventDefault(),this.clicked(n),this.$el.siblings(".upfront-control-dialog-open").removeClass("upfront-control-dialog-open"),void(this.isopen?this.close():this.open()))},onClickOk:function(t){t.preventDefault(),this.trigger("panel:ok",this.view)},bindEvents:function(){this.panel.find("button").on("click",function(){})},open:function(){this.isopen=!0,this.$el.addClass("upfront-control-dialog-open"),this.trigger("panel:open"),Upfront.Events.trigger("dialog-control:open",this),this.update_position();var n=this.$el.closest(".image-sub-control");if(n.removeClass("upfront-panels-shadow"),this.updateWrapperSize(),this.$el.is("#link")){var e=this.$el.closest(".upfront-region-container"),i=t(".upfront-region-container").not(".upfront-region-container-shadow").last();i.get(0)==e.get(0)&&e.addClass("upfront-last-region-padding")}return this},close:function(){if(!this.isopen)return this;this.isopen=!1,this.$el.removeClass("upfront-control-dialog-open"),this.trigger("panel:close"),this.$el.closest(".upfront-region-container").removeClass("upfront-last-region-padding");var t=this.$el.closest(".image-sub-control");return t.hasClass("upfront-panels-shadow")||t.addClass("upfront-panels-shadow"),this},update_position:function(){var t=this.$el.prevAll().length-1,n=28*t,e=Upfront.Util.isRTL()?"right":"left";this.$el.find(".link-control-panel-content").css(e,-n),this.$el.find(".ulinkpanel-dark").css("minWidth",this.$el.parent().width()),this.$el.find(".upfront-control-arrow").css(e,-n)},updateWrapperSize:function(){var n=0;this.$el.find(".ulinkpanel-dark").children().each(function(e,i){var o=t(i).hasClass("upfront-settings-link-target")?0:parseInt(t(i).width());n+=o}),this.$el.find(".ulinkpanel-dark").css("width",n+10)}});return o})}(jQuery);