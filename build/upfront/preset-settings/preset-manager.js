(function(e){define(["scripts/upfront/element-settings/root-settings-panel","scripts/upfront/settings/modules/select-preset","scripts/upfront/settings/modules/edit-preset","scripts/upfront/settings/modules/preset-css","scripts/upfront/preset-settings/util"],function(t,n,r,i,s){var o=t.extend({className:"uf-settings-panel upfront-settings_panel preset-manager-panel",initialize:function(e){var t=this;this.options=e,_.each(this.options,function(e,t){this[t]=e},this);var n=!1;_.each(Upfront.mainData[this.mainDataCollection],function(e,t){e.id==="default"&&(n=!0)}),n||(Upfront.mainData[this.mainDataCollection]=_.isArray(Upfront.mainData[this.mainDataCollection])?Upfront.mainData[this.mainDataCollection]:[],Upfront.mainData[this.mainDataCollection].unshift(this.getPresetDefaults("default"))),this.presets=new Backbone.Collection(Upfront.mainData[this.mainDataCollection]||[]);var r=function(e){Upfront.Util.post({action:"upfront_save_"+this.ajaxActionSlug+"_preset",data:e}).done(function(){t.model.trigger("preset:updated")})};this.debouncedSavePreset=_.debounce(r,1e3),this.mergeElementStyle(),this.setupItems()},mergeElementStyle:function(){var t=_.contains(["UtabsView","UaccordionView","ButtonView"],this.property("view_class")),n,r,i,s,o;if(t)return;if(this.property("preset"))return;n=this.property("theme_style"),n||(n="_default"),Upfront.Application.cssEditor.init({model:this.model,stylename:n,no_render:!0}),r=n==="_default"?"defaultPreset":n,i=this.presets.findWhere({id:r});if(i){this.property("preset",i.id),this.property("theme_style","");return}s=e.trim(Upfront.Application.cssEditor.get_style_element().html().replace(/div#page.upfront-layout-view .upfront-editable_entity.upfront-module/g,"#page")),s=s.replace(new RegExp(n,"g"),r),o=new Backbone.Model(this.getPresetDefaults(r)),o.set({preset_style:s}),_.each(o.attributes,function(e,t){var n,r=this.model.get_property_value_by_name(t);if(t==="id")return;if(t==="name")return;typeof r!="undefined"&&r!==!1&&(n={},n[t]=this.model.get_property_value_by_name(t),o.set(n))},this),this.property("theme_style",""),this.property("preset",o.id),this.presets.add(o),this.updatePreset(o.toJSON())},setupItems:function(){var e=this.property("preset")?this.clear_preset_name(this.property("preset")):"default",t=this.presets.findWhere({id:e}),s,o,u;this.selectPresetModule=new n({model:this.model,presets:this.presets}),this.options.hasBreakpointSettings===!0&&(s=Upfront.Views.breakpoints_storage.get_breakpoints().get_active(),o=t.get("breakpoint")||{},u=o[s.id]||{},_.each(this.options.breakpointSpecificPresetSettings,function(e){if(!_.isUndefined(u[e.name])){var n={};n[e.name]=u[e.name],t.set(n,{silent:!0})}},this)),this.editPresetModule=new r({model:t,stateModules:this.stateModules}),this.presetCssModule=new i({model:this.model,preset:t}),this.listenTo(this.selectPresetModule,"upfront:presets:new",this.createPreset),this.listenTo(this.selectPresetModule,"upfront:presets:change",this.changePreset),this.listenTo(this.editPresetModule,"upfront:presets:delete",this.deletePreset),this.listenTo(this.editPresetModule,"upfront:presets:reset",this.resetPreset),this.listenTo(this.editPresetModule,"upfront:presets:update",this.updatePreset),this.listenTo(this.editPresetModule,"upfront:presets:state_show",this.stateShow),this.listenTo(this.presetCssModule,"upfront:presets:update",this.updatePreset),this.settings=_([this.selectPresetModule,this.editPresetModule,this.presetCssModule])},getTitle:function(){return"Appearance"},getPresetDefaults:function(e){return _.extend(this.presetDefaults,{id:e.toLowerCase().replace(/ /g,"-"),name:e})},updatePreset:function(e){var t,n,r,i;this.hasBreakpointSettings===!0&&(r=Upfront.Views.breakpoints_storage.get_breakpoints().get_active(),i=e.breakpoint||{},i[r.id]={},_.each(this.breakpointSpecificPresetSettings,function(t){i[r.id][t.name]=e[t.name],delete e[t.name]},this),e.breakpoint=i),s.updatePresetStyle(this.styleElementPrefix.replace(/-preset/,""),e,this.styleTpl),this.debouncedSavePreset(e),_.each(Upfront.mainData[this.mainDataCollection],function(n,r){n.id===e.id&&(t=r)}),_.isUndefined(t)===!1&&Upfront.mainData[this.mainDataCollection].splice(t,1),Upfront.mainData[this.mainDataCollection].push(e)},createPreset:function(e){var t=this.getPresetDefaults(e);this.presets.add(t),this.model.set_property("preset",t.id),this.updatePreset(t),this.render()},deletePreset:function(e){var t;Upfront.Util.post({data:e.toJSON(),action:"upfront_delete_"+this.ajaxActionSlug+"_preset"}),_.each(Upfront.mainData[this.mainDataCollection],function(n,r){n.id===e.get("id")&&(t=r)}),Upfront.mainData[this.mainDataCollection].splice(t,1),this.model.set_property("preset","default"),this.presets.remove(e),this.render()},resetPreset:function(e){var t,n=this;Upfront.Util.post({data:e.toJSON(),action:"upfront_reset_"+this.ajaxActionSlug+"_preset"}).success(function(r){var i=r.data;if(_.isEmpty(r.data)||r.data===!1)i=n.getPresetDefaults("default");s.updatePresetStyle(n.styleElementPrefix.replace(/-preset/,""),i,n.styleTpl),_.each(Upfront.mainData[n.mainDataCollection],function(e,n){e.id===i.id&&(t=n)}),_.isUndefined(t)===!1&&Upfront.mainData[n.mainDataCollection].splice(t,1),Upfront.mainData[n.mainDataCollection].push(i),n.presets=new Backbone.Collection(Upfront.mainData[n.mainDataCollection]||[]),Upfront.Views.Editor.notify("Preset "+e.get("id")+" was reset"),n.$el.empty(),n.render()}).error(function(e){Upfront.Views.Editor.notify(e)})},changePreset:function(e){this.stopListening(),this.setupItems(),this.render()},stateShow:function(e){this.trigger("upfront:presets:state_show",e)},getBody:function(){this.setupItems();var t=e("<div />"),n=this;return this.settings.each(function(e){e.panel||(e.panel=n),e.render(),t.append(e.el)}),t},clear_preset_name:function(e){return e=e.replace(" ","-"),e=e.replace(/[^-a-zA-Z0-9]/,""),e},property:function(e,t,n){return typeof t!="undefined"?(typeof n=="undefined"&&(n=!0),this.model.set_property(e,t,n)):this.model.get_property_value_by_name(e)}});return o})})(jQuery);