(function(e,t){function r(){var t=((Upfront.data||{}).Compat||{}).theme||"your current theme",r=((Upfront.data||{}).Compat||{}).theme_url;return _nag=e.magnificPopup.open({items:{src:'<div class="upfront-version_compatibility-nag"><p>A new version of <b>'+t+"</b> is available. We recommend you Update <b>"+t+"</b> before making any edits.</p>"+"<div>"+'<a class="boot" href="#boot">Proceed to edit</a>'+(r?'<a class="update" href="'+r+'">Update '+t+"</a>":"")+"</div>"+"</div>"+"",type:"inline"},mainClass:"uf-upgrade-notice"}),e(".upfront-version_compatibility-nag").find('a[href="#boot"]').off("click").on("click",function(t){return t.preventDefault&&t.preventDefault(),t.stopPropagation&&t.stopPropagation(),e.magnificPopup.close(),Upfront.Application.start=n,n.apply(Upfront.Application),!1}).end(),!1}var n;(function i(){if(!((window.Upfront||{}).Events||{}).on)return setTimeout(i);Upfront.Events.on("application:loaded:layout_editor",function(){n=Upfront.Application.start,Upfront.Application.start=r})})()})(jQuery);