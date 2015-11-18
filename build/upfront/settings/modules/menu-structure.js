(function(e){define(["elements/upfront-newnavigation/js/menu-util","scripts/upfront/settings/modules/menu-structure/menu-item","text!scripts/upfront/settings/modules/menu-structure/menu-structure.tpl"],function(t,n,r){var i=Upfront.Settings.l10n.preset_manager,s=Backbone.View.extend({className:"settings_module menu_structure_module clearfix",handlesSaving:!0,events:{"mouseenter .menu-item-header":"enableSorting","mouseleave .menu-item-header":"disableSortingOnHeaderLeave","click .add-menu-item":"addItem"},initialize:function(e){var t=this;this.options=e||{},this.listenTo(this.model.get("properties"),"change",function(){t.setup(),t.render()}),Upfront.Events.on("menu_element:edit",function(e){t.setup(),t.render()}),this.setup()},setup:function(){var e=this;this.menuId=this.model.get_property_value_by_name("menu_id"),this.menuItems=[],this.menuItemViews=[],this.menu=t.getMenuById(this.menuId);if(this.menuId===!1)return;Upfront.Util.post({action:"upfront_new_load_menu_array",data:this.menuId}).success(function(t){e.menuItems=t.data||[],_.each(e.menuItems,function(t){e.menuItemViews.push(new n({model:new Backbone.Model(t),menuId:e.menuId}))}),e.render()}).error(function(e){Upfront.Util.log("Error loading menu items")})},render:function(){var e=this,t;this.$el.html(r);if(this.menuId===!1)return;t=this.$el.find(".menu-structure-body"),_.each(this.menuItemViews,function(e){t.append(e.render().el)})},enableSorting:function(t){var n=this.$el.find(".menu-structure-module-item"),r=e(t.target).parent(),i=!1,s=this,o;n.addClass("menu-structure-sortable-item"),n.each(function(){if(i)return;if(!_.isUndefined(o)&&e(this).data("menuItemDepth")<=o){i=!0;return}if(!_.isUndefined(o)&&e(this).data("menuItemDepth")>o){e(this).addClass("hovered-item-group-member"),e(this).removeClass("menu-structure-sortable-item");return}_.isUndefined(o)&&e(this).is(r)&&(o=e(this).data("menuItemDepth"),e(this).addClass("hovered-item-group-member"),e(this).removeClass("menu-structure-sortable-item"))}),this.$el.find(".hovered-item-group-member").wrapAll('<div class="menu-structure-sortable-item"></div>'),this.$el.sortable({axis:"y",items:".menu-structure-sortable-item",start:function(e,t){s.sortingInProggres=!0,s.watchItemDepth(t.item)},stop:function(e,t){s.stopWatchingItemDepth(t.item),s.updateItemsPosition(t.item),s.sortingInProggres=!1}})},disableSortingOnHeaderLeave:function(){if(this.sortingInProggres===!0)return;this.disableSorting()},disableSorting:function(){var e=this.$el.find(".menu-structure-module-item"),t=this.$el.find(".hovered-item-group-member");t.unwrap(),t.removeClass("hovered-item-group-member"),e.removeClass("menu-structure-sortable-item"),this.$el.sortable("destroy")},watchItemDepth:function(e){var t=this,n;this.$el.on("mousemove",function(r){if(_.isUndefined(n)){n=r.pageX;return}if(Math.abs(n-r.pageX)<15)return;t.updateSortableDepth(n,r.pageX,e),n=r.pageX})},updateSortableDepth:function(e,t,n){var r=n.hasClass("menu-structure-module-item")?n.data("menuItemDepth"):n.children().first().data("menu-item-depth"),i=n.prev().data("menu-item-depth"),s=n.nextAll().not(".ui-sortable-placeholder").first().data("menu-item-depth");e>t&&this.decreaseGroupDepth(r,i,s,n),e<t&&this.increaseGroupDepth(r,i,s,n)},decreaseGroupDepth:function(t,n,r,i){var s=this;if(n<t&&r<t||n===t&&r<t||_.isUndefined(r)||r<t){if(i.hasClass("menu-structure-module-item")){if(i.data("menuItemDepth")===0)return;this.decreaseItemDepth(i);return}if(i.children().first().data("menuItemDepth")===0)return;i.children().each(function(){s.decreaseItemDepth(e(this))})}},increaseGroupDepth:function(t,n,r,i){var s=this;if(n>=t||n===t&&r<t){if(i.hasClass("menu-structure-module-item")){this.increaseItemDepth(i);return}i.children().each(function(){s.increaseItemDepth(e(this))})}},decreaseItemDepth:function(e){e.removeClass("menu-structure-item-depth-"+e.data("menuItemDepth")),e.data("menu-item-depth",e.data("menuItemDepth")-1),e.addClass("menu-structure-item-depth-"+e.data("menuItemDepth"))},increaseItemDepth:function(e){e.removeClass("menu-structure-item-depth-"+e.data("menuItemDepth")),e.data("menuItemDepth",e.data("menuItemDepth")+1),e.addClass("menu-structure-item-depth-"+e.data("menuItemDepth"))},stopWatchingItemDepth:function(){this.$el.off("mousemove")},flattenItem:function(e){var t=this,n=[e];return e.sub&&_.each(e.sub,function(e){n=_.union(n,t.flattenItem(e))}),n},updateItemsPosition:function(){var t=this,n=[];_.each(this.menuItems,function(e){n=_.union(n,t.flattenItem(e))});var r=this.$el.find(".menu-structure-module-item"),i=[],s=[0],o=0,u=1,a=0,f,l;r.each(function(){var t=_.findWhere(n,{"menu-item-object-id":e(this).data("menuItemObjectId")}),r=e(this).data("menuItemDepth");if(r>a)s.push(o),a+=1;else if(r!==a&&r<a){f=a-r;for(l=0;l<f;l++)s=_.initial(s);a=r}i.push(_.extend(t,{"menu-item-parent-id":_.last(s)||0,"menu-item-position":u})),u+=1,o=t["menu-item-object-id"]}),Upfront.Util.post({action:"upfront_update_menu_items",data:{items:i,menuId:this.menuId}}).fail(function(e){Upfront.Util.log("Failed saving menu items.")})},addItem:function(){var e=this,t={"menu-item-object":"custom","menu-item-parent-id":0,"menu-item-position":1,"menu-item-target":"","menu-item-title":"New Item","menu-item-type":"custom","menu-item-url":""};Upfront.Util.post({action:"upfront_update_single_menu_item",menuId:this.menuId,menuItemData:t}).done(function(r){t["menu-item-db-id"]=r.data.itemId,t["menu-item-object-id"]=r.data.itemId+"",e.menuItemViews.unshift(new n({model:new Backbone.Model(t),menuId:e.menuId})),e.render(),Upfront.Util.post({action:"upfront_update_single_menu_item",menuId:e.menuId,menuItemData:t})}).fail(function(e){Upfront.Util.log("Failed saving menu items.")})},save_fields:function(){}});return s})})(jQuery);