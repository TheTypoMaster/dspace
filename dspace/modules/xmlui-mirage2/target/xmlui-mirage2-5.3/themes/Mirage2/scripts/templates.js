this["DSpace"] = this["DSpace"] || {};
this["DSpace"]["templates"] = this["DSpace"]["templates"] || {};

this["DSpace"]["templates"]["discovery_advanced_filters"] = Handlebars.template({"1":function(depth0,helpers,partials,data,depths) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<div id=\"aspect_discovery_SimpleSearch_row_filter-new-"
    + escapeExpression(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"index","hash":{},"data":data}) : helper)))
    + "\"\n     class=\"ds-form-item row advanced-filter-row search-filter\">\n    <div class=\"col-xs-4 col-sm-2\">\n        <p>\n            <select id=\"aspect_discovery_SimpleSearch_field_filtertype_"
    + escapeExpression(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"index","hash":{},"data":data}) : helper)))
    + "\" class=\"ds-select-field form-control\"\n                    name=\"filtertype_"
    + escapeExpression(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"index","hash":{},"data":data}) : helper)))
    + "\">\n";
  stack1 = ((helpers.set_selected || (depth0 && depth0.set_selected) || helperMissing).call(depth0, (depth0 != null ? depth0.type : depth0), {"name":"set_selected","hash":{},"fn":this.program(2, data, depths),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  buffer += "            </select>\n        </p>\n    </div>\n    <div class=\"col-xs-4 col-sm-2\">\n        <p>\n            <select id=\"aspect_discovery_SimpleSearch_field_filter_relational_operator_"
    + escapeExpression(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"index","hash":{},"data":data}) : helper)))
    + "\"\n                    class=\"ds-select-field form-control\" name=\"filter_relational_operator_"
    + escapeExpression(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"index","hash":{},"data":data}) : helper)))
    + "\">\n";
  stack1 = ((helpers.set_selected || (depth0 && depth0.set_selected) || helperMissing).call(depth0, (depth0 != null ? depth0.relational_operator : depth0), {"name":"set_selected","hash":{},"fn":this.program(5, data, depths),"inverse":this.noop,"data":data}));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "            </select>\n        </p>\n    </div>\n    <div class=\"col-xs-4 col-sm-6\">\n        <p>\n            <input id=\"aspect_discovery_SimpleSearch_field_filter_"
    + escapeExpression(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"index","hash":{},"data":data}) : helper)))
    + "\"\n                   class=\"ds-text-field form-control discovery-filter-input discovery-filter-input\"\n                   name=\"filter_"
    + escapeExpression(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"index","hash":{},"data":data}) : helper)))
    + "\" type=\"text\" value=\""
    + escapeExpression(((helper = (helper = helpers.query || (depth0 != null ? depth0.query : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"query","hash":{},"data":data}) : helper)))
    + "\">\n        </p>\n    </div>\n    <div class=\"hidden-xs col-sm-2\">\n        <div class=\"btn-group btn-group-justified\">\n                <p class=\"btn-group\">\n                    <button id=\"aspect_discovery_SimpleSearch_field_add-filter_"
    + escapeExpression(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"index","hash":{},"data":data}) : helper)))
    + "\"\n                            class=\"ds-button-field btn btn-default filter-control filter-add filter-control filter-add\"\n                            name=\"add-filter_"
    + escapeExpression(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"index","hash":{},"data":data}) : helper)))
    + "\" type=\"submit\" title=\"Add Filter\"><span\n                            class=\"glyphicon glyphicon-plus-sign\" aria-hidden=\"true\"></span></button>\n                </p>\n                <p class=\"btn-group\">\n                    <button id=\"aspect_discovery_SimpleSearch_field_remove-filter_"
    + escapeExpression(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"index","hash":{},"data":data}) : helper)))
    + "\"\n                            class=\"ds-button-field btn btn-default filter-control filter-remove filter-control filter-remove\"\n                            name=\"remove-filter_"
    + escapeExpression(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"index","hash":{},"data":data}) : helper)))
    + "\" type=\"submit\" title=\"Remove\"><span\n                            class=\"glyphicon glyphicon-minus-sign\" aria-hidden=\"true\"></span></button>\n                </p>\n        </div>\n    </div>\n</div>\n";
},"2":function(depth0,helpers,partials,data,depths) {
  var stack1, buffer = "";
  stack1 = helpers.each.call(depth0, ((stack1 = (depths[2] != null ? depths[2].i18n : depths[2])) != null ? stack1.filtertype : stack1), {"name":"each","hash":{},"fn":this.program(3, data, depths),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"3":function(depth0,helpers,partials,data) {
  var lambda=this.lambda, escapeExpression=this.escapeExpression;
  return "                <option value=\""
    + escapeExpression(lambda((data && data.key), depth0))
    + "\">"
    + escapeExpression(lambda(depth0, depth0))
    + "</option>\n";
},"5":function(depth0,helpers,partials,data,depths) {
  var stack1, buffer = "";
  stack1 = helpers.each.call(depth0, ((stack1 = (depths[2] != null ? depths[2].i18n : depths[2])) != null ? stack1.filter_relational_operator : stack1), {"name":"each","hash":{},"fn":this.program(3, data, depths),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data,depths) {
  var stack1, helper, options, functionType="function", helperMissing=helpers.helperMissing, blockHelperMissing=helpers.blockHelperMissing, buffer = "<!--\n\n    The contents of this file are subject to the license and copyright\n    detailed in the LICENSE and NOTICE files at the root of the source\n    tree and available online at\n\n    http://www.dspace.org/license/\n\n-->\n";
  stack1 = ((helper = (helper = helpers.filters || (depth0 != null ? depth0.filters : depth0)) != null ? helper : helperMissing),(options={"name":"filters","hash":{},"fn":this.program(1, data, depths),"inverse":this.noop,"data":data}),(typeof helper === functionType ? helper.call(depth0, options) : helper));
  if (!helpers.filters) { stack1 = blockHelperMissing.call(depth0, stack1, options); }
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true,"useDepths":true});



this["DSpace"]["templates"]["discovery_simple_filters"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "    <label href=\"#\" class=\"label label-primary\" data-index=\""
    + escapeExpression(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"index","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.query || (depth0 != null ? depth0.query : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"query","hash":{},"data":data}) : helper)))
    + "&nbsp;&times;</label>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, buffer = "<!--\n\n    The contents of this file are subject to the license and copyright\n    detailed in the LICENSE and NOTICE files at the root of the source\n    tree and available online at\n\n    http://www.dspace.org/license/\n\n-->\n";
  stack1 = helpers.each.call(depth0, (depth0 != null ? depth0.orig_filters : depth0), {"name":"each","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer;
},"useData":true});