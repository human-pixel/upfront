define(["scripts/upfront/cache/storage-stub"],function(t){return _.extend({},t,{get_storage:function(){return JSON.parse(localStorage.getItem(t.get_storage_id())||"{}")},set_storage:function(e){return localStorage.setItem(t.get_storage_id(),JSON.stringify(e))}})});