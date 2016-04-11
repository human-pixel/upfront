!function(e){var i=Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.views:Upfront.mainData.l10n.global.views;define(["scripts/upfront/bg-settings/mixins"],function(t){var s=Upfront.Views.Editor.Settings.Item.extend(_.extend({},t,{group:!1,initialize:function(e){var t=this,s=function(){var e=this.get_value();this.model.set_breakpoint_property(this.property_name,e)},r={transition:new Upfront.Views.Editor.Field.Select({model:this.model,label:i.slider_transition,property:"background_slider_transition",use_breakpoint_property:!0,default_value:"crossfade",icon_class:"upfront-region-field-icon",values:[{label:i.slide_down,value:"slide-down",icon:"bg-slider-slide-down"},{label:i.slide_up,value:"slide-up",icon:"bg-slider-slide-up"},{label:i.slide_left,value:"slide-left",icon:"bg-slider-slide-left"},{label:i.slide_right,value:"slide-right",icon:"bg-slider-slide-right"},{label:i.crossfade,value:"crossfade",icon:"bg-slider-crossfade"}],change:s,rendered:function(){this.$el.addClass("uf-bgsettings-slider-transition")}}),rotate:new Upfront.Views.Editor.Field.Checkboxes({model:this.model,property:"background_slider_rotate",use_breakpoint_property:!0,default_value:!0,layout:"horizontal-inline",multiple:!1,values:[{label:i.autorotate_each+" ",value:!0}],change:function(){var e=this.get_value();this.property.set({value:e?!0:!1})},rendered:function(){this.$el.addClass("uf-bgsettings-slider-rotate")}}),rotate_time:new Upfront.Views.Editor.Field.Number({model:this.model,property:"background_slider_rotate_time",use_breakpoint_property:!0,default_value:5,min:1,max:60,step:1,suffix:"sec",change:s,rendered:function(){this.$el.addClass("uf-bgsettings-slider-time")}}),control:new Upfront.Views.Editor.Field.Radios({model:this.model,property:"background_slider_control",use_breakpoint_property:!0,default_value:"always",layout:"horizontal-inline",values:[{label:i.always_show_ctrl,value:"always"},{label:i.show_ctrl_hover,value:"hover"}],change:s,rendered:function(){this.$el.addClass("uf-bgsettings-slider-control")}})};this.$el.addClass("uf-bgsettings-item uf-bgsettings-slideritem"),e.fields=_.map(r,function(e){return e}),this.slides_item=new n({model:this.model,title:i.slides_order+":"}),_.isUndefined(e.slides_item_el)?this.on("panel:set",function(){t.panel.settings.push(t.slides_item),t.slides_item.panel=t.panel,t.slides_item.trigger("panel:set")}):(this.slides_item.render(),e.slides_item_el.append(this.slides_item.$el)),this.on("show",function(){var e=this.model.get_breakpoint_property_value("background_slider_images",!0);e||t.upload_slider_images(),t.slides_item.trigger("show")}),this.on("hide",function(){t.slides_item.trigger("hide")}),this.bind_toggles(),this.constructor.__super__.initialize.call(this,e)},upload_slider_images:function(){var e=this;Upfront.Views.Editor.ImageSelector.open({multiple:!0}).done(function(i){var t=[];_.each(i,function(e,i){i=parseInt(i,10),i&&t.push(i)}),e.model.set_breakpoint_property("background_slider_images",t),e.slides_item.update_slider_slides(),Upfront.Views.Editor.ImageSelector.close()})}})),n=Upfront.Views.Editor.Settings.Item.extend(_.extend({},t,{initialize:function(i){var t=this;this.$el.on("click",".upfront-region-bg-slider-add-image",function(e){e.preventDefault(),e.stopPropagation(),Upfront.Views.Editor.ImageSelector.open({multiple:!0}).done(function(e){var i=_.clone(t.model.get_breakpoint_property_value("background_slider_images",!0)||[]);_.each(e,function(e,t){t=parseInt(t,10),t&&i.push(t)}),t.model.set_breakpoint_property("background_slider_images",i),Upfront.Views.Editor.ImageSelector.close(),t.update_slider_slides()})}),this.$el.on("click",".upfront-region-bg-slider-delete-image",function(i){i.preventDefault(),i.stopPropagation();var s=e(this).closest(".upfront-region-bg-slider-image"),n=s.data("image-id"),r=s.index(),l=_.clone(t.model.get_breakpoint_property_value("background_slider_images",!0)||[]);_.isString(n)&&n.match(/^[0-9]+$/)&&(n=parseInt(n,10)),-1!=r&&l.length>0&&l.splice(r,1),t.model.set_breakpoint_property("background_slider_images",l),s.remove()}),this.on("show",function(){t.update_slider_slides()}),this.$el.addClass("uf-bgsettings-item uf-bgsettings-slider-slidesitem"),this.bind_toggles(),this.constructor.__super__.initialize.call(this,i)},update_slider_slides:function(){var t=this,s=t.model.get_breakpoint_property_value("background_slider_images",!0),n=e('<div class="upfront-region-bg-slider-add-image upfront-icon upfront-icon-region-add-slide">'+i.add_slide+"</div>"),r=this.$el.find(".upfront-settings-item-content");r.html(""),s.length>0?Upfront.Views.Editor.ImageEditor.getImageData(s).done(function(i){var l=i.data.images;_.each(s,function(i){var t=_.isNumber(i)||i.match(/^\d+$/)?l[i]:_.find(l,function(e){return e.full[0].split(/[\\/]/).pop()==i.split(/[\\/]/).pop()}),s=e('<div class="upfront-region-bg-slider-image" />');s.data("image-id",i),"undefined"!=typeof t.thumbnail&&s.css({background:'url("'+t.thumbnail[0]+'") no-repeat 50% 50%',backgroundSize:"100% auto"}),s.append('<span href="#" class="upfront-region-bg-slider-delete-image">&times;</span>'),r.append(s)}),r.hasClass("ui-sortable")?r.sortable("refresh"):r.sortable({items:">  .upfront-region-bg-slider-image",update:function(){var i=[];r.find(".upfront-region-bg-slider-image").each(function(){var t=e(this).data("image-id");t=parseInt(t,10),t&&i.push(t)}),t.model.set_breakpoint_property("background_slider_images",i)}}),r.append(n)}):r.append(n)}}));return s})}(jQuery);