define(["scripts/upfront/inline-panels/l10n","scripts/upfront/inline-panels/panel","scripts/upfront/inline-panels/collapsed-multi-control"],function(e,t,n){var r=t.extend({position_v:"none",position_h:"none",setWidth:function(t){var r=40,i=this.items._wrapped,s=!!i.collapsed,o,u;if(!s&&i.length>3&&t<i.length*r){o=i.slice(1,i.length-1),u=new n,_.each(o,function(e){u.sub_items[e.icon]=e}),u.icon="collapsedControl",u.tooltip=e.ctrl.more_tools,u.position="left",this.items=_([i[0],u,i[i.length-1]]);return}if(s){var a=2+i[1].sub_items.length;if(a*r<=t){var f=[i[0]],l=i[1].subitems;_.each(l,function(e){f.push(e)}),f.push(i[2]),this.items=f}}},delegateEvents:function(){Backbone.View.prototype.delegateEvents.call(this,arguments),this.items.each(function(e){e.delegateEvents()})}});return r});