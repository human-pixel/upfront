(function(e){define(["scripts/upfront/preset-settings/select-preset-panel","scripts/upfront/preset-settings/util","scripts/upfront/preset-settings/edit-preset-item"],function(e,t,n){var r=Upfront.Views.Editor.Settings.Settings.extend({initialize:function(e){this.options=e,this.has_tabs=!1;var t=!1;_.each(Upfront.mainData[this.mainDataCollection],function(e,n){e.id==="default"&&(t=!0)}),t||Upfront.mainData[this.mainDataCollection].unshift(this.presetDefaults),this.presets=new Backbone.Collection(Upfront.mainData[this.mainDataCollection]||[]),this.showSelectPresetPanel(!1)},showSelectPresetPanel:function(t){var n=this;this.selectPresetPanel=new e({model:this.model,presets:this.presets,stateFields:this.stateFields}),this.panels=_([this.selectPresetPanel]),this.delegateEvents(),this.listenTo(this.selectPresetPanel,"upfront:presets:new",this.createPreset),this.listenTo(this.selectPresetPanel,"upfront:presets:delete",this.deletePreset),this.listenTo(this.selectPresetPanel,"upfront:presets:change",this.changePreset),this.listenTo(this.selectPresetPanel,"upfront:presets:update",this.updatePreset),t&&this.render()},getPresetDefaults:function(e){return _.extend(this.presetDefaults,{id:e.toLowerCase().replace(/ /g,"-"),name:e})},updatePreset:function(e){var n,r,i=this.model.get_property_value_by_name("theme_style");i&&(e.theme_style=i),t.updatePresetStyle(this.styleElementPrefix.replace(/-preset/,""),e,this.styleTpl),Upfront.Util.post({action:"upfront_save_"+this.ajaxActionSlug+"_preset",data:e}),_.each(Upfront.mainData[this.mainDataCollection],function(t,r){t.id===e.id&&(n=r)}),_.isUndefined(n)===!1&&Upfront.mainData[this.mainDataCollection].splice(n,1),Upfront.mainData[this.mainDataCollection].push(e)},createPreset:function(e){var t=this.getPresetDefaults(e);this.presets.add(t),this.model.set_property("preset",t.id),this.updatePreset(t)},deletePreset:function(e){var t;Upfront.Util.post({data:e.toJSON(),action:"upfront_delete_"+this.ajaxActionSlug+"_preset"}),_.each(Upfront.mainData[this.mainDataCollection],function(n,r){n.id===e.get("id")&&(t=r)}),Upfront.mainData[this.mainDataCollection].splice(t,1),this.model.set_property("preset","default"),this.presets.remove(e),this.showSelectPresetPanel(!0)},changePreset:function(e){this.$el.empty(),this.selectPresetPanel.remove(),this.showSelectPresetPanel(!0);var t=this.presets.findWhere({id:e.get("value")});t&&(theme_style=t.attributes.theme_style,this.model.set_property("theme_style",theme_style))},get_title:function(){return this.panelTitle}});return r})})(jQuery);