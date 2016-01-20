(function(e){define(["scripts/upfront/element-settings/root-settings-panel","scripts/upfront/settings/modules/select-preset","scripts/upfront/settings/modules/edit-preset","scripts/upfront/settings/modules/migrate-preset","scripts/upfront/settings/modules/preset-css","scripts/upfront/preset-settings/util","scripts/upfront/preset-settings/preset-css-editor"],function(t,n,r,i,s,o,u){var a=Upfront.Settings.l10n.preset_manager,f=t.extend({className:"uf-settings-panel upfront-settings_panel preset-manager-panel",initialize:function(e){var t=this;this.options=e,_.each(this.options,function(e,t){this[t]=e},this);var n=!1;_.each(Upfront.mainData[this.mainDataCollection],function(e,t){e.id==="default"&&(n=!0)}),n||(Upfront.mainData[this.mainDataCollection]=_.isArray(Upfront.mainData[this.mainDataCollection])?Upfront.mainData[this.mainDataCollection]:[],Upfront.mainData[this.mainDataCollection].unshift(this.getPresetDefaults("default"))),this.presets=new Backbone.Collection(Upfront.mainData[this.mainDataCollection]||[]);var r=function(e){Upfront.Util.post({action:"upfront_save_"+this.ajaxActionSlug+"_preset",data:e}).done(function(){t.model.trigger("preset:updated")})};this.debouncedSavePreset=_.debounce(r,1e3),this.createBackup(),this.defaultOverlay(),this.listenToOnce(Upfront.Events,"element:settings:canceled",function(){this.updateCanceledPreset(this.backupPreset)}),this.listenToOnce(Upfront.Events,"upfront:layout_size:change_breakpoint",this.cancelPresetChanges)},createBackup:function(){var e=this.property("preset")?this.clear_preset_name(this.property("preset")):"default",t=this.presets.findWhere({id:e});typeof t=="undefined"&&(t=this.presets.findWhere({id:"default"})),typeof this.backupPreset=="undefined"&&(this.backupPreset=Upfront.Util.clone(t.toJSON()))},defaultOverlay:function(){var e=this,t=this.property("preset")?this.clear_preset_name(this.property("preset")):"default";t==="default"&&setTimeout(function(){e.$el.find(".preset_specific").next().andSelf().wrapAll('<div class="default-overlay-wrapper" />'),e.$el.find(".default-overlay-wrapper").append('<div class="default-overlay"><div class="overlay-title">'+a.default_overlay_title+"</div>"+'<div class="overlay-text">'+a.default_overlay_text+"</div>"+'<div class="overlay-button"><button type="button" class="overlay-button-input">'+a.default_overlay_button+"</button></div>"+"</div>"),e.$el.find(".delete_preset input").prop("disabled",!0),e.$el.find(".delete_preset input").css({opacity:.6})},100),this.$el.on("click",".overlay-button-input",function(t){t.preventDefault(),e.$el.find(".default-overlay").remove(),e.$el.find(".default-overlay-wrapper").css("min-height","30px"),e.$el.find(".delete_preset input").prop("disabled",!1),e.$el.find(".delete_preset input").css({opacity:1})})},updateMainDataCollectionPreset:function(e){var t;_.each(Upfront.mainData[this.mainDataCollection],function(n,r){n.id===e.id&&(t=r)}),typeof t!="undefined"?Upfront.mainData[this.mainDataCollection][t]=e:Upfront.mainData[this.mainDataCollection].push(e)},migratePresetProperties:function(e){return e},migrateElementStyle:function(e){return e},setupItems:function(){this.trigger("upfront:presets:setup-items",this);var e=this.clear_preset_name(this.model.decode_preset()||"default"),t=this.presets.findWhere({id:e}),o,u,a;typeof t=="undefined"&&(t=this.presets.findWhere({id:"default"})),this.selectPresetModule&&this.selectPresetModule.stopListening&&(this.selectPresetModule.stopListening(),this.stopListening(this.selectPresetModule)),this.selectPresetModule=new n({model:this.model,presets:this.presets}),this.options.hasBreakpointSettings===!0&&(o=Upfront.Views.breakpoints_storage.get_breakpoints().get_active(),u=t.get("breakpoint")||{},a=u[o.id]||{},_.each(this.options.breakpointSpecificPresetSettings,function(e){if(!_.isUndefined(a[e.name])){var n={};n[e.name]=a[e.name],t.set(n,{silent:!0})}},this)),this.editPresetModule&&this.editPresetModule.stopListening&&(this.editPresetModule.stopListening(),this.stopListening(this.editPresetModule)),this.editPresetModule=new r({model:t,stateModules:this.stateModules}),this.presetCssModule&&this.presetCssModule.stopListening&&(this.presetCssModule.stopListening(),this.stopListening(this.presetCssModule)),this.presetCssModule=new s({model:this.model,preset:t}),this.migratePresetModule=new i({model:this.model,presets:this.presets,elementPreset:this.styleElementPrefix}),this.listenTo(this.selectPresetModule,"upfront:presets:new",this.createPreset),this.listenTo(this.selectPresetModule,"upfront:presets:change",this.changePreset),this.listenTo(this.editPresetModule,"upfront:presets:delete",this.deletePreset),this.listenTo(this.editPresetModule,"upfront:presets:reset",this.resetPreset),this.listenTo(this.editPresetModule,"upfront:presets:update",this.updatePreset),this.listenTo(this.editPresetModule,"upfront:presets:state_show",this.stateShow),this.listenTo(this.presetCssModule,"upfront:presets:update",this.updatePreset),this.listenTo(this.selectPresetModule,"upfront:presets:migrate",this.migratePreset),this.listenTo(this.migratePresetModule,"upfront:presets:preview",this.previewPreset),this.listenTo(this.migratePresetModule,"upfront:presets:change",this.applyExistingPreset),this.listenTo(this.migratePresetModule,"upfront:presets:new",this.migratePreset),this.settings=_([this.selectPresetModule,this.editPresetModule,this.presetCssModule])},getTitle:function(){return"Appearance"},getPresetDefaults:function(e){return _.extend(this.presetDefaults,{id:e.toLowerCase().replace(/ /g,"-"),name:e})},updateCanceledPreset:function(e){o.updatePresetStyle(this.styleElementPrefix.replace(/-preset/,""),e,this.styleTpl),this.debouncedSavePreset(e),this.updateMainDataCollectionPreset(e)},updatePreset:function(e){var t,n,r,i;this.options.hasBreakpointSettings===!0&&(r=Upfront.Views.breakpoints_storage.get_breakpoints().get_active(),i=e.breakpoint||{},i[r.id]=i[r.id]||{},_.each(this.options.breakpointSpecificPresetSettings,function(t){i[r.id][t.name]=e[t.name],delete e[t.name]},this),e.breakpoint=i),o.updatePresetStyle(this.styleElementPrefix.replace(/-preset/,""),e,this.styleTpl),this.debouncedSavePreset(e),this.updateMainDataCollectionPreset(e)},migratePreset:function(t){var n=this.presets.findWhere({id:t.toLowerCase().replace(/ /g,"-")});if(typeof n!="undefined"){Upfront.Views.Editor.notify(a.preset_already_exist.replace(/%s/,t),"error");return}var r=this.property("theme_style");r||(r="_default"),Upfront.Application.cssEditor.init({model:this.model,stylename:r,no_render:!0});var i=e.trim(Upfront.Application.cssEditor.get_style_element().html().replace(/div#page.upfront-layout-view .upfront-editable_entity.upfront-module/g,"#page"));i=i.replace(new RegExp("."+r,"g"),""),i=Upfront.Application.stylesAddSelectorMigration(e.trim(i),""),i=this.migrateElementStyle(i),newPreset=new Backbone.Model(this.getPresetDefaults(t)),typeof i!="undefined"&&newPreset.set({preset_style:i}),this.migratePresetProperties(newPreset),this.property("preset",newPreset.id),this.presets.add(newPreset),presetOptions=newPreset,properties=newPreset.toJSON(),this.property("theme_style",""),o.updatePresetStyle(this.styleElementPrefix.replace(/-preset/,""),properties,this.styleTpl),this.debouncedSavePreset(properties),this.updateMainDataCollectionPreset(properties),this.property("usingNewAppearance",!0),this.model.get("properties").trigger("change"),Upfront.Views.Editor.notify(a.preset_created.replace(/%s/,t)),this.render()},createPreset:function(e){var t=this.presets.findWhere({id:e.toLowerCase().replace(/ /g,"-")});if(typeof t!="undefined"){Upfront.Views.Editor.notify(a.preset_already_exist.replace(/%s/,e),"error");return}var n=this.getPresetDefaults(e);this.presets.add(n),this.model.set_property("preset",n.id),this.updatePreset(n),this.model.encode_preset(n.id),Upfront.Views.Editor.notify(a.preset_created.replace(/%s/,e)),this.render()},deletePreset:function(e){var t;Upfront.Util.post({data:e.toJSON(),action:"upfront_delete_"+this.ajaxActionSlug+"_preset"}),_.each(Upfront.mainData[this.mainDataCollection],function(n,r){n.id===e.get("id")&&(t=r)}),Upfront.mainData[this.mainDataCollection].splice(t,1),this.model.set_property("preset","default"),this.model.encode_preset("default"),this.presets.remove(e),this.render(),this.defaultOverlay()},resetPreset:function(e){var t,n=this;Upfront.Util.post({data:e.toJSON(),action:"upfront_reset_"+this.ajaxActionSlug+"_preset"}).success(function(t){var r=t.data;if(_.isEmpty(t.data)||t.data===!1)r=n.getPresetDefaults("default");o.updatePresetStyle(n.styleElementPrefix.replace(/-preset/,""),r,n.styleTpl),n.updateMainDataCollectionPreset(r),n.presets=new Backbone.Collection(Upfront.mainData[n.mainDataCollection]||[]),Upfront.Views.Editor.notify(a.preset_reset.replace(/%s/,e.get("id"))),n.$el.empty(),n.render()}).error(function(e){Upfront.Views.Editor.notify(e)})},applyExistingPreset:function(e){this.property("usingNewAppearance",!0),this.changePreset(e),this.defaultOverlay()},changePreset:function(e){this.stopListening(),this.model.encode_preset(e),this.render(),this.defaultOverlay(),Upfront.Views.Editor.notify(a.preset_changed.replace(/%s/,e))},previewPreset:function(t){var n=this.property("element_id"),r=this.styleElementPrefix.replace(/-preset/,"");if(r==="accordion"){var i=e("#"+n).find(".upfront-accordion-container");i.removeClass(this.getPresetClasses(r)),i.addClass(r+"-preset-"+t)}else if(r==="tab"){var i=e("#"+n).find(".upfront-tabs-container");i.removeClass(this.getPresetClasses(r)),i.addClass(r+"-preset-"+t)}else if(r==="button"){var i=e("#"+n).find(".upfront_cta");i.removeClass(this.getPresetClasses(r)),i.addClass(r+"-preset-"+t)}else e("#"+n).removeClass(this.getPresetClasses()),e("#"+n).addClass(t)},getPresetClasses:function(e){var t="";return _.map(this.presets.models,function(n){typeof e!="undefined"&&e?t+=e+"-preset-"+n.get("id")+" ":t+=n.get("id")+" "}),t},stateShow:function(e){this.trigger("upfront:presets:state_show",e)},getModifiedProperties:function(){return!0},migrateToDefault:function(){var e=this.getModifiedProperties(),t=this.property("usingNewAppearance");return!e&&!t&&(this.property("usingNewAppearance",!0),this.property("preset","default"),this.defaultOverlay()),!1},getBody:function(){this.setupItems();var t=e("<div />"),n=this;return this.migrateToDefault(),this.property("usingNewAppearance")!==!0&&(this.settings=_([this.migratePresetModule])),this.settings.each(function(e){e.panel||(e.panel=n),e.render(),t.append(e.el)}),t},clear_preset_name:function(e){return e=e.replace(" ","-"),e=e.replace(/[^-a-zA-Z0-9]/,""),e},property:function(e,t,n){return typeof t!="undefined"?(typeof n=="undefined"&&(n=!0),this.model.set_property(e,t,n)):this.model.get_property_value_by_name(e)},save_settings:function(){}});return f})})(jQuery);