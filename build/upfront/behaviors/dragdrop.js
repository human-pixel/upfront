(function(e){define([],function(){var t=function(e,t){this.initialize(e,t)};return t.prototype={module_selector:"> .upfront-module-view > .upfront-module, > .upfront-module-group",object_selector:"> .upfront-object-view > .upfront-object",el_selector:"",view:!1,model:!1,$me:!1,$wrap:!1,$region:!1,$main:!1,$layout:!1,me:!1,wrap:!1,region:!1,current_region:!1,$container:!1,$current_container:!1,region_model:!1,current_region_model:!1,current_wrappers:!1,is_group:!1,is_object:!1,is_parent_group:!1,is_disabled:!1,$helper:!1,event:!1,ui:!1,breakpoint:!1,app:!1,ed:!1,drop_areas:!1,drop_areas_created:!1,drops:!1,drop:!1,drop_col:0,drop_left:0,drop_top:0,area_col:0,current_area_col:0,current_row_wraps:!1,wrapper_id:!1,wrap_only:!1,new_wrap_view:!1,move_region:!1,current_grid:!1,current_grid_pos:!1,compare_area:!1,compare_area_position:!1,compare_col:0,compare_row:0,_last_drag_position:!1,_last_drag_time:0,_last_coord:!1,_t:!1,_focus_t:!1,focus:!1,focus_coord:!1,initialize:function(e,t){this.view=e,this.model=t,this.app=Upfront.Application,this.ed=Upfront.Behaviors.GridEditor,this.drop_areas=[],this.drop_areas_created=[],this.drops=[],this.current_row_wraps=[],this.current_grid={},this.current_grid_pos={},this.compare_area={},this.compare_area_position={},this._last_coord={x:0,y:0},this.focus_coord={x:0,y:0},this.setup()},setup:function(){this.is_group=this.view.$el.hasClass("upfront-module-group"),this.is_object=this.view.$el.hasClass("upfront-object-view"),this.is_parent_group=typeof this.view.group_view!="undefined",this.is_disabled=this.is_parent_group&&!this.view.group_view.$el.hasClass("upfront-module-group-on-edit")||this.is_object&&this.view.object_group_view&&!this.view.object_group_view.$el.hasClass("upfront-object-group-on-edit"),this.$me=this.is_group?this.view.$el:this.view.$el.find(".upfront-editable_entity:first"),this.$main=e(Upfront.Settings.LayoutEditor.Selectors.main),this.$layout=this.$main.find(".upfront-layout"),this.el_selector=this.is_object?this.object_selector:this.module_selector;if(this.app.mode.current!==this.app.MODE.THEME&&this.model.get_property_value_by_name("disable_drag"))return!1;if(this.$me.hasClass("upfront-module-spacer")||this.$me.hasClass("upfront-object-spacer"))return!1;if(this.is_object&&typeof this.view.object_group_view=="undefined")return!1;if(this.$me.data("ui-draggable"))return(this.is_group||!this.is_disabled)&&this.$me.draggable("option","disabled",!1),!1;if(!Upfront.Application.user_can_modify_layout())return this.$me.data("ui-draggable")&&(this.is_group||!this.is_disabled)&&this.$me.draggable("option","disabled",!1),!1;this.$me.draggable({revert:!0,revertDuration:0,zIndex:100,helper:"clone",disabled:this.is_disabled,cancel:".upfront-entity_meta, .upfront-element-controls",distance:10,appendTo:this.$main,iframeFix:!0,start:e.proxy(this.on_start,this),drag:e.proxy(this.on_drag,this),stop:e.proxy(this.on_stop,this)})},on_start:function(e,t){this.ed.time_start("drag start"),this.event=e,this.ui=t,this.breakpoint=Upfront.Views.breakpoints_storage.get_breakpoints().get_active().toJSON(),this.is_parent_group=typeof this.view.group_view!="undefined",this.prepare_drag(),this.ed.time_end("drag start"),this.ed.time_start("drag start - trigger"),Upfront.Events.trigger("entity:drag_start",this.view,this.model),this.ed.time_end("drag start")},on_drag:function(e,t){var n=this;this.event=e,this.ui=t,clearTimeout(this._t),this._t=setTimeout(function(){n.update_drop_timeout()},this.ed.timeout),this.update_drop_position(),this.ed.show_debug_element&&this.$helper.find(".upfront-debug-info").text("grid: "+this.current_grid.x+","+this.current_grid.y+" | "+"current: ("+this.current_grid_pos.left+","+this.current_grid_pos.top+"),("+this.current_grid_pos.right+","+this.current_grid_pos.bottom+") | "+"margin size: "+this.drop_top+"/"+this.drop_left)},on_stop:function(t,n){var r=this;this.ed.time_start("drag stop"),this.event=t,this.ui=n,clearTimeout(this._t),clearTimeout(this._focus_t),this.drop.is_me||this.render_drop(),this.clean_elements(),this.update_models(),this.update_views(),this.reset();var i=this.is_group?this.view.$el:this.view.$el.find(".upfront-editable_entity:first"),s="animationend.drop_ani webkitAnimationEnd.drop_ani MSAnimationEnd.drop_ani oAnimationEnd.drop_ani";i.one(s,function(){e(this).removeClass("upfront-dropped"),Upfront.Events.trigger("entity:drag_animate_stop",r.view,r.model),i.off(s)}).addClass("upfront-dropped"),Upfront.Events.trigger("entity:drag_stop",this.view,this.model),this.view.trigger("entity:drop",{col:this.drop_col,left:this.drop_left,top:this.drop_top},this.view,this.model),this.view.trigger("entity:self:drag_stop"),this.ed.time_end("drag stop")},update_vars:function(){var t=this.app.layout.get("regions");this.$helper=e(".ui-draggable-dragging"),this.$wrap=this.$me.closest(".upfront-wrapper"),this.$region=this.$me.closest(".upfront-region"),this.me=this.ed.get_el(this.$me),this.wrap=this.ed.get_wrap(this.$wrap),this.region=this.ed.get_region(this.$region),this.region_model=t.get_by_name(this.region.region),this.$container=this.$region.find(".upfront-modules_container > .upfront-editable_entities_container:first")},create_drop_point:function(){var t=this.ed;t.time_start("fn create_drop_point");var n=this.breakpoint,r=this,i=this.me,s=this.wrap,o=i.$el.data("margin"),u=i.col,a=i.$el.hasClass("upfront-image_module")?1:u>t.min_col?t.min_col:u,f=i.row>t.max_row?t.max_row:i.row,l=i.$el.hasClass("upfront-module-spacer")||i.$el.hasClass("upfront-object-spacer"),c=this.app.layout.get("regions"),h=Upfront.Util.find_sorted(i.$el.closest(".upfront-wrapper")),p=h.length>1,d=h.index(i.$el);_.each(this.drop_areas,function(o,u){if(_.contains(i.drop_areas_created,o))return;var h=o.$el.hasClass("upfront-region"),v=h?o.$el.get(0)==r.current_region.$el.get(0):!1;if(h&&!v)return;var m=o.$el.find(".upfront-editable_entities_container:first"),g=h?o.$el:o.$el.closest(".upfront-region"),y=g.data("name"),b=h?o:t.get_region(g),w=c.get_by_name(y),E=h?w:o.view?o.view.model:w.get("modules").get_by_element_id(o.$el.attr("id")),S=E.get("modules")||E.get("objects"),x=E.get("wrappers"),T=t.parse_modules_to_lines(S,x,n.id,o.col),N=g.hasClass("upfront-region-expand-lock"),C=o.grid.top,k=function(e,t){return!N||N&&t-e+1>=i.row},L=function(e){var n=Upfront.data.wrapper_views[e.model.cid];return n?t.get_wrap(n.$el):!1};_.each(T,function(u,f){_.each(u.wrappers,function(c,h){var v=Upfront.data.wrapper_views[c.model.cid];if(!v)return;var m=v.$el,g=t.get_wrap(m),y=c.spacer,w=h==0,E=s&&g._id==s._id,S=c.modules.length==1,x=E&&S,N=h>0?u.wrappers[h-1]:f>0?_.last(T[f-1].wrappers):!1,A=N?Upfront.data.wrapper_views[N.model.cid]:!1,O=A?A.$el:!1,M=O?t.get_wrap(O):!1,D=h==1||h==0&&f>0&&T[f-1].wrappers.length==1,P=M&&s&&M._id==s._id,H=N?N.spacer:!1,B=P&&N.modules.length==1,j=h+1<u.wrappers.length?u.wrappers[h+1]:f+1<T.length?T[f+1].wrappers[0]:!1,F=j?Upfront.data.wrapper_views[j.model.cid]:!1,I=F?F.$el:!1,q=I?t.get_wrap(I):!1,R=h+1==u.wrappers.length,U=q&&s&&q._id==s._id,z=j?j.spacer:!1,W=U&&j.modules.length==1,X=f+1<T.length?T[f+1].wrappers[0]:!1,V=X?Upfront.data.wrapper_views[X.model.cid]:!1,J=V?V.$el:!1,K=J?t.get_wrap(J):!1,Q=t.get_wrap_el_min(g),G=t.get_wrap_el_min(g,!1,!0),Y=M?t.get_wrap_el_min(M):!1,Z=q?t.get_wrap_el_min(q,!1,!0):!1,et=q?t.get_wrap_el_min(q):!1,tt=K?t.get_wrap_el_min(K,!1,!0):!1,nt=_.map(u.wrappers,L),rt=_.max(nt,function(e){return s&&s._id==e._id?-1:e.grid.bottom}),it=_.min(nt,function(e){return t.get_wrap_el_min(e,!1,!0).grid.top}),st=t.get_wrap_el_min(it,!1,!0),ot=_.find(nt,function(e){return s&&s._id==e._id});ot&&r.current_row_wraps===!1&&(r.current_row_wraps=nt);if(!l&&!y&&((!n||n.default)&&g.col>=a&&(q&&!R&&!x&&(I.find(r.el_selector).size()>1||!U)||M&&!w&&!x&&(O.find(r.el_selector).size()>1||!P)||q&&M&&!R&&!w||!M&&!q&&E&&m.find(r.el_selector).size()>1)||n&&!n.default&&E&&m.find(r.el_selector).size()>1)){var ut=g.grid.top,at=q&&!R&&et?et.grid.left-1:o.grid.right;$els=Upfront.Util.find_sorted(m,r.el_selector),$els.each(function(n){if(e(this).get(0)==i.$el.get(0))return;var s=e(this),o=t.get_el(s),u=o.outer_grid.top==g.grid.top?g.grid.top:ut,a=Math.ceil(o.grid_center.y),f=$els[n-1]?$els.eq(n-1):!1,l=f?t.get_el(f):!1,c=l&&l._id==i._id;r.drops.push({_id:t._new_id(),top:u,bottom:a,left:g.grid.left,right:at,priority:{top:c?l.outer_grid.top:o.outer_grid.top-1,bottom:o.grid.top-1,left:g.grid.left,right:at,index:c?3:5},priority_index:5,type:"inside",insert:["before",s],region:b,is_me:c,is_clear:!1,is_use:!1,is_switch:!1,switch_dir:!1,row_wraps:!1,me_in_row:!1}),ut=a+1});var ft=$els.last(),lt=ft.size()>0?t.get_el(ft):!1,ct=lt&&lt._id==i._id,ht=n&&!n.default&&tt?Math.ceil(tt.grid_center.y):rt.grid.bottom;r.drops.push({_id:t._new_id(),top:ut,bottom:ht,left:g.grid.left,right:at,priority:{top:ct?lt.outer_grid.top:g.grid.bottom,bottom:n&&!n.default&&tt?tt.grid.top:ht,left:g.grid.left,right:at,index:ct?3:5},priority_index:5,type:"inside",insert:["append",g.$el],region:b,is_me:ct,is_clear:!1,is_use:!1,is_switch:!1,switch_dir:!1,row_wraps:!1,me_in_row:!1})}if(n&&!n.default&&p&&d>0)return;if(!l&&w&&(!E||!!q&&!R)){var pt=g.grid.top==o.grid.top?o.grid.top-5:C,dt=t.get_wrap_el_min(g,!1,!0),vt=Math.ceil(dt.grid_center.y),mt=D&&P&&!p,gt=mt?M.grid.top:g.grid.top;k(gt,dt.grid.top-1)&&(r.drops.push({_id:t._new_id(),top:pt,bottom:vt,left:o.grid.left,right:o.grid.right,priority:{top:gt,bottom:st.grid.top-1,left:o.grid.left,right:o.grid.right,index:mt?2:3},priority_index:8,type:"full",insert:["before",g.$el],region:b,is_me:mt,is_clear:!0,is_use:!1,is_switch:!1,switch_dir:!1,row_wraps:!1,me_in_row:!1}),C=vt+1)}if((!l||l&&ot&&(x||!y&&(!q||R||!z)))&&(!q||R)&&(!x||!w)){var yt=!1,bt=Math.ceil(g.grid_center.x)+1,wt=!q||R?o.grid.right:g.grid.right,vt=E&&g.grid.bottom>rt.grid.bottom?g.grid.bottom:rt.grid.bottom;k(g.grid.top,vt)&&r.drops.push({_id:t._new_id(),top:g.grid.top,bottom:vt,left:x?g.grid.left:bt,right:wt,priority:{top:g.grid.top,bottom:vt,left:x?g.grid.left:bt+Math.ceil((wt-bt)/2),right:wt,index:x?1:4},priority_index:10,type:"side-after",insert:["after",g.$el],region:b,is_me:x,is_clear:!1,is_use:!1,is_switch:yt,switch_dir:yt?"left":!1,row_wraps:nt,me_in_row:ot?!0:!1})}if((!l||l&&ot&&(x||!y&&(w||!H)))&&(!x||q&&!R)&&(w||!B)){var Et=!1,St=!1,bt=M&&!w?Math.ceil(M.grid_center.x)+1:g.grid.left,wt=Math.ceil(g.grid_center.x),vt=E&&g.grid.bottom>rt.grid.bottom?g.grid.bottom:rt.grid.bottom;k(g.grid.top,vt)&&r.drops.push({_id:t._new_id(),top:g.grid.top,bottom:vt,left:bt,right:x&&et?et.grid.left-1:wt,priority:{top:g.grid.top,bottom:vt,left:M&&!w?bt+Math.ceil((M.grid.right-bt)/2):bt,right:x&&et?et.grid.left-1:g.grid.left+Math.ceil((wt-g.grid.left)/2)-1,index:x?1:4},priority_index:10,type:"side-before",insert:[Et?"after":"before",g.$el],region:b,is_me:x,is_clear:w,is_use:!1,is_switch:Et||St,switch_dir:Et?"left":St?"right":!1,row_wraps:nt,me_in_row:ot?!0:!1})}})});if(n&&!n.default&&p&&d>0)return;if(l)return;if(T.length>0){var A=T[T.length-1],O=_.last(A.wrappers),M=Upfront.data.wrapper_views[O.model.cid],D=t.get_wrap(M.$el),P=D&&A.wrappers.length==1,H=s&&P&&D._id==s._id&&!p,B=N?o.grid.bottom:o.grid.bottom-C>f?o.grid.bottom+5:C+f,j=_.map(A.wrappers,L),F=_.max(j,function(e){return s&&s._id==e._id?0:e.grid.bottom}),I=F.grid.bottom+1,q=!s||F&&s&&F._id!=s._id,R=q&&I>C?I:C;(k(R,B)||H)&&r.drops.push({_id:t._new_id(),top:C,bottom:B,left:o.grid.left,right:o.grid.right,priority:{top:R,bottom:B,left:o.grid.left,right:o.grid.right,index:H?2:3},priority_index:8,type:"full",insert:["append",m],region:b,is_me:H,is_clear:!0,is_use:!1,is_switch:!1,switch_dir:!1,row_wraps:!1,me_in_row:!1})}else{var B=N?o.grid.bottom:o.grid.bottom-o.grid.top>f?o.grid.bottom:o.grid.top+f;k(o.grid.top,B)&&r.drops.push({_id:t._new_id(),top:o.grid.top,bottom:B,left:o.grid.left,right:o.grid.right,priority:null,priority_index:8,type:"full",insert:["append",m],region:b,is_me:y=="shadow"&&i.region==y,is_clear:!0,is_use:!1,is_switch:!1,switch_dir:!1,row_wraps:!1,me_in_row:!1})}}),t.time_end("fn create_drop_point")},select_drop_point:function(t){var n=this.ed;if(!t||t.is_use)return;n.time_start("fn select_drop");var r=typeof this.drop=="object"&&!t.is_me?!0:!1;_.each(this.drops,function(e){e.is_use=e._id==t._id}),this.drop=t,n.show_debug_element&&(e(".upfront-drop-view-current").removeClass("upfront-drop-view-current"),e("#drop-view-"+t._id).addClass("upfront-drop-view-current")),e(".upfront-drop").remove();var i=this,s=this.me,o=e('<div class="upfront-drop upfront-drop-use"></div>'),u=function(){Upfront.Events.trigger("entity:drag:drop_change",i.view,i.model)},a=t.type=="inside"&&!t.insert[1].hasClass("upfront-module-group")?t.insert[1].parent():t.insert[1],f=t.insert[1].data("breakpoint_order")||0,l=s.width,c=s.height;switch(t.insert[0]){case"before":o.insertBefore(a);break;case"after":o.insertAfter(a);break;case"append":t.insert[1].append(o),f=t.insert[1].children().length}o.css("order",f);if(t.type=="full"||t.type=="inside"){o.css("width",(t.right-t.left+1)*n.col_size);if(!t.priority||t.is_me)t.is_me?(o.css("margin-top",s.height*-1),o.css("height",s.height)):o.css("height",(t.bottom-t.top+1)*n.baseline)}else if(t.type=="side-before"||t.type=="side-after"){var h=a.position();o.css("height",(t.bottom-t.top+1)*n.baseline),t.is_me&&(o.css("width",s.width),t.type=="side-before"?o.css("margin-right",s.width*-1):o.css("margin-left",s.width*-1)),o.css({position:"absolute",top:h.top,left:Upfront.Util.isRTL()?h.left+(t.type=="side-after"?0:a.width()):h.left+(t.type=="side-after"?a.width():0)})}else r&&u();n.time_end("fn select_drop")},prepare_drag:function(){var t=this.ed,n=this.breakpoint;this.$main.addClass("upfront-dragging"),this.view.$el.css("position",""),t.start(this.view,this.model),t.normalize(t.els,t.wraps),t.update_position_data(t.containment.$el),this.update_vars(),this.set_current_region(this.region);var r=this.$me,i=this.me,s=this.$helper,o=r.offset(),u=t.max_row*t.baseline,a=r.data("ui-draggable"),f=this.event.pageY-o.top,l=this.is_parent_group?t.get_position(this.view.group_view.$el):this.is_object?t.get_position(this.view.object_group_view.$el):t.get_region(this.$region),c=!1;f>u/2&&a._adjustOffsetFromHelper({top:Math.round((i.height>u?u:i.height)/2)}),r.css("visibility","hidden"),s.css("max-width",i.width),s.css("height",i.height),s.css("max-height",u),s.css("margin-left",r.css("margin-left")),this.area_col=l.col;if(this.is_parent_group||this.is_object)l.region=this.$region.data("name"),l.group=this.is_parent_group?this.view.group_view.$el.attr("id"):"",l.view=this.is_parent_group?this.view.group_view:this.view.object_group_view,this.drop_areas=[l],this.current_area_col=l.col;else if(n&&!n.default)this.drop_areas=[l];else{var h=!1,p;t.lightbox_cols=!1,_.each(t.regions,function(e){e.$el.hasClass("upfront-region-side-lightbox")&&e.$el.css("display")=="block"&&(h=e,t.lightbox_cols=e.col),e.$el.hasClass("upfront-region-shadow")&&(p=e)}),h?this.drop_areas=[h,p]:this.drop_areas=t.regions}this.current_row_wraps=!1,this.create_drop_point(),this.$wrap.css("min-height","1px"),e(".upfront-drop-me").css("height",(i.outer_grid.bottom-i.outer_grid.top)*t.baseline),this.show_debug_data(),this.select_drop_point(_.find(this.drops,function(e){return e.is_me})),this.$region.addClass("upfront-region-drag-active")},update_drop_timeout:function(){var e=this.breakpoint;this.update_compare_area(),this.update_focus_state(),(!e||e.default)&&!this.is_parent_group&&!this.is_object?this.update_current_region():this.set_current_region(),this.update_current_drop_point()},update_compare_area:function(){var e=this.ed,t=this.$helper,n=Math.ceil(t.outerHeight()/e.baseline)*e.baseline,r=t.outerWidth(),i=t.offset(),s=Upfront.Util.isRTL()?i.left+r:i.left,o=i.top,u=o+n,a=Upfront.Util.isRTL()?s-r:s+r,f=Upfront.Util.isRTL()?s-r/2:s+r/2,l=o+n/2,c=e.get_grid(s,o),h=c.x,p=c.y,d=e.get_grid(a,u),v=d.x-1,m=d.y-1,g=e.get_grid(this.event.pageX,this.event.pageY),y=this.me.col,b=this.focus?e.focus_compare_col:e.compare_col,w=this.focus?e.focus_compare_row:e.compare_row,E=g.y-w/2,E=E<p?p:E,S=g.x-b/2,S=S<h?h:S,x=S+b-1,x=x>v?v:x,T=E+w-1,T=T>m?m:T,T=T>E+e.max_row?E+e.max_row:T,N=[g.x,g.y,E,x,T,S];this.current_grid=g,this.current_grid_pos={top:p,left:h,right:v,bottom:m},this.compare_area={top:E,left:S,right:x,bottom:T},this.compare_area_position=N},update_focus_state:function(){var e=this,t=this.ed,n=this._last_coord?Math.sqrt(Math.pow(this.event.pageX-this._last_coord.x,2)+Math.pow(this.event.pageY-this._last_coord.y,2)):0,r=Date.now();if(this._last_drag_position&&n<=t.update_distance){this._focus_t||(this._focus_t=setTimeout(function(){e.focus=!0,e.focus_coord.x=e.event.pageX,e.focus_coord.y=e.event.pageY,e._last_drag_time=Date.now(),e.update_drop_timeout()},t.focus_timeout));return}clearTimeout(this._focus_t),this._focus_t=!1,this._last_drag_position=this.compare_area_position,this._last_coord.x=this.event.pageX,this._last_coord.y=this.event.pageY,this._last_drag_time=r;if(this.focus){var i=Math.sqrt(Math.pow(this.event.pageX-this.focus_coord.x,2)+Math.pow(this.event.pageY-this.focus_coord.y,2));i>t.focus_out_distance&&(this.focus=!1)}},update_current_drop_point:function(){var e=this,t=_.map(this.drops,function(t){if(t.region._id!=e.current_region._id)return!1;var n=e.get_area_compared(t);return{area:n,drop:t}}).filter(function(e){return e!==!1?!0:!1}),n=_.max(t,function(e){return e.area});if(n.area>0)var r=_.filter(t,function(e){return e.area==n.area}),i=_.sortBy(r,function(t,n,r){var i=t.drop.priority?e.get_area_compared(t.drop.priority):0;return i*1>=t.area?t.drop.priority.index:t.drop.priority_index}),s=_.first(i).drop;else var s=_.find(this.drops,function(e){return e.is_me});this.select_drop_point(s),this.update_drop_position()},update_drop_position:function(){if(!this.drop)return;var t=this.ed,n=this.drop,r=this.current_region?this.current_region.col:this.me.col,i=this.$me.hasClass("upfront-module-spacer")||this.$me.hasClass("upfront-object-spacer"),s=this.$wrap.find(this.el_selector).length==1,o=n.priority?n.priority.top-n.top:0,u=n.priority?n.priority.left-n.left:0,a=n.region.$el.hasClass("upfront-region-expand-lock"),f=n.priority?n.priority.bottom-n.priority.top+1:n.bottom-n.top+1;this.drop_top=0,this.drop_left=0;if(n.is_me||n.me_in_row&&s||i)this.drop_col=this.me.col;else if(n.type=="side-before"||n.type=="side-after"){var l=this.find_column_distribution(n.row_wraps,n.me_in_row&&s,!0,this.current_area_col,!1);this.drop_col=l.apply_col}else this.drop_col=n.priority?n.priority.right-n.priority.left+1:n.right-n.left+1;adjust_bottom=!0,t.show_debug_element&&e("#upfront-compare-area").css({top:(this.compare_area.top-1)*t.baseline,left:(this.compare_area.left-1)*t.col_size+(t.grid_layout.left-t.grid_layout.layout_left),width:(this.compare_area.right-this.compare_area.left+1)*t.col_size,height:(this.compare_area.bottom-this.compare_area.top+1)*t.baseline}).text("("+this.compare_area.left+","+this.compare_area.right+") "+"("+this.compare_area.top+","+this.compare_area.bottom+")")},update_current_region:function(){var t=this,n=this.ed,r=e(".upfront-region-container-wide, .upfront-region-container-clip").not(".upfront-region-container-shadow").last(),i=_.map(n.regions,function(e){var i,s,o,u,a,f=e.$el.closest(".upfront-region-container").get(0)==r.get(0),l=f&&(!e.$el.hasClass("upfront-region-side")||e.$el.hasClass("upfront-region-side-left")||e.$el.hasClass("upfront-region-side-right"))?999999:e.grid.bottom,c=e.$el.hasClass("upfront-region-drag-active"),h=e.$el.hasClass("upfront-region-side-top")||e.$el.hasClass("upfront-region-side-bottom"),a=t.get_area_compared({top:e.grid.top-5,bottom:l+5,left:e.grid.left,right:e.grid.right}),p=e.$el.data("type"),d=n.region_type_priority[p];return a*=d,h&&(a*=2),c&&(a*=1.5),{area:a,region:e}}),s=_.max(i,function(e){return e.area});s.area>0&&s.region.$el.get(0)!=this.current_region.$el.get(0)&&(this.set_current_region(s.region),n.update_position_data(this.$current_container,!1),this.create_drop_point()),n.show_debug_element&&_.each(i,function(e){e.region.$el.find(">.upfront-debug-info").text(e.area)})},set_current_region:function(t){var n=this.app.layout.get("regions");this.current_region=t&&t.$el?t:this.ed.get_region(this.$region),this.current_region.$el.hasClass("upfront-region-drag-active")||(e(".upfront-region-drag-active").removeClass("upfront-region-drag-active"),this.current_region.$el.addClass("upfront-region-drag-active")),this.current_region_model=n.get_by_name(this.current_region.region),this.current_wrappers=this.is_parent_group?this.view.group_view.model.get("wrappers"):this.is_object?this.view.object_group_view.model.get("wrappers"):this.current_region_model.get("wrappers"),this.$current_container=this.is_parent_group?this.view.group_view.$el.find(".upfront-editable_entities_container:first"):this.is_object?this.view.object_group_view.$el.find(".upfront-editable_entities_container:first"):this.current_region.$el.find(".upfront-modules_container > .upfront-editable_entities_container:first"),this.move_region=this.region._id!=this.current_region._id,!this.is_parent_group&&!this.is_object&&(this.current_area_col=this.current_region.col)},get_area_compared:function(e){var t=this.compare_area,n,r,i,s,o;return t.left>=e.left&&t.left<=e.right?i=t.left:t.left<e.left?i=e.left:t.left>e.right&&t.left-e.right<=1&&(i=e.right),t.right>=e.left&&t.right<=e.right?s=t.right:t.right>e.right?s=e.right:t.right<e.left&&e.left-t.right<=1&&(s=e.left),t.top>=e.top&&t.top<=e.bottom?n=t.top:t.top<e.top&&(n=e.top),t.bottom>=e.top&&t.bottom<=e.bottom?r=t.bottom:t.bottom>e.bottom&&(r=e.bottom),n&&r&&i&&s?o=(s-i+1)*(r-n+1):o=0,o?o:0},render_drop:function(){var t=this.ed,n=this.breakpoint,r=e(".upfront-drop-use");this.wrap_only=n&&!n.default?!0:!1;if(!n||n.default){if(this.drop.type!="inside"){var i=Upfront.Util.get_unique_id("wrapper");wrap_model=new Upfront.Models.Wrapper({name:"",properties:[{name:"wrapper_id",value:i},{name:"class",value:t.grid.class+this.drop_col}]}),wrap_view=new Upfront.Views.Wrapper({model:wrap_model}),(this.drop.type=="full"||this.drop.is_clear)&&wrap_model.add_class("clr"),this.current_wrappers.add(wrap_model),wrap_view.parent_view=this.view.parent_view,this.view.wrapper_view=wrap_view,wrap_view.render(),wrap_view.$el.append(this.view.$el),this.drop.type=="side-before"&&this.drop.is_clear&&r.nextAll(".upfront-wrapper").eq(0).removeClass("clr"),r.before(wrap_view.$el),this.new_wrap_view=wrap_view,Upfront.data.wrapper_views[wrap_model.cid]=wrap_view;if(!this.move_region){var s=this.current_wrappers.get_by_wrapper_id(this.$wrap.attr("id"));s&&wrap_model.set_property("breakpoint",Upfront.Util.clone(s.get_property_value_by_name("breakpoint")),!0)}}else{var o=r.closest(".upfront-wrapper"),i=o.attr("id");r.before(this.view.$el)}this.wrapper_id=i,this.model.set_property("wrapper_id",this.wrapper_id,!0),this.$wrap.find(this.el_selector).length==0&&(this.wrap&&this.wrap.grid.left==this.current_region.grid.left&&this.$wrap.nextAll(".upfront-wrapper").eq(0).addClass("clr"),this.$wrap.remove(),this.wrap_only=!0)}},update_models:function(){var t=this,n=this.ed,r=this.breakpoint,i=this.current_wrappers,s=this.$me,o=this.$wrap,u=Upfront.data.region_views[this.current_region_model.cid];_.each(n.wraps,function(e){var t=!r||r.default?e.$el.hasClass("clr"):e.$el.data("breakpoint_clear");e.$el.data("clear",t?"clear":"none")});if(!this.drop.is_me&&this.drop.type=="side-before"){var a=this.drop.insert[1];if(a.size()>0){var f=n.get_wrap(a),l=!r||r.default?a.hasClass("clr"):a.data("breakpoint_clear");(!l||this.drop.is_clear)&&a.data("clear","none")}}n.update_model_margin_classes(s,[n.grid.class+this.drop_col]);if(this.drop.type=="inside"||this.move_region){var c=this.current_wrappers.get_by_wrapper_id(o.attr("id"));c&&c.remove_property("breakpoint",!0),this.model.remove_property("breakpoint",!0)}if(!this.drop.is_me&&(!this.drop.me_in_row||!this.wrap_only)&&(this.drop.type=="side-before"||this.drop.type=="side-after")){var h=this.find_column_distribution(this.drop.row_wraps,!1,!0,this.current_area_col,!1),p=h.remaining_col-(this.drop_col-h.apply_col),d=0,v=!1,m=!1;_.each(this.drop.row_wraps,function(r){r.$el.find(t.el_selector).each(function(){if(e(this).hasClass("upfront-module-spacer")||e(this).hasClass("upfront-object-spacer")){var s=i.get_by_wrapper_id(r.$el.attr("id")),o=n.get_el_model(e(this));i.remove(s),t.model.collection.remove(o),d==0&&(v=!0,(t.drop.type=="side-after"||t.drop.type=="side-before")&&t.drop.insert[1].get(0)==r.$el.get(0)&&(m=!0))}else{var u=h.apply_col;p>0&&(u+=1,p-=1),n.update_model_margin_classes(e(this),[n.grid.class+u]),d==1&&v&&(t.drop.type=="side-before"&&t.drop.insert[1].get(0)==r.$el.get(0)?m=!0:m||r.$el.data("clear","clear"))}d++})}),m&&(t.new_wrap_view!==!1?t.new_wrap_view.$el.data("clear","clear"):t.$wrap.data("clear","clear"))}if(!this.drop.is_me&&!this.drop.me_in_row&&this.wrap_only&&this.current_row_wraps&&!_.isEqual(this.drop.row_wraps,this.current_row_wraps)){var h=this.find_column_distribution(this.current_row_wraps,!0,!1,this.area_col),p=h.remaining_col;h.total>0?_.each(this.current_row_wraps,function(r){if(t.wrap.$el.get(0)==r.$el.get(0))return;r.$el.find(t.el_selector).each(function(){if(e(this).hasClass("upfront-module-spacer")||e(this).hasClass("upfront-object-spacer"))return;var t=h.apply_col;p>0&&(t+=1,p-=1),n.update_model_margin_classes(e(this),[n.grid.class+t])})}):h.spacer_total>0&&_.each(this.current_row_wraps,function(r){if(t.wrap.$el.get(0)==r.$el.get(0))return;r.$el.find(t.el_selector).each(function(){if(!e(this).hasClass("upfront-module-spacer")&&!e(this).hasClass("upfront-object-spacer"))return;var s=i.get_by_wrapper_id(r.$el.attr("id")),o=n.get_el_model(e(this));i.remove(s),t.model.collection.remove(o,{update:!1})})})}this.is_parent_group?n.update_wrappers(this.view.group_view.model,this.view.group_view.$el):this.is_object?n.update_wrappers(this.view.object_group_view.model,this.view.object_group_view.$el):n.update_wrappers(this.current_region_model,this.current_region.$el),this.move_region&&(n.update_model_margin_classes(this.$container.find(".upfront-wrapper").find(this.el_selector)),n.update_wrappers(this.region_model,this.region.$el));if(!r||r.default)if(!this.move_region)this.view.parent_view.preserve_wrappers_breakpoint_order(),this.view.resort_bound_collection(),this.view.parent_view.normalize_child_spacing();else{var g=this.current_region_model.get("modules"),y=[];this.view.region_view._modules_view.preserve_wrappers_breakpoint_order(),this.model.collection.remove(this.model,{silent:!0}),this.model.get("shadow")&&(this.view.trigger("on_layout"),this.model.unset("shadow",{silent:!0})),this.view.region_view._modules_view.normalize_child_spacing(),u._modules_view.preserve_wrappers_breakpoint_order(),s.removeAttr("data-shadow"),this.$current_container.find(".upfront-wrapper").find(this.el_selector).each(function(){var n=e(this).attr("id"),r=g.get_by_element_id(n);!r&&n==s.attr("id")?y.push(t.model):r&&y.push(r)}),g.reset(y)}else{var b=[],w=0,E=this.drop.type!="inside",S=E?Upfront.Util.find_sorted(this.$current_container,"> .upfront-wrapper"):Upfront.Util.find_sorted(s.closest(".upfront-wrapper"),this.el_selector),x=E?0:s.closest(".upfront-wrapper").find(this.el_selector).length,T=!1;!this.drop.is_me&&this.drop.insert[0]=="append"&&E&&(T=S.length-1),S.each(function(){var r=E?n.get_wrap(e(this)):n.get_el(e(this));if(!r)return;T===w&&w++,!t.drop.is_me&&t.drop.insert[0]=="append"&&(!E&&T===!1&&e(this).closest(".upfront-wrapper").get(0)==t.drop.insert[1].get(0)&&(T=w+x-1),(E&&o.get(0)==this||!E&&s.get(0)==this)&&w--),!t.drop.is_me&&t.drop.insert[1].get(0)==this?(t.drop.insert[0]=="before"?(T=w,b.push({$el:e(this),order:w+1,clear:t.drop.type!="side-before"})):t.drop.type=="side-after"&&t.drop.insert[0]=="after"&&(T=w+1,b.push({$el:e(this),order:w,clear:r.outer_grid.left==t.current_region.grid.left})),w++):b.push({$el:e(this),order:w,clear:r.outer_grid.left==t.current_region.grid.left}),w++}),_.each(b,function(e){var u=e.$el.attr("id"),a=E?i.get_by_wrapper_id(u):n.get_el_model(e.$el),f,l;if(!a)return;if(E&&e.$el.get(0)==o.get(0)||!E&&e.$el.get(0)==s.get(0))e.order=T!==!1?T:e.order,e.clear=t.drop.is_clear;f=Upfront.Util.clone(a.get_property_value_by_name("breakpoint")||{}),_.isObject(f[r.id])||(f[r.id]={}),l=f[r.id],l.order=e.order,l.edited=!0,E&&(l.clear=e.clear),a.set_property("breakpoint",f)})}n.update_position_data(this.$current_container),n.normalize(n.els,n.wraps)},update_views:function(){var e=this.view,t=this.model;this.move_region&&(e.region=this.current_region_model,e.region_view=Upfront.data.region_views[e.region.cid],e.parent_view=e.region_view._modules_view,this.new_wrap_view.parent_view=e.parent_view,_.isUndefined(e._modules_view)||(e._modules_view.region_view=e.region_view,_.isUndefined(t.get("modules"))||t.get("modules").each(function(t){var n=Upfront.data.module_views[t.cid];if(!n)return;n.region=e.region,n.region_view=e.region_view})),e.trigger("region:updated"))},clean_elements:function(){e(".upfront-drop").remove(),e(".upfront-drop-view").remove(),e("#upfront-compare-area").remove(),this.$me.css({position:"",top:"",left:"","z-index":"",visibility:"visible"}),this.$wrap.css("min-height",""),this.$current_container.find(".upfront-wrapper").find(this.el_selector).css("max-height",""),e(".upfront-region-drag-active").removeClass("upfront-region-drag-active"),this.$main.removeClass("upfront-dragging")},reset:function(){this.drop_areas_created=[],this.drops=[],this.drop=!1},find_column_distribution:function(e,t,n,r,i){var n=n!==!1,s=_.filter(e,function(e){return e.$el.find("> .upfront-module-view > .upfront-module-spacer, > .upfront-object-view > .upfront-object-spacer").length>0}),o=_.reduce(s,function(e,t){return e+t.col},0),u=(t?e.length-1:e.length)-s.length,i=i!==!1,a=i?r-o:r,f=0,l=0;return n&&u++,u>0?(f=Math.floor(a/u),l=a-f*u):(f=a,l=0),{apply_col:f,remaining_col:l,total_col:a,spacers_col:o,total:u,spacer_total:s.length}},show_debug_data:function(){if(!this.ed.show_debug_element)return;var t=this.ed,n=this.$layout,r=this.$helper;_.each(t.els,function(e){e.$el.find(".upfront-debug-info").size()||e.$el.find(".upfront-editable_entity:first").append('<div class="upfront-debug-info"></div>'),e.$el.find(".upfront-debug-info").text("grid: ("+e.grid.left+","+e.grid.right+"),"+"("+e.grid.top+","+e.grid.bottom+") | "+"outer: ("+e.outer_grid.left+","+e.outer_grid.right+"),("+e.outer_grid.top+","+e.outer_grid.bottom+") | "+"center: "+e.grid_center.x+","+e.grid_center.y)}),_.each(this.drops,function(r){var i=e('<div class="upfront-drop-view"><div class="upfront-drop-priority-view"></div><span class="upfront-drop-view-pos"></span></div>');i.addClass("upfront-drop-view-"+r.type),r.is_me&&i.addClass("upfront-drop-view-me"),i.attr("id","drop-view-"+r._id),i.css({top:(r.top-1)*t.baseline,left:(r.left-1)*t.col_size+(t.grid_layout.left-t.grid_layout.layout_left),width:(r.right-r.left+1)*t.col_size,height:(r.bottom-r.top+1)*t.baseline}),r.priority&&i.find(".upfront-drop-priority-view").css({top:(r.priority.top-r.top)*t.baseline,left:(r.priority.left-r.left)*t.col_size,width:(r.priority.right-r.priority.left+1)*t.col_size,height:(r.priority.bottom-r.priority.top+1)*t.baseline}),i.find(".upfront-drop-view-pos").text("("+r.left+","+r.right+")"+"("+r.top+","+r.bottom+")"+"("+r.type+")"+(r.priority?"("+r.priority.left+","+r.priority.right+")"+"("+r.priority.top+","+r.priority.bottom+")":"")),n.append(i)}),n.append('<div id="upfront-compare-area"></div>'),r.find(".upfront-debug-info").size()||r.append('<div class="upfront-debug-info"></div>')}},t})})(jQuery);