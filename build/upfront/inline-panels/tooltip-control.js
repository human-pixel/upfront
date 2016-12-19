!function(t){define(["scripts/upfront/inline-panels/item","scripts/upfront/inline-panels/control"],function(e,i){var n=Upfront.mainData.l10n.image_element,o=i.extend({multiControl:!0,events:{click:"onClickControl","click .upfront-inline-panel-item":"selectItem"},initialize:function(){var e=this;t(document).click(function(i){var n=t(i.target);n.closest("#page").length&&n[0]!==e.el&&!n.closest(e.el).length&&e.isOpen&&e.close()})},onClickControl:function(t){this.isDisabled||(t.preventDefault(),this.clicked(t),this.$el.siblings(".upfront-control-dialog-open").removeClass("upfront-control-dialog-open"),this.isOpen?this.close():this.open())},open:function(){this.isOpen=!0,this.$el.addClass("upfront-control-dialog-open"),this.trigger("panel:open"),this.hideParentItems(),this.updateWidth()},close:function(){this.isOpen=!1,this.$el.removeClass("upfront-control-dialog-open"),this.trigger("panel:close"),this.showParentItems();var t=this.$el.closest(".image-sub-control").children(".upfront-inline-panel-item");this.$el.closest(".image-sub-control").css("width",28*t.length+2)},hideParentItems:function(){this.$el.parent().closest(".image-sub-control").find(".upfront-inline-panel-item").not(".uimage-caption-control-item, .uimage-caption-control-item .upfront-inline-panel-item").hide()},showParentItems:function(){this.$el.parent().closest(".image-sub-control").find(".upfront-inline-panel-item").not(".uimage-caption-control-item, .uimage-caption-control-item .upfront-inline-panel-item").show()},render:function(){e.prototype.render.call(this,arguments);var i,n=this.$(".uimage-caption-control"),o=this,s="";this.item_count=0,this.$el.hasClass("uimage-caption-control-item")||this.$el.addClass("uimage-caption-control-item"),"undefined"!=typeof this.wrapperClass&&(s=this.wrapperClass),n.length||(n=t('<div class="uimage-caption-control inline-panel-control-dialog '+s+'"></div>'),this.$el.append(n)),_.each(this.sub_items,function(t,e){e===o.selected?t.setIsSelected(!0):t.setIsSelected(!1),t.render(),t.$el.find("i").addClass("upfront-icon-region-caption"),n.append(t.$el),o.listenTo(t,"click",o.selectItem),o.item_count++}),i=this.sub_items[this.selected],i&&("undefined"!=typeof i.icon?this.$el.children("i").addClass("upfront-icon-region-"+i.icon):"undefined"!=typeof i.label&&this.$el.find(".tooltip-content").append(": "+i.label))},get_selected_item:function(){return this.selected},selectItem:function(e){var i=!1,n=t(e.target).is("i")?t(e.target):t(e.target).find("i");return _.each(this.sub_items,function(o,s){n.hasClass("upfront-icon-region-"+o.icon)&&(i=s),i||t(e.target).closest(".upfront-inline-panel-item").attr("id")!==o.id||(i=s)}),"back"===i?void this.close():void(i&&(this.selected=i,this.render(),this.trigger("select",i)))},updateWidth:function(){this.$el.closest(".image-sub-control").css("width",28*this.item_count+2),this.$el.find(".uimage-caption-control").css("width",28*this.item_count+2)},setDisabled:function(t){this.isDisabled=t,t?this.tooltip=n.ctrl.caption_position_disabled:this.tooltip=n.ctrl.caption_display}});return o})}(jQuery);