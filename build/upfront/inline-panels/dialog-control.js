(function(e){define(["scripts/upfront/inline-panels/control","text!scripts/upfront/inline-panels/templates/panel-control-template.html"],function(t,n){var r=Upfront.mainData.l10n.image_element,i=t.extend({multiControl:!0,hideOnClick:!0,events:{click:"onClickControl","click button":"onClickOk"},initialize:function(e){var t=this;this.options=e||{},this.listenTo(Upfront.Events,"dialog-control:open",function(e){if(t===e)return;t.close()})},render:function(){t.prototype.render.call(this,arguments);var i=this,s;return this.$el.hasClass("uimage-control-panel-item")||this.$el.addClass("uimage-control-panel-item"),this.view&&(this.view.render(),this.view.delegateEvents()),this.panel||(s=e(_.template(n,{l10n:r.template,hideOkButton:this.hideOkButton})),s.addClass("inline-panel-control-dialog"),s.addClass("inline-panel-control-dialog-"+this.id),this.$el.append(s),s.find(".uimage-control-panel-content").html("").append(this.view.$el),this.panel=s,e(document).on("click.dialog-control."+i.cid,i,i.onDocumentClick)),this},remove:function(){e(document).off("click.dialog-control."+this.cid)},onDocumentClick:function(t){var n=e(t.target),r=t.data;n.closest("#page").length&&n[0]!==r.el&&!n.closest(r.el).length&&r.isopen&&r.close()},onClickControl:function(t){this.$el.siblings(".upfront-control-dialog-open").removeClass("upfront-control-dialog-open");if(!e(t.target).closest(".upfront-icon").length||e(t.target).closest("upfront-icon-media-label-delete").length){t.stopPropagation();return}t.preventDefault(),this.clicked(t),this.$el.siblings(".upfront-control-dialog-open").removeClass("upfront-control-dialog-open"),this.isopen?this.close():this.open()},onClickOk:function(e){e.preventDefault(),this.trigger("panel:ok",this.view)},bindEvents:function(){this.panel.find("button").on("click",function(){})},open:function(){return this.isopen=!0,this.$el.addClass("upfront-control-dialog-open"),this.trigger("panel:open"),Upfront.Events.trigger("dialog-control:open",this),this},close:function(){return this.isopen=!1,this.$el.removeClass("upfront-control-dialog-open"),this.trigger("panel:close"),this}});return i})})(jQuery);