(function(e){define(["text!scripts/redactor/ueditor-templates.html"],function(t){var n=Backbone.View.extend({shortcodeName:"ueditor-insert",attributes:{contenteditable:"false"},defaultData:{},resizable:!1,initialize:function(e){e=e||{};var t=e.data||{};t.id||(t.id=this.generate_new_id(),Upfront.Events.trigger("content:insertcount:updated")),this.el.id=t.id,this.data=new Backbone.Model(t),this.listenTo(this.data,"change add remove reset",this.render),this.createControls(),typeof this.init=="function"&&this.init(e)},generate_new_id:function(){return"uinsert-"+ ++Upfront.data.ueditor.insertCount},start:function(){var t=e.Deferred();return t.resolve(),t.promise()},getOutput:function(){var e=this.data.toJSON(),t='[ueditor-insert type="'+this.type+'"';return _.each(e,function(e,n){t+=" "+n+'="'+e+'"'}),t+"]"},importInserts:function(t){var n=this,r=new RegExp("(["+this.shortcodeName+"[^]]*?])","ig"),i=t.html(),s=e("<div></div>");i=i.replace(r,'<p class="ueditor-insert">$1</p>');var o=s.html(i).find("p.ueditor-insert");o.each(function(){var e=n.parseShortcode(this.innerHTML);e.type&&insertObjects[e.type]})},parseShortcode:function(t){var n=/\[([^\s\]]+)([^\]]*?)\]/i,r=/(\w+)\s*=\s*"([^"]*)"(?:\s|$)|(\w+)\s*=\s*\'([^\']*)\'(?:\s|$)|(\w+)\s*=\s*([^\s\'"]+)(?:\s|$)|"([^"]*)"(?:\s|$)|(\S+)(?:\s|$)/ig,i=t.match(n),s={},o;if(!i)return!1;s.shortcodeName=i[1],o=e.trim(i[2]);if(o){var u=o.match(r);u&&_.each(u,function(t){t=e.trim(t);var n=t.split("=");if(n.length==1)s[t]=t;else{var r=e.trim(n[0]),i=e.trim(n.slice(1).join("="));if(i[0]=='"'&&i[i.length-1]=='"'||i[0]=="'"&&i[i.length-1]=="'")i=i.slice(1,-1);s[r]=i}})}return s},createControls:function(){var e=this,t=Upfront.Views.Editor.InlinePanels;this.controls&&(this.controls.remove(),this.controls=!1);if(!this.controlsData)return;this.controls=t.ControlPanel.extend({position_v:"top"}),this.controls=new this.controls;var n=[];_.each(this.controlsData,function(r){var i;if(r.type=="simple")i=e.createSimpleControl(r),e.controls.listenTo(i,"click",function(){e.controls.trigger("control:click",i),e.controls.trigger("control:click:"+i.id,i)});else if(r.type=="multi"){i=new t.TooltipControl,i.selected=r.selected;if(r.subItems){var s={};_.each(r.subItems,function(t){s[t.id]=e.createSimpleControl(t)}),i.sub_items=s}e.controls.listenTo(i,"select",function(t){e.controls.trigger("control:select:"+i.id,t)})}else r.type=="dialog"&&(i=new t.DialogControl,i.view=r.view,e.controls.listenTo(i,"panel:ok",function(t){e.controls.trigger("control:ok:"+i.id,t,i)}),e.controls.listenTo(i,"panel:open",function(){e.controls.$el.addClass("uinsert-control-visible"),e.$el.addClass("nosortable")}),e.controls.listenTo(i,"panel:close",function(){e.controls.$el.removeClass("uinsert-control-visible"),e.$el.removeClass("nosortable")}));i&&(_.extend(i,r),n.push(i))}),this.controls.items=_(n),this.controls.render(),typeof this.controlEvents=="function"&&this.controlEvents(),this.controls.delegateEvents()},createSimpleControl:function(e){var t=new Upfront.Views.Editor.InlinePanels.Control;return t.icon=e.icon,t.tooltip=e.tooltip,t.id=e.id,t.label=e.label,t},getAligmnentControlData:function(e){var t={left:{id:"left",icon:"alignleft",tooltip:"Align left"},right:{id:"right",icon:"alignright",tooltip:"Align right"},center:{id:"center",icon:"aligncenter",tooltip:"Align center"},full:{id:"full",icon:"alignfull",tooltip:"Full width"}},n={id:"alignment",type:"multi",icon:"alignment",tooltip:"Alignment",subItems:[]};return _.each(e,function(e){t[e]&&n.subItems.push(t[e])}),n},getRemoveControlData:function(){return{id:"remove",type:"simple",icon:"remove",tooltip:"Delete"}},resizableInsert:function(){if(!this.resizable)return;var e=this,t=this.data.get("align"),n=!0,r=!0,i=".upfront-icon-control-resize-se",s={},o=Upfront.Behaviors.GridEditor;this.$el.hasClass("ui-resizable")&&this.$el.resizable("destroy"),t=="left"?n=!1:t=="right"&&(r=!1,i=".upfront-icon-control-resize-sw"),this.$(i).length||(r&&(this.$el.append('<span class="upfront-icon-control upfront-icon-control-resize-se upfront-resize-handle-se ui-resizable-handle ui-resizable-se nosortable" style="display: inline;"></span>'),s.se=".upfront-icon-control-resize-se"),n&&(this.$el.append('<span class="upfront-icon-control upfront-icon-control-resize-sw upfront-resize-handle-sw ui-resizable-handle ui-resizable-sw nosortable" style="display: inline;"></span>'),s.sw=".upfront-icon-control-resize-sw"));var u=this.getResizableOptions?this.getResizableOptions():{};u.handles=s,u.grid=[o.col_size,o.baseline],this.$el.resizable(u)}});return{UeditorInsert:n}})})(jQuery);