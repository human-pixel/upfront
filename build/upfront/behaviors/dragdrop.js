(function(e){define([],function(){var t=function(e,t){this.initialize(e,t)};return t.prototype={module_selector:"> .upfront-module-view > .upfront-module, > .upfront-module-group",view:!1,model:!1,$me:!1,$wrap:!1,$region:!1,$main:!1,$layout:!1,me:!1,wrap:!1,region:!1,current_region:!1,$container:!1,$current_container:!1,region_model:!1,current_region_model:!1,current_wrappers:!1,is_group:!1,is_parent_group:!1,is_disabled:!1,$helper:!1,event:!1,ui:!1,breakpoint:!1,app:!1,ed:!1,drop_areas:!1,drop_areas_created:!1,drops:!1,drop:!1,drop_col:0,drop_left:0,drop_top:0,area_col:0,current_area_col:0,current_row_wraps:!1,wrapper_id:!1,wrap_only:!1,new_wrap_view:!1,move_region:!1,current_grid:!1,current_grid_pos:!1,compare_area:!1,compare_area_position:!1,compare_col:0,compare_row:0,_last_drag_position:!1,_last_drag_time:0,_last_coord:!1,_t:!1,_focus_t:!1,focus:!1,focus_coord:!1,initialize:function(e,t){this.view=e,this.model=t,this.app=Upfront.Application,this.ed=Upfront.Behaviors.GridEditor,this.drop_areas=[],this.drop_areas_created=[],this.drops=[],this.current_row_wraps=[],this.current_grid={},this.current_grid_pos={},this.compare_area={},this.compare_area_position={},this._last_coord={x:0,y:0},this.focus_coord={x:0,y:0},this.setup()},setup:function(){this.is_group=this.view.$el.hasClass("upfront-module-group"),this.is_parent_group=typeof this.view.group_view!="undefined",this.is_disabled=this.is_parent_group&&!this.view.group_view.$el.hasClass("upfront-module-group-on-edit"),this.$me=this.is_group?this.view.$el:this.view.$el.find(".upfront-editable_entity:first"),this.$main=e(Upfront.Settings.LayoutEditor.Selectors.main),this.$layout=this.$main.find(".upfront-layout");if(this.app.mode.current!==this.app.MODE.THEME&&this.model.get_property_value_by_name("disable_drag"))return!1;if(this.$me.data("ui-draggable"))return(this.is_group||!this.is_disabled)&&this.$me.draggable("option","disabled",!1),!1;this.$me.draggable({revert:!0,revertDuration:0,zIndex:100,helper:"clone",disabled:this.is_disabled,cancel:".upfront-entity_meta, .upfront-element-controls",distance:10,appendTo:this.$main,iframeFix:!0,start:e.proxy(this.on_start,this),drag:e.proxy(this.on_drag,this),stop:e.proxy(this.on_stop,this)})},on_start:function(e,t){this.ed.time_start("drag start"),this.event=e,this.ui=t,this.breakpoint=Upfront.Settings.LayoutEditor.CurrentBreakpoint,this.is_parent_group=typeof this.view.group_view!="undefined",this.prepare_drag(),this.ed.time_end("drag start"),this.ed.time_start("drag start - trigger"),Upfront.Events.trigger("entity:drag_start",this.view,this.model),this.ed.time_end("drag start")},on_drag:function(t,n){this.event=t,this.ui=n,clearTimeout(this._t),this._t=setTimeout(e.proxy(this.update_drop_timeout,this),this.ed.timeout),this.update_drop_position(),this.ed.show_debug_element&&this.$helper.find(".upfront-debug-info").text("grid: "+this.current_grid.x+","+this.current_grid.y+" | "+"current: ("+this.current_grid_pos.left+","+this.current_grid_pos.top+"),("+this.current_grid_pos.right+","+this.current_grid_pos.bottom+") | "+"margin size: "+this.drop_top+"/"+this.drop_left)},on_stop:function(t,n){var r=this;this.ed.time_start("drag stop"),this.event=t,this.ui=n,clearTimeout(this._t),clearTimeout(this._focus_t),this.drop.is_me||this.render_drop(),this.clean_elements(),this.update_models(),this.update_views(),this.reset();var i=this.is_group?this.view.$el:this.view.$el.find(".upfront-editable_entity:first"),s="animationend.drop_ani webkitAnimationEnd.drop_ani MSAnimationEnd.drop_ani oAnimationEnd.drop_ani";i.one(s,function(){e(this).removeClass("upfront-dropped"),Upfront.Events.trigger("entity:drag_animate_stop",r.view,r.model),i.off(s)}).addClass("upfront-dropped"),Upfront.Events.trigger("entity:drag_stop",this.view,this.model),this.view.trigger("entity:drop",{col:this.drop_col,left:this.drop_left,top:this.drop_top},this.view,this.model),this.view.trigger("entity:self:drag_stop"),this.ed.time_end("drag stop")},update_vars:function(){var t=this.app.layout.get("regions");this.$helper=e(".ui-draggable-dragging"),this.$wrap=this.$me.closest(".upfront-wrapper"),this.$region=this.$me.closest(".upfront-region"),this.me=this.ed.get_el(this.$me),this.wrap=this.ed.get_wrap(this.$wrap),this.region=this.ed.get_region(this.$region),this.region_model=t.get_by_name(this.region.region),this.$container=this.$region.find(".upfront-modules_container > .upfront-editable_entities_container:first")},create_drop_point:function(){var t=this.ed;t.time_start("fn create_drop_point");var n=this.breakpoint,r=this,i=this.me,s=this.wrap,o=i.$el.data("margin"),u=i.col,a=i.$el.hasClass("upfront-image_module")?1:u>t.min_col?t.min_col:u,f=i.row>t.max_row?t.max_row:i.row,l=i.$el.hasClass("upfront-module-spacer"),c=Upfront.Util.find_sorted(i.$el.closest(".upfront-wrapper")),h=c.length>1,p=c.index(i.$el);_.each(this.drop_areas,function(o,u){if(_.contains(i.drop_areas_created,o))return;var c=o.$el.hasClass("upfront-region"),d=c?o.$el.get(0)==r.current_region.$el.get(0):!1;if(c&&!d)return;var v=o.$el.find(".upfront-editable_entities_container:first"),m=c?o.$el:o.$el.closest(".upfront-region"),g=m.data("name"),y=c?o:t.get_region(m);$wraps=Upfront.Util.find_sorted(v,"> .upfront-wrapper:visible").filter(function(){return e(this).height()>0}),expand_lock=m.hasClass("upfront-region-expand-lock"),current_full_top=o.grid.top,can_drop=function(e,t){return!expand_lock||expand_lock&&t-e+1>=i.row},first_cb=function(e,n){var r=t.get_wrap(e);return r.outer_grid.left==o.grid.left},$wraps.each(function(u){var f=e(this),c=t.get_wrap(f),d=f.find("> .upfront-module-view > .upfront-module-spacer").length>0,v=c.grid.left==o.grid.left,m=s&&c._id==s._id,g=f.find(r.module_selector).size()==1,b=m&&g,w=$wraps[u-1]?$wraps.eq(u-1):!1,E=w?t.get_wrap(w):!1,S=E&&E.grid.left==o.grid.left,x=E&&s&&E._id==s._id,T=w?w.find("> .upfront-module-view > .upfront-module-spacer").length>0:!1,N=x&&w.find(r.module_selector).size()==1,C=$wraps[u+1]?$wraps.eq(u+1):!1,k=C?t.get_wrap(C):!1,L=k&&k.grid.left==o.grid.left,A=k&&s&&k._id==s._id,O=C?C.find("> .upfront-module-view > .upfront-module-spacer").length>0:!1,M=A&&C.find(r.module_selector).size()==1,D=Upfront.Util.find_from_elements($wraps,f,first_cb,!1),P=D.size()>0?t.get_wrap(D):!1,H=t.get_wrap_el_min(c),B=t.get_wrap_el_min(c,!1,!0),j=E?t.get_wrap_el_min(E):!1,F=k?t.get_wrap_el_min(k,!1,!0):!1,I=k?t.get_wrap_el_min(k):!1,q=P?t.get_wrap_el_min(P,!1,!0):!1,R=v?f:Upfront.Util.find_from_elements($wraps,f,first_cb,!0),U=Upfront.Util.find_from_elements($wraps,R,".upfront-wrapper",!1,first_cb),z=_.union([t.get_wrap(R)],U.map(function(){return t.get_wrap(e(this))}).get()),W=_.max(z,function(e){return s&&s._id==e._id?-1:e.grid.bottom}),X=_.min(z,function(e){return t.get_wrap_el_min(e,!1,!0).grid.top}),V=t.get_wrap_el_min(X,!1,!0),J=_.find(z,function(e){return s&&s._id==e._id});J&&r.current_row_wraps===!1&&(r.current_row_wraps=z);if(!l&&!d&&((!n||n.default)&&c.col>=a&&(k&&!L&&!b&&(C.find(r.module_selector).size()>1||!A)||E&&!v&&!b&&(w.find(r.module_selector).size()>1||!x)||k&&E&&!L&&!v||!E&&!k&&m&&f.find(r.module_selector).size()>1)||n&&!n.default&&m&&f.find(r.module_selector).size()>1)){var K=c.grid.top,Q=k&&!L&&I?I.grid.left-1:o.grid.right;$els=Upfront.Util.find_sorted(f,r.module_selector),$els.each(function(n){if(e(this).get(0)==i.$el.get(0))return;var s=e(this),o=t.get_el(s),u=o.outer_grid.top==c.grid.top?c.grid.top:K,a=Math.ceil(o.grid_center.y),f=$els[n-1]?$els.eq(n-1):!1,l=f?t.get_el(f):!1,h=l&&l._id==i._id;r.drops.push({_id:t._new_id(),top:u,bottom:a,left:c.grid.left,right:Q,priority:{top:h?l.outer_grid.top:o.outer_grid.top-1,bottom:o.grid.top-1,left:c.grid.left,right:Q,index:h?3:5},priority_index:5,type:"inside",insert:["before",s],region:y,is_me:h,is_clear:!1,is_use:!1,is_switch:!1,switch_dir:!1,row_wraps:!1,me_in_row:!1}),K=a+1});var G=$els.last(),Y=G.size()>0?t.get_el(G):!1,Z=Y&&Y._id==i._id,et=n&&!n.default&&q?Math.ceil(q.grid_center.y):W.grid.bottom;r.drops.push({_id:t._new_id(),top:K,bottom:et,left:c.grid.left,right:Q,priority:{top:Z?Y.outer_grid.top:c.grid.bottom,bottom:n&&!n.default&&q?q.grid.top:et,left:c.grid.left,right:Q,index:Z?3:5},priority_index:5,type:"inside",insert:["append",c.$el],region:y,is_me:Z,is_clear:!1,is_use:!1,is_switch:!1,switch_dir:!1,row_wraps:!1,me_in_row:!1})}if(n&&!n.default&&h&&p>0)return;if(!l&&v&&(!m||!!k&&!L)){var tt=c.grid.top==o.grid.top?o.grid.top-5:current_full_top,nt=t.get_wrap_el_min(c,!1,!0),rt=Math.ceil(nt.grid_center.y),it=S&&x&&!h,st=it?E.grid.top:c.grid.top;can_drop(st,nt.grid.top-1)&&(r.drops.push({_id:t._new_id(),top:tt,bottom:rt,left:o.grid.left,right:o.grid.right,priority:{top:st,bottom:V.grid.top-1,left:o.grid.left,right:o.grid.right,index:it?2:3},priority_index:8,type:"full",insert:["before",c.$el],region:y,is_me:it,is_clear:!0,is_use:!1,is_switch:!1,switch_dir:!1,row_wraps:!1,me_in_row:!1}),current_full_top=rt+1)}if((!l||l&&J&&(b||!d&&(!k||L||!O)))&&(!k||L)&&(!b||!v)){var ot=!1,ut=Math.ceil(c.grid_center.x)+1,at=!k||L?o.grid.right:c.grid.right,rt=m&&c.grid.bottom>W.grid.bottom?c.grid.bottom:W.grid.bottom;can_drop(c.grid.top,rt)&&r.drops.push({_id:t._new_id(),top:c.grid.top,bottom:rt,left:b?c.grid.left:ut,right:at,priority:{top:c.grid.top,bottom:rt,left:b?c.grid.left:ut+Math.ceil((at-ut)/2),right:at,index:b?1:4},priority_index:10,type:"side-after",insert:["after",c.$el],region:y,is_me:b,is_clear:!1,is_use:!1,is_switch:ot,switch_dir:ot?"left":!1,row_wraps:z,me_in_row:J?!0:!1})}if((!l||l&&J&&(b||!d&&(v||!T)))&&(!b||k&&!L)&&(v||!N)){var ft=!1,lt=!1,ut=E&&!v?Math.ceil(E.grid_center.x)+1:c.grid.left,at=Math.ceil(c.grid_center.x),rt=m&&c.grid.bottom>W.grid.bottom?c.grid.bottom:W.grid.bottom;can_drop(c.grid.top,rt)&&r.drops.push({_id:t._new_id(),top:c.grid.top,bottom:rt,left:ut,right:b&&I?I.grid.left-1:at,priority:{top:c.grid.top,bottom:rt,left:E&&!v?ut+Math.ceil((E.grid.right-ut)/2):ut,right:b&&I?I.grid.left-1:c.grid.left+Math.ceil((at-c.grid.left)/2)-1,index:b?1:4},priority_index:10,type:"side-before",insert:[ft?"after":"before",c.$el],region:y,is_me:b,is_clear:v,is_use:!1,is_switch:ft||lt,switch_dir:ft?"left":lt?"right":!1,row_wraps:z,me_in_row:J?!0:!1})}});if(n&&!n.default&&h&&p>0)return;if(l)return;if($wraps.size()>0){var b=t.get_wrap($wraps.last()),w=b&&b.grid.left==o.grid.left,E=s&&w&&b._id==s._id&&!h,S=expand_lock?o.grid.bottom:o.grid.bottom-current_full_top>f?o.grid.bottom+5:current_full_top+f,x=_.max(t.wraps,function(e){return e.region!=g?0:s&&s._id==e._id?0:_.contains($wraps.get(),e.$el.get(0))?e.grid.bottom:0}),T=x.grid.bottom+1,N=!s||x&&s&&x._id!=s._id,C=N&&T>current_full_top?T:current_full_top;(can_drop(C,S)||E)&&r.drops.push({_id:t._new_id(),top:current_full_top,bottom:S,left:o.grid.left,right:o.grid.right,priority:{top:C,bottom:S,left:o.grid.left,right:o.grid.right,index:E?2:3},priority_index:8,type:"full",insert:["append",v],region:y,is_me:E,is_clear:!0,is_use:!1,is_switch:!1,switch_dir:!1,row_wraps:!1,me_in_row:!1})}else{var S=expand_lock?o.grid.bottom:o.grid.bottom-o.grid.top>f?o.grid.bottom:o.grid.top+f;can_drop(o.grid.top,S)&&r.drops.push({_id:t._new_id(),top:o.grid.top,bottom:S,left:o.grid.left,right:o.grid.right,priority:null,priority_index:8,type:"full",insert:["append",v],region:y,is_me:g=="shadow"&&i.region==g,is_clear:!0,is_use:!1,is_switch:!1,switch_dir:!1,row_wraps:!1,me_in_row:!1})}}),t.time_end("fn create_drop_point")},select_drop_point:function(t){var n=this.ed;if(t.is_use)return;n.time_start("fn select_drop");var r=typeof this.drop=="object"&&!t.is_me?!0:!1;_.each(this.drops,function(e){e.is_use=e._id==t._id}),this.drop=t,n.show_debug_element&&(e(".upfront-drop-view-current").removeClass("upfront-drop-view-current"),e("#drop-view-"+t._id).addClass("upfront-drop-view-current")),e(".upfront-drop").remove();var i=this,s=this.me,o=e('<div class="upfront-drop upfront-drop-use"></div>'),u=function(){Upfront.Events.trigger("entity:drag:drop_change",i.view,i.model)},a=t.type=="inside"&&!t.insert[1].hasClass("upfront-module-group")?t.insert[1].parent():t.insert[1],f=t.insert[1].data("breakpoint_order")||0,l=s.width,c=s.height;switch(t.insert[0]){case"before":o.insertBefore(a);break;case"after":o.insertAfter(a);break;case"append":t.insert[1].append(o),f=t.insert[1].children().length}o.css("order",f);if(t.type=="full"||t.type=="inside"){o.css("width",(t.right-t.left+1)*n.col_size);if(!t.priority||t.is_me)t.is_me?(o.css("margin-top",s.height*-1),o.css("height",s.height)):o.css("height",(t.bottom-t.top+1)*n.baseline)}else if(t.type=="side-before"||t.type=="side-after"){var h=a.position();o.css("height",(t.bottom-t.top+1)*n.baseline),t.is_me&&(o.css("width",s.width),t.type=="side-before"?o.css("margin-right",s.width*-1):o.css("margin-left",s.width*-1)),o.css({position:"absolute",top:h.top,left:h.left+(t.type=="side-after"?a.width():0)})}else r&&u();n.time_end("fn select_drop")},prepare_drag:function(){var t=this.ed,n=this.breakpoint;this.$main.addClass("upfront-dragging"),this.view.$el.css("position",""),t.start(this.view,this.model),t.normalize(t.els,t.wraps),t.update_position_data(t.containment.$el),this.update_vars(),this.set_current_region(this.region);var r=this.$me,i=this.me,s=this.$helper,o=r.offset(),u=t.max_row*t.baseline,a=r.data("ui-draggable"),f=this.event.pageY-o.top,l=this.is_parent_group?t.get_position(this.view.group_view.$el):t.get_region(this.$region),c=!1;f>u/2&&a._adjustOffsetFromHelper({top:Math.round((i.height>u?u:i.height)/2)}),r.css("visibility","hidden"),s.css("max-width",i.width),s.css("height",i.height),s.css("max-height",u),s.css("margin-left",r.css("margin-left")),this.area_col=l.col;if(this.is_parent_group)l.region=this.$region.data("name"),l.group=this.view.group_view.$el.attr("id"),this.drop_areas=[l],this.current_area_col=l.col;else if(n&&!n.default)this.drop_areas=[l];else{var h=!1,p;t.lightbox_cols=!1,_.each(t.regions,function(e){e.$el.hasClass("upfront-region-side-lightbox")&&e.$el.css("display")=="block"&&(h=e,t.lightbox_cols=e.col),e.$el.hasClass("upfront-region-shadow")&&(p=e)}),h?this.drop_areas=[h,p]:this.drop_areas=t.regions}this.current_row_wraps=!1,this.create_drop_point(),this.$wrap.css("min-height","1px"),e(".upfront-drop-me").css("height",(i.outer_grid.bottom-i.outer_grid.top)*t.baseline),this.show_debug_data(),this.select_drop_point(_.find(this.drops,function(e){return e.is_me})),this.$region.addClass("upfront-region-drag-active")},update_drop_timeout:function(){var e=this.breakpoint;this.update_compare_area(),this.update_focus_state(),!e||e.default?this.update_current_region():this.set_current_region(),this.update_current_drop_point()},update_compare_area:function(){var e=this.ed,t=this.$helper,n=Math.ceil(t.outerHeight()/e.baseline)*e.baseline,r=t.outerWidth(),i=t.offset(),s=i.left,o=i.top,u=o+n,a=s+r,f=s+r/2,l=o+n/2,c=e.get_grid(s,o),h=c.x,p=c.y,d=e.get_grid(a,u),v=d.x-1,m=d.y-1,g=e.get_grid(this.event.pageX,this.event.pageY),y=this.me.col,b=this.focus?e.focus_compare_col:e.compare_col,w=this.focus?e.focus_compare_row:e.compare_row,E=g.y-w/2,E=E<p?p:E,S=g.x-b/2,S=S<h?h:S,x=S+b-1,x=x>v?v:x,T=E+w-1,T=T>m?m:T,T=T>E+e.max_row?E+e.max_row:T,N=[g.x,g.y,E,x,T,S];this.current_grid=g,this.current_grid_pos={top:p,left:h,right:v,bottom:m},this.compare_area={top:E,left:S,right:x,bottom:T},this.compare_area_position=N},update_focus_state:function(){var e=this,t=this.ed,n=this._last_coord?Math.sqrt(Math.pow(this.event.pageX-this._last_coord.x,2)+Math.pow(this.event.pageY-this._last_coord.y,2)):0,r=Date.now();if(this._last_drag_position&&n<=t.update_distance){this._focus_t||(this._focus_t=setTimeout(function(){e.focus=!0,e.focus_coord.x=e.event.pageX,e.focus_coord.y=e.event.pageY,e._last_drag_time=Date.now(),e.update_drop_timeout()},t.focus_timeout));return}clearTimeout(this._focus_t),this._focus_t=!1,this._last_drag_position=this.compare_area_position,this._last_coord.x=this.event.pageX,this._last_coord.y=this.event.pageY,this._last_drag_time=r;if(this.focus){var i=Math.sqrt(Math.pow(this.event.pageX-this.focus_coord.x,2)+Math.pow(this.event.pageY-this.focus_coord.y,2));i>t.focus_out_distance&&(this.focus=!1)}},update_current_drop_point:function(){var e=this,t=_.map(this.drops,function(t){if(t.region._id!=e.current_region._id)return!1;var n=e.get_area_compared(t);return{area:n,drop:t}}).filter(function(e){return e!==!1?!0:!1}),n=_.max(t,function(e){return e.area});if(n.area>0)var r=_.filter(t,function(e){return e.area==n.area}),i=_.sortBy(r,function(t,n,r){var i=t.drop.priority?e.get_area_compared(t.drop.priority):0;return i*1>=t.area?t.drop.priority.index:t.drop.priority_index}),s=_.first(i).drop;else var s=_.find(this.drops,function(e){return e.is_me});this.select_drop_point(s),this.update_drop_position()},update_drop_position:function(){var t=this.ed,n=this.drop,r=this.current_region?this.current_region.col:this.me.col,i=this.$me.hasClass("upfront-module-spacer"),s=this.$wrap.find(this.module_selector).length==1,o=n.priority?n.priority.top-n.top:0,u=n.priority?n.priority.left-n.left:0,a=n.region.$el.hasClass("upfront-region-expand-lock"),f=n.priority?n.priority.bottom-n.priority.top+1:n.bottom-n.top+1;this.drop_top=0,this.drop_left=0;if(n.is_me||n.me_in_row&&s||i)this.drop_col=this.me.col;else if(n.type=="side-before"||n.type=="side-after"){var l=this.find_column_distribution(n.row_wraps,n.me_in_row&&s,!0,this.current_area_col,!1);this.drop_col=l.apply_col}else this.drop_col=n.priority?n.priority.right-n.priority.left+1:n.right-n.left+1;if(this.is_group){var c=this.model.get_property_value_by_name("original_col");_.isNumber(c)&&c>r&&(r=c)}this.drop_col=this.drop_col<=r?this.drop_col:r,adjust_bottom=!0,t.show_debug_element&&e("#upfront-compare-area").css({top:(this.compare_area.top-1)*t.baseline,left:(this.compare_area.left-1)*t.col_size+(t.grid_layout.left-t.grid_layout.layout_left),width:(this.compare_area.right-this.compare_area.left+1)*t.col_size,height:(this.compare_area.bottom-this.compare_area.top+1)*t.baseline}).text("("+this.compare_area.left+","+this.compare_area.right+") "+"("+this.compare_area.top+","+this.compare_area.bottom+")")},update_current_region:function(){var t=this,n=this.ed,r=e(".upfront-region-container-wide, .upfront-region-container-clip").not(".upfront-region-container-shadow").last(),i=_.map(n.regions,function(e){var i,s,o,u,a,f=e.$el.closest(".upfront-region-container").get(0)==r.get(0),l=f&&(!e.$el.hasClass("upfront-region-side")||e.$el.hasClass("upfront-region-side-left")||e.$el.hasClass("upfront-region-side-right"))?999999:e.grid.bottom,c=e.$el.hasClass("upfront-region-drag-active"),h=e.$el.hasClass("upfront-region-side-top")||e.$el.hasClass("upfront-region-side-bottom"),a=t.get_area_compared({top:e.grid.top-5,bottom:l+5,left:e.grid.left,right:e.grid.right}),p=e.$el.data("type"),d=n.region_type_priority[p];return a*=d,h&&(a*=2),c&&(a*=1.5),{area:a,region:e}}),s=_.max(i,function(e){return e.area});s.area>0&&s.region.$el.get(0)!=this.current_region.$el.get(0)&&(this.set_current_region(s.region),n.update_position_data(this.$current_container,!1),this.create_drop_point()),n.show_debug_element&&_.each(i,function(e){e.region.$el.find(">.upfront-debug-info").text(e.area)})},set_current_region:function(t){var n=this.app.layout.get("regions");this.current_region=t&&t.$el?t:this.ed.get_region(this.$region),this.current_region.$el.hasClass("upfront-region-drag-active")||(e(".upfront-region-drag-active").removeClass("upfront-region-drag-active"),this.current_region.$el.addClass("upfront-region-drag-active")),this.current_region_model=n.get_by_name(this.current_region.region),this.current_wrappers=this.is_parent_group?this.view.group_view.model.get("wrappers"):this.current_region_model.get("wrappers"),this.$current_container=this.is_parent_group?this.view.group_view.$el.find(".upfront-editable_entities_container:first"):this.current_region.$el.find(".upfront-modules_container > .upfront-editable_entities_container:first"),this.move_region=this.region._id!=this.current_region._id,this.is_parent_group||(this.current_area_col=this.current_region.col)},get_area_compared:function(e){var t=this.compare_area,n,r,i,s,o;return t.left>=e.left&&t.left<=e.right?i=t.left:t.left<e.left&&(i=e.left),t.right>=e.left&&t.right<=e.right?s=t.right:t.right>e.right&&(s=e.right),t.top>=e.top&&t.top<=e.bottom?n=t.top:t.top<e.top&&(n=e.top),t.bottom>=e.top&&t.bottom<=e.bottom?r=t.bottom:t.bottom>e.bottom&&(r=e.bottom),n&&r&&i&&s?o=(s-i+1)*(r-n+1):o=0,o?o:0},render_drop:function(){var t=this.ed,n=this.breakpoint,r=e(".upfront-drop-use");this.wrap_only=n&&!n.default?!0:!1;if(!n||n.default){if(this.drop.type!="inside"){var i=Upfront.Util.get_unique_id("wrapper");wrap_model=new Upfront.Models.Wrapper({name:"",properties:[{name:"wrapper_id",value:i},{name:"class",value:t.grid.class+this.drop_col}]}),wrap_view=new Upfront.Views.Wrapper({model:wrap_model}),(this.drop.type=="full"||this.drop.is_clear)&&wrap_model.add_class("clr"),this.current_wrappers.add(wrap_model),wrap_view.parent_view=this.view.parent_view,this.view.wrapper_view=wrap_view,wrap_view.render(),wrap_view.$el.append(this.view.$el),this.drop.type=="side-before"&&this.drop.is_clear&&r.nextAll(".upfront-wrapper").eq(0).removeClass("clr"),r.before(wrap_view.$el),this.new_wrap_view=wrap_view,Upfront.data.wrapper_views[wrap_model.cid]=wrap_view}else{var s=r.closest(".upfront-wrapper"),i=s.attr("id");r.before(this.view.$el)}this.wrapper_id=i,this.$wrap.find(this.module_selector).length==0&&(this.wrap&&this.wrap.grid.left==this.current_region.grid.left&&this.$wrap.nextAll(".upfront-wrapper").eq(0).addClass("clr"),this.$wrap.remove(),this.wrap_only=!0)}},update_models:function(){var t=this,n=this.ed,r=this.breakpoint,i=this.current_wrappers,s=this.$me,o=this.$wrap;_.each(n.wraps,function(e){var t=!r||r.default?e.$el.hasClass("clr"):e.$el.data("breakpoint_clear");e.$el.data("clear",t?"clear":"none")});if(!this.drop.is_me&&this.drop.type=="side-before"){var u=this.drop.insert[1];if(u.size()>0){var a=n.get_wrap(u),f=!r||r.default?u.hasClass("clr"):u.data("breakpoint_clear");(!f||this.drop.is_clear)&&u.data("clear","none")}}n.update_model_margin_classes(s,[n.grid.class+this.drop_col]);if(!this.drop.is_me&&(!this.drop.me_in_row||!this.wrap_only)&&(this.drop.type=="side-before"||this.drop.type=="side-after")){var l=this.find_column_distribution(this.drop.row_wraps,!1,!0,this.current_area_col,!1),c=l.remaining_col-(this.drop_col-l.apply_col),h=0,p=!1,d=!1;_.each(this.drop.row_wraps,function(r){r.$el.find(t.module_selector).each(function(){if(e(this).hasClass("upfront-module-spacer")){var s=i.get_by_wrapper_id(r.$el.attr("id")),o=n.get_el_model(e(this));i.remove(s),t.model.collection.remove(o),h==0&&(p=!0,t.drop.type=="side-after"&&t.drop.insert[1].get(0)==r.$el.get(0)&&(d=!0))}else{var u=l.apply_col;c>0&&(u+=1,c-=1),n.update_model_margin_classes(e(this),[n.grid.class+u]),h==1&&p&&(t.drop.type=="side-before"&&t.drop.insert[1].get(0)==r.$el.get(0)?d=!0:r.$el.data("clear","clear"))}h++})}),d&&(t.new_wrap_view!==!1?t.new_wrap_view.$el.data("clear","clear"):t.$wrap.data("clear","clear"))}if(!this.drop.is_me&&!this.drop.me_in_row&&this.wrap_only&&this.current_row_wraps&&!_.isEqual(this.drop.row_wraps,this.current_row_wraps)){var l=this.find_column_distribution(this.current_row_wraps,!0,!1,this.area_col),c=l.remaining_col;l.total>0?_.each(this.current_row_wraps,function(r){if(t.wrap.$el.get(0)==r.$el.get(0))return;r.$el.find(t.module_selector).each(function(){if(e(this).hasClass("upfront-module-spacer"))return;var t=l.apply_col;c>0&&(t+=1,c-=1),n.update_model_margin_classes(e(this),[n.grid.class+t])})}):l.spacer_total>0&&_.each(this.current_row_wraps,function(r){if(t.wrap.$el.get(0)==r.$el.get(0))return;r.$el.find(t.module_selector).each(function(){if(!e(this).hasClass("upfront-module-spacer"))return;var s=i.get_by_wrapper_id(r.$el.attr("id")),o=n.get_el_model(e(this));i.remove(s),t.model.collection.remove(o,{update:!1})})})}this.is_parent_group?n.update_wrappers(this.view.group_view.model,this.view.group_view.$el):n.update_wrappers(this.current_region_model,this.current_region.$el),this.move_region&&(n.update_model_margin_classes(this.$container.find(".upfront-wrapper").find(this.module_selector)),n.update_wrappers(this.region_model,this.region.$el));if(!r||r.default){this.wrapper_id&&this.model.set_property("wrapper_id",this.wrapper_id,!0);if(!this.move_region)this.view.resort_bound_collection();else{var v=this.current_region_model.get("modules"),m=[];this.model.collection.remove(this.model,{silent:!0}),this.model.get("shadow")&&(this.view.trigger("on_layout"),this.model.unset("shadow",{silent:!0})),s.removeAttr("data-shadow"),this.$current_container.find(".upfront-wrapper").find(this.module_selector).each(function(){var n=e(this).attr("id"),r=v.get_by_element_id(n);!r&&n==s.attr("id")?m.push(t.model):r&&m.push(r)}),v.reset(m)}}else{var g=[],y=0,b=this.drop.type!="inside",w=b?Upfront.Util.find_sorted(this.$current_container,"> .upfront-wrapper"):Upfront.Util.find_sorted(s.closest(".upfront-wrapper"),this.module_selector),E=b?0:s.closest(".upfront-wrapper").find(this.module_selector).length,S=!1;!this.drop.is_me&&this.drop.insert[0]=="append"&&b&&(S=w.length-1),w.each(function(){var r=b?n.get_wrap(e(this)):n.get_el(e(this));if(!r)return;S===y&&y++,!t.drop.is_me&&t.drop.insert[0]=="append"&&(!b&&S===!1&&e(this).closest(".upfront-wrapper").get(0)==t.drop.insert[1].get(0)&&(S=y+E-1),(b&&o.get(0)==this||!b&&s.get(0)==this)&&y--),!t.drop.is_me&&t.drop.insert[1].get(0)==this?(t.drop.insert[0]=="before"?(S=y,g.push({$el:e(this),order:y+1,clear:t.drop.type!="side-before"})):t.drop.type=="side-after"&&t.drop.insert[0]=="after"&&(S=y+1,g.push({$el:e(this),order:y,clear:r.outer_grid.left==t.current_region.grid.left})),y++):g.push({$el:e(this),order:y,clear:r.outer_grid.left==t.current_region.grid.left}),y++}),_.each(g,function(e){var u=e.$el.attr("id"),a=b?i.get_by_wrapper_id(u):n.get_el_model(e.$el),f,l;if(!a)return;if(b&&e.$el.get(0)==o.get(0)||!b&&e.$el.get(0)==s.get(0))e.order=S!==!1?S:e.order,e.clear=t.drop.is_clear;f=Upfront.Util.clone(a.get_property_value_by_name("breakpoint")||{}),_.isObject(f[r.id])||(f[r.id]={}),l=f[r.id],l.order=e.order,l.edited=!0,b&&(l.clear=e.clear),a.set_property("breakpoint",f)})}n.update_position_data(this.$current_container),n.normalize(n.els,n.wraps)},update_views:function(){var e=this.view,t=this.model;this.move_region&&(e.region=this.current_region_model,e.region_view=Upfront.data.region_views[e.region.cid],e.parent_view=e.region_view._modules_view,_.isUndefined(e._modules_view)||(e._modules_view.region_view=e.region_view,_.isUndefined(t.get("modules"))||t.get("modules").each(function(t){var n=Upfront.data.module_views[t.cid];if(!n)return;n.region=e.region,n.region_view=e.region_view})),e.trigger("region:updated"))},clean_elements:function(){e(".upfront-drop").remove(),e(".upfront-drop-view").remove(),e("#upfront-compare-area").remove(),this.$me.css({position:"",top:"",left:"","z-index":"",visibility:"visible"}),this.$wrap.css("min-height",""),this.$current_container.find(".upfront-wrapper").find(this.module_selector).css("max-height",""),e(".upfront-region-drag-active").removeClass("upfront-region-drag-active"),this.$main.removeClass("upfront-dragging")},reset:function(){this.drop_areas_created=[],this.drops=[],this.drop=!1},find_column_distribution:function(e,t,n,r,i){var n=n!==!1,s=_.filter(e,function(e){return e.$el.find("> .upfront-module-view > .upfront-module-spacer").length>0}),o=_.reduce(s,function(e,t){return e+t.col},0),u=(t?e.length-1:e.length)-s.length,i=i!==!1,a=i?r-o:r,f=0,l=0;return n&&u++,u>0?(f=Math.floor(a/u),l=a-f*u):(f=a,l=0),{apply_col:f,remaining_col:l,total_col:a,spacers_col:o,total:u,spacer_total:s.length}},show_debug_data:function(){if(!this.ed.show_debug_element)return;var t=this.ed,n=this.$layout,r=this.$helper;_.each(t.els,function(e){e.$el.find(".upfront-debug-info").size()||e.$el.find(".upfront-editable_entity:first").append('<div class="upfront-debug-info"></div>'),e.$el.find(".upfront-debug-info").text("grid: ("+e.grid.left+","+e.grid.right+"),"+"("+e.grid.top+","+e.grid.bottom+") | "+"outer: ("+e.outer_grid.left+","+e.outer_grid.right+"),("+e.outer_grid.top+","+e.outer_grid.bottom+") | "+"center: "+e.grid_center.x+","+e.grid_center.y)}),_.each(this.drops,function(r){var i=e('<div class="upfront-drop-view"><div class="upfront-drop-priority-view"></div><span class="upfront-drop-view-pos"></span></div>');i.addClass("upfront-drop-view-"+r.type),r.is_me&&i.addClass("upfront-drop-view-me"),i.attr("id","drop-view-"+r._id),i.css({top:(r.top-1)*t.baseline,left:(r.left-1)*t.col_size+(t.grid_layout.left-t.grid_layout.layout_left),width:(r.right-r.left+1)*t.col_size,height:(r.bottom-r.top+1)*t.baseline}),r.priority&&i.find(".upfront-drop-priority-view").css({top:(r.priority.top-r.top)*t.baseline,left:(r.priority.left-r.left)*t.col_size,width:(r.priority.right-r.priority.left+1)*t.col_size,height:(r.priority.bottom-r.priority.top+1)*t.baseline}),i.find(".upfront-drop-view-pos").text("("+r.left+","+r.right+")"+"("+r.top+","+r.bottom+")"+"("+r.type+")"+(r.priority?"("+r.priority.left+","+r.priority.right+")"+"("+r.priority.top+","+r.priority.bottom+")":"")),n.append(i)}),n.append('<div id="upfront-compare-area"></div>'),r.find(".upfront-debug-info").size()||r.append('<div class="upfront-debug-info"></div>')}},t})})(jQuery);