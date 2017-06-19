!function(e){var t=Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.views:Upfront.mainData.l10n.global.views;define(["scripts/upfront/upfront-views-editor/modal","scripts/upfront/upfront-views-editor/fields","text!upfront/templates/bg_setting.html"],function(i,o,n){return i.extend({open:function(){return this._backup={},this._prompt=!1,i.prototype.open.call(this,this.render_modal,this,!0)},close:function(e){return this._prompt&&this.prompt_responsive_change("background_type"),i.prototype.close.call(this,e)},render_modal:function(i,r){var a=Upfront.Settings.LayoutEditor.Grid,s=e(n),d=_.template(s.find("#upfront-bg-setting").html()),l=d(),p=new o.Number({model:this.model,property:"contained_region_width",label:t.contained_region_width,label_style:"inline",default_value:a.size*a.column_width,min:a.size*a.column_width,max:5120,step:1,suffix:t.px,change:function(){var e=this.get_value();e=e<this.options.min?this.options.min:e,this.property.set({value:e}),Upfront.Events.trigger("upfront:layout:contained_region_width",e)}});i.find(".upfront-bg-setting-tab-primary, .upfront-bg-setting-tab-secondary").children().detach(),i.html(l),r.addClass("upfront-modal-bg"),p.render(),i.find(".upfront-bg-setting-theme-body").append(p.$el),this.render_bg_type_settings(i)},render_bg_type_settings:function(e){var t=Upfront.Views.breakpoints_storage.get_breakpoints().get_active().toJSON();t.default||this.$el.addClass("upfront-region-settings-responsive");var i=this,n=t&&!t.default,r=this.model.get_breakpoint_property_value("background_image",!0),a=t&&!t.default?"":r?"image":"color",s=this.model.get_breakpoint_property_value("background_type"),d=new o.Select({model:this.model,name:"background_type",default_value:s?s:a,icon_class:"upfront-region-field-icon",values:this.get_bg_types(),change:function(){var o=this.get_value();if(""===o&&n)i.reset_breakpoint_background(t,!1),e.find(".upfront-bg-setting-tab").hide();else{n&&i.revert_breakpoint_background(t,["background_type"],!0),i.model.set_breakpoint_property("background_type",o),e.find(".upfront-bg-setting-tab").not(".upfront-bg-setting-tab-"+o).hide(),e.find(".upfront-bg-setting-tab-"+o).show(),i.render_modal_tab(o,e.find(".upfront-bg-setting-tab-"+o),e);var r=e.find(".upfront-region-type-icon")[0],a=this.model.get_breakpoint_property_value("background_image"),d=this.model.get_breakpoint_property_value("background_color");"image"!==o&&"featured"!==o||!a?"color"===o&&d?(r=r.classList[1],e.find(".upfront-region-type-icon").addClass("upfront-region-type-icon-color-swatch").removeClass(r).css({backgroundImage:"none",backgroundColor:d})):r&&(r=r.classList[1],e.find(".upfront-region-type-icon").css({backgroundImage:"",backgroundPosition:"",backgroundColor:""}),e.find(".upfront-region-type-icon").addClass("upfront-region-type-icon-"+o).removeClass(r+" upfront-region-type-icon-image-url upfront-region-type-icon-color-swatch")):(r=r.classList[1],e.find(".upfront-region-type-icon").addClass("upfront-region-type-icon-image-url").removeClass(r).css({backgroundImage:"url("+a+")"}))}n||(i._prompt=s!==o),"image"===o||"featured"===o?(this.$el.addClass("upfront-bg-setting-type-image"),"image"===o?this.$el.find(".upfront-field-select").css({"min-width":"140px","max-width":"140px"}):this.$el.find(".upfront-field-select").css({"min-width":"100%","max-width":"100%"})):(this.$el.removeClass("upfront-bg-setting-type-image"),this.$el.find(".upfront-field-select").css({"min-width":"100%","max-width":"100%"})),Upfront.Events.trigger("region:background:type:changed")}});d.render(),e.find(".upfront-bg-setting-type").append(d.$el),d.trigger("changed")},get_bg_types:function(){return[{label:t.solid_color,value:"color",icon:"color"},{label:t.image,value:"image",icon:"image"},{label:t.video,value:"video",icon:"video"}]},is_responsive_changed:function(e){var t=this,i=Upfront.Views.breakpoints_storage.get_breakpoints().get_enabled(),o=Upfront.Views.breakpoints_storage.get_breakpoints().get_active().toJSON(),n=!1;return!!o.default&&(_.each(i,function(i){if(!n){var i=i.toJSON(),o=t.model.get_breakpoint_property_value(e,!1,!1,i);i.default||!1!==o&&(n=!0)}}),n)},prompt_responsive_change:function(i){if(this.is_responsive_changed(i)){var o=this,n=this.model instanceof Upfront.Models.Region,r=n?this.model.get("title"):t.global_bg,a=new Upfront.Views.Editor.Modal({to:e("body"),button:!1,top:120,width:450});a.render(),e("body").append(a.el),a.open(function(e,i){var n=new Upfront.Views.Editor.Field.Button({name:"confirm",label:t.bg_changed_confirm,compact:!0,classname:"upfront-bg-setting-prompt-button",on_click:function(){o.reset_responsive_background(),a.close()}}),s=new Upfront.Views.Editor.Field.Button({name:"cancel",label:t.bg_changed_cancel,compact:!0,classname:"upfront-bg-setting-prompt-button",on_click:function(){a.close()}});i.addClass("upfront-bg-setting-prompt-modal"),e.html("<p>"+t.bg_changed_prompt.replace("%s",r)+"</p>"),_.each([n,s],function(t){t.render(),t.delegateEvents(),e.append(t.$el)})},this).always(function(){a.remove()})}},reset_responsive_background:function(){var e=this,t=Upfront.Views.breakpoints_storage.get_breakpoints().get_enabled();_.each(t,function(t){var i=t.toJSON();e.reset_breakpoint_background(i,!0)})},reset_breakpoint_background:function(e,t){if(!e.default){var i=this,o=["background_type","background_color","background_image","background_image_ratio","background_style","background_default","background_repeat","background_position","background_slider_transition","background_slider_rotate","background_slider_rotate_time","background_slider_control","background_slider_images","background_video_mute","background_video_autoplay","background_video_style","background_video","background_video_embed","background_video_width","background_video_height","background_map_center","background_map_zoom","background_map_style","background_map_controls","background_show_markers","background_use_custom_map_code","background_map_location"],n=Upfront.Util.clone(this.model.get_property_value_by_name("breakpoint")||{});_.isObject(n[e.id])||(n[e.id]={}),_.each(o,function(t){_.isUndefined(n[e.id][t])||(_.isObject(i._backup[e.id])||(i._backup[e.id]={}),i._backup[e.id][t]=n[e.id][t],delete n[e.id][t])}),this.model.set_property("breakpoint",n,!0===t)}},revert_breakpoint_background:function(e,t,i){var o=Upfront.Util.clone(this.model.get_property_value_by_name("breakpoint")||{});_.isObject(this._backup)&&_.isObject(this._backup[e.id])&&(t=_.isArray(t)?t:[],_.isObject(o[e.id])||(o[e.id]={}),_.each(this._backup[e.id],function(i,n){_.contains(t,n)||(o[e.id][n]=i)}),delete this._backup[e.id],this.model.set_property("breakpoint",o,!0===i))},render_modal_tab:function(e,t,i){switch(e){case"color":this.render_modal_tab_color(t);break;case"image":this.render_modal_tab_image(t,e);break;case"featured":this.render_modal_tab_image(t,e);break;case"slider":this.render_modal_tab_slider(t);break;case"map":this.render_modal_tab_map(t);break;case"video":this.render_modal_tab_video(t)}},_render_tab_template:function(t,i,o,r){var a=e(n),s=!1,d=!1;d=r?_.template(a.find("#upfront-bg-setting-tab-"+r).html()):_.template(a.find("#upfront-bg-setting-tab").html()),d&&(s=e("<div>"+d()+"</div>")),s.find(".upfront-bg-setting-tab-primary").append(i),o&&s.find(".upfront-bg-setting-tab-secondary").append(o),t.html(""),t.append(s)},render_modal_tab_color:function(e){this._color_item||(this._color_item=new Upfront.Views.Editor.BgSettings.ColorItem({model:this.model}),this._color_item.render()),this._color_item.trigger("show"),this._render_tab_template(e,this._color_item.$el,"")},render_modal_tab_image:function(e,t){this._image_item||(this._image_item=new Upfront.Views.Editor.BgSettings.ImageItem({model:this.model}),this._image_item.render(),this.$_image_primary=this._image_item.$el.find(".uf-bgsettings-image-style, .uf-bgsettings-image-pick")),this._image_item.trigger("show"),this._render_tab_template(e,this.$_image_primary,this._image_item.$el)},render_modal_tab_slider:function(t){this._slider_item||(this.$_slides=e('<div class="upfront-bg-slider-slides"></div>'),this._slider_item=new Upfront.Views.Editor.BgSettings.SliderItem({model:this.model,slides_item_el:this.$_slides}),this._slider_item.render(),this.$_slider_primary=this._slider_item.$el.find(".uf-bgsettings-slider-transition")),this._slider_item.trigger("show"),this._render_tab_template(t,this.$_slider_primary,[this._slider_item.$el,this.$_slides])},render_modal_tab_map:function(e){this._map_item||(this._map_item=new Upfront.Views.Editor.BgSettings.MapItem({model:this.model}),this._map_item.render()),this._map_item.trigger("show"),this._render_tab_template(e,"",this._map_item.$el)},render_modal_tab_video:function(e){this._video_item||(this._video_item=new Upfront.Views.Editor.BgSettings.VideoItem({model:this.model}),this._video_item.render()),this._video_item.trigger("show"),this._render_tab_template(e,"",this._video_item.$el)}})})}(jQuery);