(function(e){define(["scripts/upfront/inline-panels/control","scripts/upfront/inline-panels/multi-control"],function(t,n){var r=n.extend({collapsed:!0,render:function(){if(!this.sub_items.collapsedControl){var e=new t;e.icon="collapsedControl",e.tooltip="More tools",this.sub_items.collapsedControl=e}this.selected="collapsedControl",this.constructor.__super__.render.call(this,arguments)},selectItem:function(t){var r=!1,i=!1,s=e(t.target).is("i")?e(t.target):e(t.target).find("i");_.each(this.sub_items,function(e,t){s.hasClass("upfront-icon-region-"+e.icon)&&(r=e,i=t)});if(r){if(r instanceof n)return!1;this.render(),this.trigger("select",i)}},open_subitem:function(){_.each(this.sub_items,function(e){e instanceof n&&e.close_subitem()}),this.constructor.__super__.open_subitem.call(this,arguments)}});return r})})(jQuery);