!function(t){var e=Upfront.Settings&&Upfront.Settings.l10n?Upfront.Settings.l10n.global.views:Upfront.mainData.l10n.global.views;define(["text!upfront/templates/popup.html","scripts/perfect-scrollbar/perfect-scrollbar"],function(a,i){return Backbone.View.extend({events:{"click #upfront-list-meta .upfront-list_item-component":"handle_sort_request","click .upfront-list-page_item":"handle_page_activate","click .upfront-page-path-item":"handle_page_activate","change #upfront-page_template-select":"template_change","click .editaction.edit":"handle_post_edit","click .editaction.trash":"trash_confirm","click .upfront-posts-delete-cancel-button":"trash_cancel","click .upfront-posts-delete-button":"trash_page"},currentPage:!1,pageListTpl:_.template(t(a).find("#upfront-page-list-tpl").html()),pageListItemTpl:_.template(t(a).find("#upfront-page-list-item-tpl").html()),pagePreviewTpl:_.template(t(a).find("#upfront-page-preview-tpl").html()),allTemplates:[],initialize:function(t){this.collection.on("change reset",this.render,this),this.listenTo(Upfront.Events,"post:saved",this.post_saved)},render:function(){var t=this.collection.getPage(this.collection.pagination.currentPage);this.$el.html(this.pageListTpl({pages:t,pageItemTemplate:this.pageListItemTpl,orderby:this.collection.orderby,order:this.collection.order,canEdit:Upfront.Application.user_can("EDIT"),canEditOwn:Upfront.Application.user_can("EDIT_OWN")})),i.withDebounceUpdate(this.$el.find(".upfront-scroll-panel")[0],!0,!1,!0),this.add_tooltips()},add_tooltips:function(){this.$el.find(".editaction.edit").utooltip({fromTitle:!1,content:Upfront.Settings.l10n.global.content.edit_page,panel:"postEditor"}),this.$el.find(".editaction.trash").utooltip({fromTitle:!1,content:Upfront.Settings.l10n.global.content.trash_page,panel:"postEditor"})},renderPreview:function(t){var e=this.$el.find("#upfront-list-page-preview");e.html(this.pagePreviewTpl({page:t,template:t.template?t.template:"Default",allTemplates:this.allTemplates?this.allTemplates:[]})),this.$el.find("#upfront-page_preview-edit button").one("click",function(){var e="/edit/page/"+t.get("ID");window.location.search.indexOf("dev=true")>-1&&(e+="?dev=true"),Upfront.Popup.close(),_upfront_post_data&&(_upfront_post_data.post_id=t.get("ID")),Upfront.Application.navigate(e,{trigger:!0})})},handle_sort_request:function(e){var a=t(e.target).closest(".upfront-list_item-component"),i=a.attr("data-sortby"),n=this.collection.order;i&&(i==this.collection.orderby&&(n="desc"==n?"asc":"desc"),this.collection.reSort(i,n))},handle_post_edit:function(e){e.preventDefault();var a=t(e.currentTarget).closest(".upfront-list_item-post").attr("data-post_id");_upfront_post_data&&(_upfront_post_data.post_id=a),"home"===a?Upfront.Application.navigate("?editmode=true",{trigger:!0}):Upfront.Application.navigate("/edit/page/"+a,{trigger:!0}),Upfront.Events.trigger("click:edit:navigate",a)},handle_post_view:function(e){e.preventDefault();var a=t(e.currentTarget).closest(".upfront-list_item-post").attr("data-post_id");window.location.href=this.collection.get(a).get("permalink")},handle_page_activate:function(e){var a=this.collection.get(t(e.target).attr("data-post_id"));e.preventDefault(),e.stopPropagation(),this.$(".upfront-list-page_item").removeClass("active"),this.$("#upfront-list-page_item-"+a.id).addClass("active").toggleClass("closed"),this.update_path(a),this.update_page_preview(a),this.currentPage=a},trash_confirm:function(e){e.preventDefault(),t(e.target).parents(".upfront-list_item").find(".upfront-delete-confirm").show()},trash_cancel:function(e){t(e.target).parents(".upfront-delete-confirm").hide()},trash_page:function(e){var a=this,i=t(e.currentTarget).closest(".upfront-list_item-post.upfront-list_item"),n=i.attr("data-post_id");t(e.target).parents(".upfront-delete-confirm").hide(),this.collection.get(n).set("post_status","trash").save().done(function(){a.collection.remove(a.collection.get(n)),i.remove()})},post_saved:function(){this.collection.fetch()},update_path:function(t){for(var e=t,a=[{id:t.get("ID"),title:t.get("post_title")}],i=this.$el.find("#upfront-list-page-path"),n="";e.get("post_parent");)e=this.collection.get(e.get("post_parent")),a.unshift({id:e.get("ID"),title:e.get("post_title")});_.each(a,function(e){n&&(n+="&nbsp;Â»&nbsp;"),n+=e.id==t.id?'<span class="upfront-page-path-current last">'+e.title+"</span>":'<a href="#" class="upfront-page-path-item" data-post_id="'+e.id+'">'+e.title+"</a>"}),i.html(n)},update_page_preview:function(t){var a=this,i=!t.thumbnail||!a.allTemplates||!t.template,n=i?{thumbnail:!t.thumbnail,thumbnailSize:"medium",allTemplates:!a.allTemplates,template:!t.template,action:"get_post_extra",postId:t.get("ID")}:{};i&&this.collection.post(n).done(function(i){i.data.thumbnail&&i.data.postId==t.get("ID")?(a.$("#upfront-page_preview-featured_image img").attr("src",i.data.thumbnail[0]).show(),a.$(".upfront-thumbnailinfo").hide(),t.thumbnail=i.data.thumbnail[0]):(a.$(".upfront-thumbnailinfo").text(e.no_image),a.$(".upfront-page_preview-edit_feature a").html('<i class="icon-plus"></i> '+e.add)),i.data.allTemplates&&(a.allTemplates=i.data.allTemplates),i.data.template&&(t.template=i.data.template,a.renderPreview(t))}),this.renderPreview(t)},template_change:function(e){var a=this,i=t(e.target),n=i.val();this.currentPage.post({action:"update_page_template",postId:this.currentPage.get("ID"),template:n}).done(function(t){a.currentPage.get("ID")==t.data.postId&&(a.currentPage.template=t.data.template)})}})})}(jQuery);