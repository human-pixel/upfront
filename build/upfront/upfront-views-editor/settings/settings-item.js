!function(t){Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.views:Upfront.mainData.l10n.global.views;define([],function(){return Backbone.View.extend({group:!0,get_name:function(){return 1==this.fields.length?this.fields[0].get_name():this.fields.length>1?this.fields.map(function(t){return t.get_name()}):void 0},get_value:function(){return 1==this.fields.length?this.fields[0].get_value():this.fields.length>1?this.fields.map(function(t){return t.get_value()}):void 0},get_title:function(){return this.options.title?this.options.title:""},initialize:function(t){var e=this;e.options=t,this.fields=t.fields?_(t.fields):_([]),this.group="undefined"!=typeof t.group?t.group:this.group,this.on("panel:set",function(){e.fields.each(function(t){t.panel=e.panel,t.trigger("panel:set")})})},render:function(){this.group?this.$el.append('<div class="upfront-settings-item"><div class="upfront-settings-item-title"><span>'+this.get_title()+'</span></div><div class="upfront-settings-item-content"></div></div>'):this.$el.append('<div class="upfront-settings-item-content"></div>');var t=this.$el.find(".upfront-settings-item-content");this.fields.each(function(e){e.render(),e.delegateEvents(),t.append(e.$el)}),this.trigger("rendered")},save_fields:function(){var t=_([]);this.fields.each(function(e,i,n){if(e.property){var s=e.get_value()||[],l=e.get_saved_value();e.multiple||s==l?!e.multiple||s.length==l.length&&0===_.difference(s,l).length||t.push(e):t.push(e)}}),t.each(function(t,e,i){t.use_breakpoint_property?t.model.set_breakpoint_property(t.property_name,t.get_value(),!0):t.property.set({value:t.get_value()},{silent:!0})}),t.size()>0&&(this.panel.is_changed=!0)},wrap:function(t){if(!t)return!1;var e=t.title||"",i=t.markup||t;this.$el.append('<div id="usetting-'+this.get_name()+'" class="upfront-settings-item"><div class="upfront-settings-item-title"><span>'+e+'</span></div><div class="upfront-settings-item-content">'+i+"</div></div>")},remove:function(){this.fields&&this.fields.each(function(t){t.remove()}),Backbone.View.prototype.remove.call(this)}})})}(jQuery);