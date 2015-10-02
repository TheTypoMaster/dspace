/*
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
(function($) {
    DSpace.getTemplate = function(name) {
        if (DSpace.dev_mode || DSpace.templates === undefined || DSpace.templates[name] === undefined) {
            $.ajax({
                url : DSpace.theme_path + 'templates/' + name + '.hbs',
                success : function(data) {
                    if (DSpace.templates === undefined) {
                        DSpace.templates = {};
                    }
                    DSpace.templates[name] = Handlebars.compile(data);
                },
                async : false
            });
        }
        return DSpace.templates[name];
    };
})(jQuery);
/*
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
(function($){
    var advanced_filters_template, simple_filters_template;

    Handlebars.registerHelper('set_selected', function(value, options) {
        var $el = $('<select />').html( options.fn(this) );
        $el.find('[value=' + value + ']').attr({'selected':'selected'});
        return $el.html();
    });

    if (typeof window.DSpace.discovery !== 'undefined') {
        DSpace.discovery.start_index = 1;

        $(function () {
            calculateFilterIndices();
            backupOriginalFilters();
            assignGlobalEventHandlers();
            renderSimpleFilterSection();
            renderAdvancedFilterSection();
        });
    }





    function getAdvancedFiltersTemplate() {
        if (!advanced_filters_template) {
            advanced_filters_template = DSpace.getTemplate('discovery_advanced_filters');
        }

        return advanced_filters_template;
    }

    function getSimpleFiltersTemplate() {
        if (!simple_filters_template) {
            simple_filters_template = DSpace.getTemplate('discovery_simple_filters');
        }

        return simple_filters_template;
    }

    function getNextFilterIndex() {
        return DSpace.discovery.start_index + DSpace.discovery.filters.length;
    }

    function addNewFilter(index, type, relational_operator, query) {
        if (typeof index === 'number') {
            DSpace.discovery.filters.splice(index - DSpace.discovery.start_index, 0, {
                index: index,
                type: type,
                relational_operator: relational_operator,
                query: query
            });
            calculateFilterIndices();
        }
        else {
            DSpace.discovery.filters.push({
                index: getNextFilterIndex(),
                type: type,
                relational_operator: relational_operator,
                query: query
            });
        }
    }

    function getIndexFromFilterRow(filterRow) {
        return /filter-new-(\d+)/.exec(filterRow.attr('id'))[1] * 1;
    }

    function updateFilterValues(filterRow) {
        var index, type, relational_operator, query, filter;
        index = getIndexFromFilterRow(filterRow);
        type = filterRow.find('select[name^="filtertype_"]').val();
        relational_operator = filterRow.find('select[name^="filter_relational_operator_"]').val();
        query = filterRow.find('input[name^="filter_"]').val();
        filter = {
            index: index,
            type: type,
            relational_operator: relational_operator,
            query: query
        };
        replaceFilter(filter);
    }

    function replaceFilter(filter) {
        for (var i = 0; i < DSpace.discovery.filters.length; i++) {
            if (DSpace.discovery.filters[i].index === filter.index) {
                DSpace.discovery.filters[i] = filter;
                break;
            }
        }
        calculateFilterIndices();
    }

    function calculateFilterIndices() {
        for (var i = 0; i < DSpace.discovery.filters.length; i++) {
            DSpace.discovery.filters[i].index = i + DSpace.discovery.start_index;
        }
    }

    function removeFilterAtIndex(index) {
        for (var i = 0; i < DSpace.discovery.filters.length; i++) {
            var filter = DSpace.discovery.filters[i];
            if (filter.index === index) {
                DSpace.discovery.filters.splice(i, 1);
                break;
            }
        }
        calculateFilterIndices();
    }

    function renderAdvancedFilterSection() {
        var template, html, wrapper;

        if (DSpace.discovery.filters.length === 0) {
            addNewFilter(null, null, null, '');
        }

        template = getAdvancedFiltersTemplate();
        html = template({
            filters: DSpace.discovery.filters,
            i18n: DSpace.i18n.discovery
        });

        unAssignAdvancedFilterEventHandlers(); //prevents memory leaks
        $('#new-filters-wrapper').remove();
        wrapper = $('<div id="new-filters-wrapper"/>').html(html);
        $('#aspect_discovery_SimpleSearch_row_filter-controls').before(wrapper);
        assignAdvancedFilterEventHandlers();
    }

    function renderSimpleFilterSection() {
        var template, html, wrapper;

        if (DSpace.discovery.filters.length > 0) {
            $('.active-filters-label').removeClass('hidden');
        }

        template = getSimpleFiltersTemplate();
        html = template(DSpace.discovery);

        unAssignSimpleFilterEventHandlers();
        $('#filters-overview-wrapper').remove();
        wrapper = $('<div id="filters-overview-wrapper"/>').html(html);
        $('#filters-overview-wrapper-squared').html('').append(wrapper);
        assignSimpleFilterEventHandlers();
    }

    function assignSimpleFilterEventHandlers() {
        $('#filters-overview-wrapper .label').click(function (e) {
            var index = $(this).data('index');
            removeFilterAtIndex(index);
            renderAdvancedFilterSection();
            $('#aspect_discovery_SimpleSearch_div_search-filters').submit();
            return false;
        });
    }

    function unAssignSimpleFilterEventHandlers() {
        $('#filters-overview-wrapper .label').off();
    }

    function assignAdvancedFilterEventHandlers() {
        var $filters = $('.search-filter');
        $filters.find('select, input').change(function() {
            updateFilterValues($(this).closest('.search-filter'));
            renderAdvancedFilterSection();
        });
        $filters.find('.filter-control.filter-add').click(function (e) {
            var index = getIndexFromFilterRow($(this).closest('.search-filter'));
            addNewFilter(index + 1, null, null, '');
            renderAdvancedFilterSection();
            return false;
        });
        var $removeButtons = $filters.find('.filter-control.filter-remove');
        $removeButtons.click(function (e) {
            var index = getIndexFromFilterRow($(this).closest('.search-filter'));
            removeFilterAtIndex(index);
            renderAdvancedFilterSection();
            return false;
        });
    }

    function unAssignAdvancedFilterEventHandlers() {
        var $filters = $('.search-filter');
        $filters.find('select, input').off();
        $filters.find('.filter-control.filter-add').off();
        $filters.find('.filter-control.filter-remove').off();
    }

    function assignGlobalEventHandlers() {
        $('.show-advanced-filters').click(function () {
            var wrapper = $('#aspect_discovery_SimpleSearch_div_discovery-filters-wrapper');
            wrapper.parent().find('.discovery-filters-wrapper-head').hide().removeClass('hidden').fadeIn(200);
            wrapper.hide().removeClass('hidden').slideDown(200);
            $(this).addClass('hidden');
            $('.hide-advanced-filters').removeClass('hidden');
            return false;
        });

        $('.hide-advanced-filters').click(function () {
            var wrapper = $('#aspect_discovery_SimpleSearch_div_discovery-filters-wrapper');
            wrapper.parent().find('.discovery-filters-wrapper-head').fadeOut(200, function() {
                $(this).addClass('hidden').removeAttr('style');
            });
            wrapper.slideUp(200, function() {
                $(this).addClass('hidden').removeAttr('style');
            });
            $(this).addClass('hidden');
            $('.show-advanced-filters').removeClass('hidden');
            return false;
        });

        $('#aspect_discovery_SimpleSearch_field_submit_reset_filter').click(function() {
            restoreOriginalFilters();
            calculateFilterIndices();
            renderAdvancedFilterSection();
            return false;
        });

        $('.discovery-add-filter-button').click(function() {
            addNewFilter(null, null, null, '');
            renderAdvancedFilterSection();
            return false;
        });

        $('.controls-gear-wrapper').find('li.gear-option,li.gear-option a').click(function(event){
            var value, param, mainForm, params, listItem, $this;
            event.stopPropagation();
            $this = $(this);
            if($this.is('li')){
                listItem = $this;
            }else{
                listItem = $this.parents('li:first');
            }

            //Check if this option is currently selected, if so skip the next stuff
            if(listItem.hasClass('gear-option-selected')){
                return false;
            }
            if(!$this.attr('href')){
                $this = $this.find('a');
            }
            //Retrieve the params we are to fill in in our main form
            params = $this.attr('href').split('&');

            mainForm = $('#aspect_discovery_SimpleSearch_div_main-form');
            //Split them & fill in in the main form, when done submit the main form !
            for(var i = 0; i < params.length; i++){
                param = params[i].split('=')[0];
                value = params[i].split('=')[1];

                mainForm.find('input[name="' + param + '"]').val(value);
            }
            //Clear the page param
            mainForm.find('input[name="page"]').val('1');

            mainForm.submit();
            $this.closest('.open').removeClass('open');
            return false;
        });
    }

    function backupOriginalFilters() {
        DSpace.discovery.orig_filters = DSpace.discovery.filters.slice(0);
    }

    function restoreOriginalFilters() {
        DSpace.discovery.filters = DSpace.discovery.orig_filters.slice(0);
    }

})(jQuery);
/*
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
(function ($) {

    function toggle_sidebar() {
        if ($('.row-offcanvas').hasClass('active')) {
            $('.row-offcanvas').removeClass('active').promise().done(function () {
                $('.main-content').css('min-height', 0).off('click', toggle_sidebar);
                window.setTimeout(function () {
                    $('#sidebar').removeAttr('style');
                }, 350);
            });


        } else {
            $('#sidebar').show();
            $('.row-offcanvas').addClass('active');
            $('.main-content').css('min-height', $('#sidebar').height());
            $('.main-content').on('click', toggle_sidebar);
        }

    }

    $(function () {
        $('[data-toggle=offcanvas]').on('click', toggle_sidebar).bind('touchend', function () {
            $(this).mouseout();
        });
    })

})(jQuery);
/*
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
(function($) {
    $(init_community_list);

    function init_community_list() {
        $('.community-browser-row .toggler').click(function() {
            var parent_row, parent_toggler, parent_wrappers, other_wrappers, other_toggler_rows, all_rows, target, $this, target_id, open_icon, closed_icon;
            $this = $(this);

            $('.current-community-browser-row').removeClass('current-community-browser-row')
                                                .find('a strong').contents().unwrap();

            target_id = $this.data('target');

            parent_wrappers = $this.parents('.sub-tree-wrapper');
            other_wrappers = $('.sub-tree-wrapper:not(' + target_id + ')').not(parent_wrappers);
            other_wrappers.addClass('hidden');

            other_toggler_rows = $([]);
            other_wrappers.each(function() {
                other_toggler_rows = other_toggler_rows.add(get_toggler_from_wrapper($(this)).closest('.community-browser-row'));
            });
            other_toggler_rows.removeClass('open-community-browser-row').addClass('closed-community-browser-row');

            parent_row = $this.closest('.community-browser-row');

            open_icon = $this.find('.open-icon');
            closed_icon = $this.find('.closed-icon');

            all_rows = $('.community-browser-row');
            clear_relation_classes(all_rows);
            target = $(target_id);
            if (target.is(':visible')) {
                target.addClass('hidden');
                open_icon.addClass('hidden');
                closed_icon.removeClass('hidden');
                parent_row.removeClass('open-community-browser-row').addClass('closed-community-browser-row');
                target.find('.open-icon').addClass('hidden');
                target.find('.closed-icon').removeClass('hidden');
                parent_toggler = get_toggler_from_wrapper($this.closest('.sub-tree-wrapper'));
                if (parent_toggler.length > 0) {
                    parent_toggler.closest('.community-browser-row').addClass('current-community-browser-row').find('a').wrapInner( "<strong></strong>");
                    set_relation_classes(all_rows, parent_toggler, $(parent_toggler.data('target')), parent_toggler.parents('.sub-tree-wrapper'));
                }
            }
            else {
                target.removeClass('hidden');
                open_icon.removeClass('hidden');
                closed_icon.addClass('hidden');
                parent_row.removeClass('closed-community-browser-row')
                        .addClass('open-community-browser-row')
                        .addClass('current-community-browser-row')
                        .find('a').wrapInner( "<strong></strong>");
                set_relation_classes(all_rows, $this, target, parent_wrappers);
            }
            set_odd_even_rows();
        }).bind('touchend', function () {
            $(this).mouseout();
        });
        set_odd_even_rows();
    }

    function set_relation_classes(all_rows, $this, target, parent_wrappers) {
        var related_rows, unrelated_rows, parent_rows;
        unrelated_rows = all_rows.not($this.parents('.community-browser-row')).not(target.find('.community-browser-row'));
        related_rows = parent_wrappers.find('.community-browser-row');
        parent_rows = $([]);
        parent_wrappers.each(function () {
            var toggler;
            toggler = get_toggler_from_wrapper($(this));
            parent_rows = parent_rows.add(toggler.parents('.community-browser-row'));
        });
        related_rows = unrelated_rows.filter(related_rows).not(parent_rows);
        unrelated_rows = unrelated_rows.not(related_rows).not(parent_rows);
        if (related_rows.length === 0 && unrelated_rows.length > 0) {
            related_rows = unrelated_rows;
            unrelated_rows = $([]);
        }
        related_rows.addClass('related-community-browser-row hidden-xs');
        related_rows.find('.open-icon').addClass('hidden');
        related_rows.find('.closed-icon').removeClass('hidden');
        unrelated_rows.addClass('unrelated-community-browser-row hidden-xs');
    }

    function clear_relation_classes(all_rows) {
        all_rows.removeClass('related-community-browser-row hidden-xs').removeClass('unrelated-community-browser-row hidden-xs');
    }

    function get_toggler_from_wrapper(wrapper) {
        return $('a[data-target="#' + wrapper.attr('id') + '"]');
    }

    function set_odd_even_rows() {
        var visible_rows = $('.community-browser-row:visible');
        visible_rows.removeClass('odd-community-browser-row');
        visible_rows = visible_rows.not('.open-community-browser-row');
        visible_rows.filter(':odd').addClass('odd-community-browser-row');
    }


})(jQuery);
/*
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
(function($) {
    $(function() {
        init_browse_navigation();
        init_sort_options_menu();
    });

    function init_sort_options_menu() {
        $('.sort-options-menu a').click(function() {
            var $this, browse_controls;
            $this = $(this);
            browse_controls = $('#aspect_artifactbrowser_ConfigurableBrowse_div_browse-controls, ' +
                    '#aspect_administrative_WithdrawnItems_div_browse-controls, ' +
                    '#aspect_administrative_PrivateItems_div_browse-controls');
            $('*[name="' +$this.data('name') + '"]', browse_controls).val($this.data('returnvalue'));
            $('.btn', browse_controls).click();
            $this.closest('.open').removeClass('open');
            return false;
        });
    }

    function init_browse_navigation() {
        $('.alphabet-select').change(function() {
            var $this = $(this);
            $this.mouseout();
            window.location = $this.val();
            return false
        });

        $('#aspect_artifactbrowser_ConfigurableBrowse_field_year').change(function() {
            $('#aspect_artifactbrowser_ConfigurableBrowse_field_starts_with').val('');
            $('#aspect_artifactbrowser_ConfigurableBrowse_field_submit').click();
        });

        $('#aspect_administrative_WithdrawnItems_field_year').change(function() {
            $('#aspect_administrative_WithdrawnItems_field_starts_with').val('');
            $('#aspect_administrative_WithdrawnItems_field_submit').click();
        });

        $('#aspect_administrative_PrivateItems_field_year').change(function() {
            $('#aspect_administrative_PrivateItems_field_starts_with').val('');
            $('#aspect_administrative_PrivateItems_field_submit').click();
        });
    }

})(jQuery);
/*
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
// Client-side scripting to support DSpace Choice Control

// IMPORTANT NOTE:
//  This version of choice-support.js has been rewritten to use jQuery
// instead of prototype & scriptaculous. The goal was not to change the
// way it works in any way, just to get the prototype dependency out.
// @Author Art Lowel (art.lowel at atmire.com)

// Entry points:
//  1. DSpaceAutocomplete -- add autocomplete (suggest) to an input field
//
//  2.  DSpaceChoiceLookup -- create popup window with authority choices
//
//  @Author: Larry Stone  <lcs@hulmail.harvard.edu>
//  $Revision $

// -------------------- support for Autocomplete (Suggest)

// Autocomplete utility:
// Arguments:
//   formID -- ID attribute of form tag
//   args properties:
//     metadataField -- metadata field e.g. dc_contributor_author
//     inputName -- input field name for text input, or base of "Name" pair
//     authorityName -- input field name in which to set authority
//     containerID -- ID attribute of DIV to hold the menu objects
//     indicatorID -- ID attribute of element to use as a "loading" indicator
//     confidenceIndicatorID -- ID of element on which to set confidence
//     confidenceName - NAME of confidence input (not ID)
//     contextPath -- URL path prefix (i.e. webapp contextPath) for DSpace.
//     collection -- db ID of dspace collection to serve as context
//     isClosed -- true if authority value is required, false = non-auth allowed
// XXX Can't really enforce "isClosed=true" with autocomplete, user can type anything
//
// NOTE: Successful autocomplete always sets confidence to 'accepted' since
//  authority value (if any) *was* chosen interactively by a human.
function DSpaceSetupAutocomplete(formID, args) {

    $(function() {
    if (args.authorityName == null)
        args.authorityName = dspace_makeFieldInput(args.inputName, '_authority');
        var form = $('#' + formID)[0];
    var inputID = form.elements[args.inputName].id;

    var authorityID = null;
    if (form.elements[args.authorityName] != null)
        authorityID = form.elements[args.authorityName].id;

    // AJAX menu source, can add &query=TEXT
    var choiceURL = args.contextPath + "/choices/" + args.metadataField;
    var collID = args.collection == null ? -1 : args.collection;
        choiceURL += '?collection=' + collID;

        var ac = $('#' + inputID);
        ac.autocomplete({
            source: function(request, response) {
                var reqUrl = choiceURL;
                if(request && request.term) {
                    reqUrl += "&query=" + request.term;
                        }
                $.get(reqUrl, function(xmldata) {
                    var options = [];
                    var authorities = [];
                    $(xmldata).find('Choice').each(function() {
                        // get value
                        var value = $(this).attr('value') ? $(this).attr('value') : null;
                        // get label, if empty set it to value
                        var label = $(this).text() ? $(this).text() : value;
                        // if value was empty but label was provided, set value to label
                        if(!value) {
                            value = label;
                        }
                        // if at this point either value or label == null, this means none of both were set and we shouldn't add it to the list of options
                        if (label != null) {
                            options.push({
                                label: label,
                                value: value
                            });
                            authorities['label: ' + label + ', value: ' + value] = $(this).attr('authority') ? $(this).attr('authority') : value;
                        }
                    });
                    ac.data('authorities',authorities);
                    response(options);
                });
                },
            select: function(event, ui) {
                    // NOTE: lookup element late because it might not be in DOM
                    // at the time we evaluate the function..
//                var authInput = document.getElementById(authorityID);
//                var authValue = li == null ? "" : li.getAttribute("authority");
                var authInput = $('#' + authorityID);
                if(authInput.length > 0) {
                    authInput = authInput[0];
                }
                else {
                     authInput = null;
                }
                var authorities = ac.data('authorities');
                var authValue = authorities['label: ' + ui.item.label + ', value: ' + ui.item.value];
                    if (authInput != null) {
                        authInput.value = authValue;
                        // update confidence input's value too if available.
                        if (args.confidenceName != null) {
                            var confInput = authInput.form.elements[args.confidenceName];
                            if (confInput != null)
                                confInput.value = 'accepted';
                        }
                    }
                    // make indicator blank if no authority value
                    DSpaceUpdateConfidence(document, args.confidenceIndicatorID,
                            authValue == null || authValue == '' ? 'blank' : 'accepted');
                }
		}).autocomplete( "widget").addClass( 'dropdown-menu' );
        $(".ui-helper-hidden-accessible").hide();
	});
}

// -------------------- support for Lookup Popup

// Create popup window with authority choices for value of an input field.
// This is intended to be called by onClick of a "Lookup" or "Add"  button.
function DSpaceChoiceLookup(url, field, formID, valueInput, authInput,
                            confIndicatorID, collectionID, isName, isRepeating) {



    // fill in parameters for URL of popup window
    url += '?field=' + field + '&formID=' + formID + '&valueInput=' + valueInput +
            '&authorityInput=' + authInput + '&collection=' + collectionID +
            '&isName=' + isName + '&isRepeating=' + isRepeating + '&confIndicatorID=' + confIndicatorID +
            '&limit=50'; //limit to 50 results at once (make configurable?)

    $.ajax({
        dataType: "html",
        url: url,
        success: function(data){
            var modal =  $('<div class="modal fade">' + data + '</div>');
            $( "body" ).append(modal);
            modal.modal();
            var form = document.getElementById('aspect_general_ChoiceLookupTransformer_div_lookup');
            DSpaceChoicesSetup(form);
            //In case of lookups for different fields, we get duplications of ids. So we just remove the modal.
            modal.on('hidden.bs.modal', function () {
                $(this).remove();
            })
        }
    });
    return false;
}

// Run this as the Lookup page is loaded to initialize DOM objects, load choices
function DSpaceChoicesSetup(form) {
    // find the "LEGEND" in fieldset, which acts as page title,
    var legend = $('#aspect_general_ChoiceLookupTransformer_div_lookup :header:not(.page-header)');
    //save the template as a jQuery data field
    if (!legend.data('template')) {
        legend.data('template', legend.html());
    }
    legend.html("Loading...");
    DSpaceChoicesLoad(form);
}


// Populate the "select" (in popup window) with options from ajax request
// stash some parameters as properties of the "select" so we can add to
// the last start index to query for next set of results.
function DSpaceChoicesLoad(form) {
    var field = $('*[name = paramField]').val();
    var value = $('*[name = paramValue]').val();
    if (!value)
        value = '';
    var start = $('*[name = paramStart]').val();
    var limit = $('*[name = paramLimit]').val();
    var formID = $('*[name = paramFormID]').val();
    var collID = $('*[name = paramCollection]').val();
    var isName = $('*[name = paramIsName]').val() == 'true';
    var isRepeating = $('*[name = paramIsRepeating]').val() == 'true';
    var isClosed = $('*[name = paramIsClosed]').val() == 'true';
    var contextPath = $('*[name = contextPath]').val();
    var fail = $('*[name = paramFail]').val();
    var valueInput = $('*[name = paramValueInput]').val();
    var nonAuthority = "";
    var pNAInput = $('*[name = paramNonAuthority]');
    if (pNAInput.length > 0)
        nonAuthority = pNAInput.val();

    // get value from form inputs in opener if not explicitly supplied
    if (value.length == 0) {
        // This bit of javascript is accessing the form that opened the popup window,
        // so that we can grab the value the user entered before pressing the "Lookup & Add" button
        var of = $(window.document).find('#' + formID);
        if (isName)
            value = makePersonName(of.find('*[name = ' + dspace_makeFieldInput(valueInput, '_last') + ']').val(),
                    of.find('*[name = ' + dspace_makeFieldInput(valueInput, '_first') + ']').val());
        else
            value = of.find('*[name = ' + valueInput + ']').val();

        // if this is a repeating input, clear the source value so that e.g.
        // clicking "Next" on a submit-describe page will not *add* the proposed
        // lookup text as a metadata value:
        if (isRepeating) {
            if (isName) {
                of.find('*[name = ' + dspace_makeFieldInput(valueInput, '_last') + ']').val('');
                of.find('*[name = ' + dspace_makeFieldInput(valueInput, '_first') + ']').val('');
            }
            else
                of.find('*[name = ' + valueInput + ']').val(null);
        }

        // Save passed-in value to hidden 'paramValue' field in the popup window
        // (This will allow the user to get "more results" for the same query,
        // if results are on more than one page.)
        $('*[name = paramValue]').val(value);
    }

    var select = $('select[name = chooser]:first');
    select.addClass('loading');

    $(window).ajaxError(function(e, xhr, settings, exception) {
        window.alert(fail + " Exception=" + e);
        if (select!= null) select.removeClass('loading');
    });

    // AJAX to send off the query to the "/choices" URL, and
    // then parse the response based on whether it was successful or error occurred
    // NOTE: you can send this same query manually to see result sample.
    // Just enter the URL & pass all data values on query string.
    $.ajax({
        url: contextPath + "/choices/" + field,
        type: "GET",
        data: {query: value, collection: collID,
                     start: start, limit: limit},
        error: function() {
            window.alert(fail + " HTTP error resonse");
            if (select!= null) select.removeClass('loading');
        },
        success: function(data) {
            var Choices = $(data).find('Choices');
            var err = Choices.attr('error');
            if (err != null && err == 'true')
                window.alert(fail + " Server indicates error in response.");
            var opts = Choices.find('Choice');

            // update range message and update 'more' button
            var oldStart = 1 * Choices.attr('start');
            var nextStart = oldStart + opts.length;
            var lastTotal = Choices.attr('total');
            var resultMore = Choices.attr('more');
            //if no more results to display, then disable the "more" button
            if(resultMore==null || resultMore == 'false')
                $('*[name = more]').attr('disabled', 'true');
            else //otherwise, enable the "more" button
                $('*[name = more]').removeAttr('disabled');
            // save next starting index to hidden field
            $('*[name = paramStart]').val(nextStart);

            if (select!= null) select.removeClass('loading');

            select.find('option').remove();
            var lastOption = select.find('option:last');

            var selectedByValue = -1; // select by value match
            var selectedByChoices = -1;  // Choice says its selected
            $.each(opts, function(index) {
                var current = $(this);
                if (current.attr('value') == value)
                    selectedByValue = index;
                if(current.attr('selected') != undefined)
                    selectedByChoices = index;

                var newOption = $('<option value="' + current.attr('value') + '">' + current.text() + '</option>');
                newOption.data('authority', current.attr('authority'));

                if (lastOption.length > 0)
                    lastOption.before(newOption);
                else
                    select.append(newOption);
            });


            // add non-authority option if needed.
            if (!isClosed) {
                select.append(new Option(dspace_formatMessage(nonAuthority, value), value), null);
            }
            var defaultSelected = -1;
            if (selectedByChoices >= 0)
                defaultSelected = selectedByChoices;
            else if (selectedByValue >= 0)
                defaultSelected = selectedByValue;
            else if (select[0].options.length == 1)
                defaultSelected = 0;

            // load default-selected value
            if (defaultSelected >= 0) {
                select[0].options[defaultSelected].defaultSelected = true;
                var so = select[0].options[defaultSelected];
                if (isName) {
                    $('*[name = text1]').val(lastNameOf(so.value));
                    $('*[name = text2]').val(firstNameOf(so.value));
                }
                else
                    $('*[name = text1]').val(so.value);
            }



            //If no results, make sure to display "0 to 0 of 0"
            var startNum = (nextStart==0 ? 0 : oldStart+1);
            //Fill out the counter values in the "Results x to y of z" line
            var legend = $('#aspect_general_ChoiceLookupTransformer_div_lookup :header:not(.page-header)');
            legend.html(dspace_formatMessage(legend.data('template'),
                            startNum, nextStart, lastTotal, value));
        }
    });
}

// handler for change event on choice selector - load new values
function DSpaceChoicesSelectOnChange() {
    // "this" is the window,

    var form = $('#aspect_general_ChoiceLookupTransformer_div_lookup');
    var select = form.find('*[name = chooser]');

    var isName = form.find('*[name = paramIsName]').val() == 'true';

    var selectedValue = select.val();

    if (isName) {
        form.find('*[name = text1]').val(lastNameOf(selectedValue));
        form.find('*[name = text2]').val(firstNameOf(selectedValue));
    }
    else
        form.find('*[name = text1]').val(selectedValue);
}

// handler for lookup popup's accept (or add) button
//  stuff values back to calling page, force an add if necessary, and close.
function DSpaceChoicesAcceptOnClick() {
    var select = $('*[name = chooser]');
    var isName = $('*[name = paramIsName]').val() == 'true';
    var isRepeating = $('*[name = paramIsRepeating]').val() == 'true';
    var valueInput = $('*[name = paramValueInput]').val();
    var authorityInput = $('*[name = paramAuthorityInput]').val();
    var formID = $('*[name = paramFormID]').val();
    var confIndicatorID = $('*[name = paramConfIndicatorID]').length = 0 ? null : $('*[name = paramConfIndicatorID]').val();

    // default the authority input if not supplied.
    if (authorityInput.length == 0)
        authorityInput = dspace_makeFieldInput(valueInput, '_authority');

    // always stuff text fields back into caller's value input(s)
    if (valueInput.length > 0) {
        var of = $(window.document).find('#' + formID);
        if (isName) {
            of.find('*[name = ' + dspace_makeFieldInput(valueInput, '_last') + ']').val($('*[name = text1]').val());
            of.find('*[name = ' + dspace_makeFieldInput(valueInput, '_first') + ']').val($('*[name = text2]').val());
        }
        else
            of.find('*[name = ' + valueInput + ']').val($('*[name = text1]').val());

        if (authorityInput.length > 0 && of.find('*[name = ' + authorityInput + ']').length > 0) {
            // conf input is auth input, substitute '_confidence' for '_authority'
            // if conf fieldname is  FIELD_confidence_NUMBER, then '_authority_' => '_confidence_'
            var confInput = "";

            var ci = authorityInput.lastIndexOf("_authority_");
            if (ci < 0)
                confInput = authorityInput.substring(0, authorityInput.length - 10) + '_confidence';
            else
                confInput = authorityInput.substring(0, ci) + "_confidence_" + authorityInput.substring(ci + 11);
            // DEBUG:
            // window.alert('Setting fields auth="'+authorityInput+'", conf="'+confInput+'"');

            var authValue = null;
            var selectedOption = select.find(':selected');
            if (selectedOption.length >= 0 && selectedOption.data('authority') != null) {
                of.find('*[name = ' + authorityInput + ']').val(selectedOption.data('authority'));
            }
            of.find('*[name = ' + confInput + ']').val('accepted');
            // make indicator blank if no authority value
            DSpaceUpdateConfidence(window.document, confIndicatorID,
                    authValue == null || authValue == '' ? 'blank' : 'accepted');
        }

        // force the submit button -- if there is an "add"
        if (isRepeating) {
            var add = of.find('*[name = submit_' + valueInput + '_add]');
            if (add.length > 0)
                add.click();
            else
                alert('Sanity check: Cannot find button named "submit_' + valueInput + '_add"');
        }
    }
    return false;
}

// handler for lookup popup's more button
function DSpaceChoicesMoreOnClick() {
    //reload the window -- this should return the next results set
//    location.reload();
    var form = document.getElementById('aspect_general_ChoiceLookupTransformer_div_lookup');
    DSpaceChoicesSetup(form);
}

//// handler for lookup popup's cancel button
//function DSpaceChoicesCancelOnClick() {
//    window.close();
//    return false;
//}

// -------------------- Utilities

// DSpace person-name conventions, see DCPersonName
function makePersonName(lastName, firstName) {
    return (firstName == null || firstName.length == 0) ? lastName :
            lastName + ", " + firstName;
}

// DSpace person-name conventions, see DCPersonName
function firstNameOf(personName) {
    var comma = personName.indexOf(",");
    return (comma < 0) ? "" : stringTrim(personName.substring(comma + 1));
}

// DSpace person-name conventions, see DCPersonName
function lastNameOf(personName) {
    var comma = personName.indexOf(",");
    return stringTrim((comma < 0) ? personName : personName.substring(0, comma));
}

// replicate java String.trim()
function stringTrim(str) {
    var start = 0;
    var end = str.length;
    for (; str.charAt(start) == ' ' && start < end; ++start) ;
    for (; end > start && str.charAt(end - 1) == ' '; --end) ;
    return str.slice(start, end);
}

// format utility - replace @1@, @2@ etc with args 1, 2, 3..
// NOTE params MUST be monotonically increasing
// NOTE we can't use "{1}" like the i18n catalog because it elides them!!
// ...UNLESS maybe it were to be fixed not to when no params...
function dspace_formatMessage() {
    var template = dspace_formatMessage.arguments[0];
    var i;
    for (i = 1; i < arguments.length; ++i) {
        var pattern = '@' + i + '@';
        if (template.search(pattern) >= 0)
            {
                var value = dspace_formatMessage.arguments[i];
                if (value == undefined)
                    value = '';
                template = template.replace(pattern, value);
            }
    }
    return template;
}

// utility to make sub-field name of input field, e.g. _last, _first, _auth..
// if name ends with _1, _2 etc, put sub-name BEFORE the number
function dspace_makeFieldInput(name, sub) {
    var i = name.search("_[0-9]+$");
    if (i < 0)
        return name + sub;
    else
        return name.substr(0, i) + sub + name.substr(i);
}

// update the class value of confidence-indicating element
function DSpaceUpdateConfidence(doc, confIndicatorID, newValue) {
    // sanity checks - need valid ID and a real DOM object
    if (confIndicatorID == null || confIndicatorID == "")
        return;
    var confElt = doc.getElementById(confIndicatorID);
    if (confElt == null)
        return;

    // add or update CSS class with new confidence value, e.g. "cf-accepted".
    if (confElt.className == null)
        confElt.className = "cf-" + newValue;
    else {
        var classes = confElt.className.split(" ");
        var newClasses = "";
        var found = false;
        for (var i = 0; i < classes.length; ++i) {
            if (classes[i].match('^cf-[a-zA-Z0-9]+$')) {
                newClasses += "cf-" + newValue + " ";
                found = true;
            }
            else
                newClasses += classes[i] + " ";
        }
        if (!found)
            newClasses += "cf-" + newValue + " ";
        confElt.className = newClasses;
    }
}

// respond to "onchanged" event on authority input field
// set confidence to 'accepted' if authority was changed by user.
function DSpaceAuthorityOnChange(self, confValueID, confIndicatorID) {
    var confidence = 'accepted';
    if (confValueID != null && confValueID != '') {
        var confValueField = document.getElementById(confValueID);
        if (confValueField != null)
            confValueField.value = confidence;
    }
    DSpaceUpdateConfidence(document, confIndicatorID, confidence);
    return false;
}

// respond to click on the authority-value lock button in Edit Item Metadata:
// "button" is bound to the image input for the lock button, "this"
function DSpaceToggleAuthorityLock(button, authInputID) {
    // sanity checks - need valid ID and a real DOM object
    if (authInputID == null || authInputID == '')
        return false;
    var authInput = document.getElementById(authInputID);
    if (authInput == null)
        return false;

    // look for is-locked or is-unlocked in class list:
    var classes = button.className.split(' ');
    var newClass = '';
    var newLocked = false;
    var found = false;
    for (var i = 0; i < classes.length; ++i) {
        if (classes[i] == 'is-locked') {
            newLocked = false;
            found = true;
        }
        else if (classes[i] == 'is-unlocked') {
            newLocked = true;
            found = true;
        }
        else
            newClass += classes[i] + ' ';
    }
    if (!found)
        return false;
    // toggle the image, and set readability
    button.className = newClass + (newLocked ? 'is-locked' : 'is-unlocked') + ' ';
    authInput.readOnly = newLocked;
    return false;
}

if (window.runAfterJSImports != undefined){
    runAfterJSImports.execute();
}

/*
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
(function($) {
    $(document).ready(function(){
        //Find any controlled vocabulary urls this page might contain
        var vocabularyUrls = $('a[href^="vocabulary:"]');
        vocabularyUrls.click(function(index){
            var $link = $(this);
            var vocabularyJSONUrl = $link.attr('href').replace('vocabulary:', '');
            //Retrieve the basic url, we will need this to add images !
            var basicUrl = vocabularyJSONUrl.substr(0, vocabularyJSONUrl.indexOf('/JSON/controlled-vocabulary'));
            var parameters = vocabularyJSONUrl.slice(vocabularyJSONUrl.indexOf('?') + 1, vocabularyJSONUrl.length).split('&');

            //Read the input field name & the vocabulary identifier from the url
            var inputFieldName;
            var vocabularyIdentifier;
            for(var i = 0; i < parameters.length; i++){
                var parameter = parameters[i].split('=')[0];
                var value = parameters[i].split('=')[1];

                if(parameter == 'vocabularyIdentifier'){
                    vocabularyIdentifier = value;
                }else
                if(parameter == 'metadataFieldName'){
                    inputFieldName = value;
                }
            }

            var id = 'modal_vocabulary_dialog_' + vocabularyIdentifier;
            //Check if we already have a (hidden) modal
            var vocabularyDialog = $('div#'+id);
            if(0 < vocabularyDialog.length){
                //Open the modal
                vocabularyDialog.modal('show')
            }else{

                //No dialog window found, create a new one by requesting our data by json
                $.get(basicUrl + '/controlled-vocabulary-dialog',
                    {
                        vocabularyIdentifier: vocabularyIdentifier,
                        metadataFieldName: inputFieldName
                    },
                    function(resultingHtml){
                        //retrieve the dialog box


                        vocabularyDialog =  $('<div class="modal fade" id="'+id+'">' + resultingHtml + '</div>');
                        $( "body" ).append(vocabularyDialog);
                        vocabularyDialog.modal();

                        var mainDialogDivision = vocabularyDialog.find('div[id^=aspect_submission_ControlledVocabularyTransformer_div_vocabulary_dialog_]');
//                        $('body').append($(mainDialogDivision[0]));
//                        var vocabularyDialog = $('div#aspect_submission_ControlledVocabularyTransformer_div_vocabulary_dialog_' + vocabularyIdentifier);
//                        vocabularyDialog.dialog({
//                            autoOpen: true,
//                            height: 450,
//                            width: 650,
//                            modal: true,
//                            title: $Result.find('title').html()
//                        });

                        //The success function, retrieve the JSON
                        $.ajax({
                            url: vocabularyJSONUrl,
                            dataType: 'json',
                            data: {},
                            success: function(response) {
                                if(response == null){
                                    hideLoadingMsg();
                                    showErrorMsg();
                                }

                                var mainList = document.createElement('ul');
                                mainList.setAttribute('class', 'ds-simple-list vocabulary list-unstyled col-xs-12');
                                mainList.setAttribute('id', 'vocabulary-list');
                                createVocabularyNode(mainList, response, basicUrl, true);

                                //Hide the loading message !
                                hideLoadingMsg();

                                mainDialogDivision[0].appendChild(mainList);

                                //Initialize all the vocabulary box javascript actions
                                vocabularyDialog.find('span[id^="node_"]').click(function(e){
                                    e.preventDefault();
                                    e.stopPropagation();
                                    var $this = $(this);
                                    var subNodes = $('ul#' + $this.attr('id') + '_sub');
                                    if(subNodes.is(':visible')){
                                        subNodes.hide();
                                        subNodes.find('li:first-child').hide();
                                    }else{
                                        subNodes.show();
                                        subNodes.find('li:first-child').show();
                                    }
                                    //Flip the closed/open class
                                    if($this.hasClass('glyphicon-folder-open')){
                                        $this.removeClass('glyphicon-folder-open');
                                        $this.addClass('glyphicon-folder-close');
                                    }else
                                    if($this.hasClass('glyphicon-folder-close')){
                                        $this.removeClass('glyphicon-folder-close');
                                        $this.addClass('glyphicon-folder-open');
                                    }
                                });

                                //Each time we click a url ensure that our field is added in the input box !
                                $('a.vocabulary-label',vocabularyDialog).bind('click',function(e){
                                    e.preventDefault();
                                    e.stopPropagation();
                                    var $this = $(this);
                                    var inputFieldName = vocabularyDialog.find('input[type="hidden"][name="metadataFieldName"]').val();
                                    $('input[name="' + inputFieldName + '"]').val($this.attr('href'));

                                    //Close the current dialog
                                    vocabularyDialog.modal('hide');
                                    return false;
                                });

                                $('button[name="filter_button"]',vocabularyDialog).bind('click',function(){
                                    var filterValue =  $('input[name="filter"]',vocabularyDialog).val();
                                    var displayElements;
                                    if(0 < filterValue.length){
                                        //Perform the filtering
                                        //Start by hiding all the urls in our box
                                        var vocabularyList = vocabularyDialog.find('ul#vocabulary-list');
                                        vocabularyList.hide();
                                        vocabularyList.find('li').hide();
                                        var displayUrls = $('a[filter*="' + filterValue.toLowerCase() + '"]');
                                        //Retrieve all the parents of these urls & display them
                                        displayElements = displayUrls.parents('ul,li');
                                    }else{
                                        //Display them all !
                                        displayElements = vocabularyDialog.find('ul,li');
                                    }
                                    displayElements.show();
                                    //Flip class from closed to open
                                    displayElements.find('.glyphicon-folder-close').removeClass('glyphicon-folder-close').addClass('glyphicon-folder-open');
                                    //Disable normal action
                                    return false;
                                });
                            }
                        });
                    }, 'html'
                );
            }

            return false;
        });
    });

    function createVocabularyNode(list, data, basicUrl, displayed) {
        var childNodes = data.childNodes;
        var listItem = document.createElement('li');
        var vocabularyTypeClass;
        var parent = listItem;
        if(childNodes.length == 0){
            //An actual end point use the appropriate image
            vocabularyTypeClass = 'glyphicon-file';
        }else{
            if(displayed){
                vocabularyTypeClass = 'glyphicon-folder-open';
            }else{
                vocabularyTypeClass = 'glyphicon-folder-close';
            }
            parent =$( '<a href="#"></a>');
            parent.appendTo(listItem)
        }

        var vocabularyIcon =  $( '<span class="vocabulary-node-icon btn-xs glyphicon ' + vocabularyTypeClass + '"></span>');
        vocabularyIcon.attr('id', 'node_' + data.id);
        vocabularyIcon.appendTo(parent)


        var link = document.createElement('a');
        link.setAttribute('href', data.value);
        link.setAttribute('class', 'vocabulary-label');
        //Also store a to lower cased value of our label in the link, this will be used for filtering
        link.setAttribute('filter', data.value.toLowerCase());
        link.innerHTML = data.label;
        listItem.appendChild(link);

        list.appendChild(listItem);
        if(0 < childNodes.length){
            var subNodeList = document.createElement('ul');
            subNodeList.setAttribute('id', 'node_' + data.id + '_sub');
            if(!displayed){
                subNodeList.setAttribute('style', 'display: none;');
            }
            $.each(childNodes, function(key, childNode){
                createVocabularyNode(subNodeList, childNode, basicUrl, false);
            });
            list.appendChild(subNodeList);
        }
    }

    function hideLoadingMsg() {
        $('div#aspect_submission_ControlledVocabularyTransformer_item_vocabulary-loading').hide();
    }

    function showErrorMsg(){
        $('div#aspect_submission_ControlledVocabularyTransformer_item_vocabulary-error').removeClass('hidden');
    }

})($);

/*
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
$(function() {

    $(function() {
        initAccessSubmissionForm();
    });

    function initAccessSubmissionForm() {
        if ($('input[name|="open_access_radios"]').length >0){

            $('input[name|="open_access_radios"]').change(function(){
                // Visible
                if ($('input[name|="open_access_radios"]:checked').val() == '0'){
                    disableFields();
                }
                // Embargoed
                else if ($('input[name|="open_access_radios"]:checked').val() == '1'){
                    enableFields()
                }
            });

            if ($('input[name|="open_access_radios"]:checked').val() == '0'){
                disableFields();
            }
            // Embargoed
            else if ($('input[name|="open_access_radios"]:checked').val() == '1'){
                enableFields()
            }
        }
    }

    function enableFields() {
        $("#aspect_submission_StepTransformer_field_reason").removeAttr("disabled");
        $("#aspect_submission_StepTransformer_field_embargo_until_date").removeAttr("disabled");

    }

    function disableFields() {
        $("#aspect_submission_StepTransformer_field_reason").attr("disabled", "disabled");
        $("#aspect_submission_StepTransformer_field_embargo_until_date").attr("disabled", "disabled");
    }
});

/*
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
$(function() {

     // HTML5 input date polyfill
     if(!Modernizr.inputtypes.date){
            $('input[type="date"]').each(function(){
               $(this).datepicker({dateFormat: 'yy-mm-dd'});
            });
     }

    $('a.information').tooltip();


});

/*
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
(function ($) {

    //Catch "Holder: invisible placeholder"
    Holder.invisible_error_fn = function(fn){
        return function(el){
            try
            {
                fn.call(this, el)
            }
            catch(err)
            {
                //Catch "Holder: invisible placeholder"
            }
        }
    }

})(jQuery);
/*
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
$(function() {
    $( "#aspect_statisticsGoogleAnalytics_StatisticsGoogleAnalyticsTransformer_field_startDate" ).datepicker({
        changeMonth: true,
        changeYear: true,
        defaultDate: "-1y",
        numberOfMonths: 1,
        dateFormat: "yy-mm-dd",
        onClose: function( selectedDate ) {
            $( "#aspect_statisticsGoogleAnalytics_StatisticsGoogleAnalyticsTransformer_field_endDate" ).datepicker( "option", "minDate", selectedDate );
        }
    });
    $( "#aspect_statisticsGoogleAnalytics_StatisticsGoogleAnalyticsTransformer_field_endDate" ).datepicker({
        changeMonth: true,
        changeYear: true,
        numberOfMonths: 1,
        dateFormat: "yy-mm-dd",
        onClose: function( selectedDate ) {
            $( "#aspect_statisticsGoogleAnalytics_StatisticsGoogleAnalyticsTransformer_field_startDate" ).datepicker( "option", "maxDate", selectedDate );
        }
    });
});
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
/*
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
function AuthorLookup(url, authorityInput, collectionID) {
//    TODO i18n
    $(".authorlookup").remove();
    var content =   $(
                    '<div class="authorlookup modal fade" tabindex="-1" role="dialog" aria-labelledby="personLookupLabel" aria-hidden="true">' +
                        '<div class="modal-dialog">'+
                            '<div class="modal-content">'+
                                '<div class="modal-header">'+
                                    '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'+
                                    '<h4 class="modal-title" id="personLookupLabel">Person lookup</h4>'+
                                '</div>'+
                                '<div class="modal-body">'+
                                    '<div title="Person Lookup">' +
                                        '<table class="dttable col-xs-4">' +
                                            '<thead>' +
                                                '<th>Name</th>' +
                                            '</thead>' +
                                            '<tbody>' +
                                                '<tr><td>Loading...<td></tr>' +
                                            '</tbody>' +
                                        '</table>' +
                                        '<span class="no-vcard-selected">There\'s no one selected</span>' +
                                        '<ul class="vcard list-unstyled" style="display: none;">' +
                                            '<li><ul class="variable"/></li>'+
                                            '<li class="vcard-insolr">' +
                                                '<label>Items in this repository:&nbsp;</label>' +
                                                '<span/>' +
                                            '</li>' +
                                            '<li class="vcard-add">' +
                                                '<input class="ds-button-field btn btn-default" value="Add This Person" type="button"/>' +
                                            '</li>' +
                                        '</ul>' +
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'
                    );

    var moreButton = '<button id="lookup-more-button" class="btn btn-default">show more</button>';
    var lessButton = '<button id="lookup-less-button" class="btn btn-default">show less</button>';
    var button = moreButton;

    var datatable = content.find("table.dttable");
    datatable.dataTable({
        "aoColumns": [
            {
                "bSortable": false,
                "sWidth": "200px"
            },
            {
                "bSortable": false,
                "bSearchable": false,
                "bVisible": false
            }
        ],
        "oLanguage": {
            "sInfo": 'Showing _START_ to _END_ of _TOTAL_ people',
            "sInfoEmpty": 'Showing 0 to 0 of 0 people',
            "sInfoFiltered": '(filtered from _MAX_ total people)',
            "sLengthMenu": '_MENU_ people/page',
            "sZeroRecords": 'No people found'
        },
        "bAutoWidth": false,
        "bJQueryUI": true,
        "bProcessing": true,
        "bSort": false,
        "bPaginate": false,
        "sPaginationType": "two_button",
        "bServerSide": true,
        "sAjaxSource": url,
        "sDom": '<"H"lfr><"clearfix"t<"vcard-wrapper col-xs-8">><"F"ip>',
        "fnInitComplete": function() {
            content.find("table.dttable").show();
            content.find("div.vcard-wrapper").append(content.find('.no-vcard-selected')).append(content.find('ul.vcard'));
            content.modal();

            content.find('.dataTables_wrapper').parent().attr('style', 'width: auto; min-height: 121px; height: auto;');
            var searchFilter = content.find('.dataTables_filter input');
            var initialInput = "";
            if (authorityInput.indexOf('value_') != -1) { // edit item
                initialInput = $('textarea[name=' + authorityInput + ']').val();
            } else {   // submission
                var lastName = $('input[name=' + authorityInput + '_last]');
                if (lastName.size()) { // author input type
                    initialInput = (lastName.val() + " " + $('input[name=' + authorityInput + '_first]').val()).trim();
                } else { // other input types
                    initialInput = $('input[name=' + authorityInput + ']').val();
                }
            }
            searchFilter.val(initialInput);
            setTimeout(function () {
                searchFilter.trigger($.Event("keyup", { keyCode: 13 }));
            }, 50);
            searchFilter.trigger($.Event("keyup", { keyCode: 13 }));
            searchFilter.addClass('form-control');
            content.find('.ui-corner-tr').removeClass('.ui-corner-tr');
            content.find('.ui-corner-tl').removeClass('.ui-corner-tl');

        },
        "fnInfoCallback": function( oSettings, iStart, iEnd, iMax, iTotal, sPre ) {
          return "Showing "+ iEnd + " results. "+button;
        },
        "fnRowCallback": function( nRow, aData, iDisplayIndex ) {
            aData = aData[1];
            var $row = $(nRow);

            var authorityID = $(this).closest('.dataTables_wrapper').find('.vcard-wrapper .vcard').data('authorityID');
            if (authorityID != undefined && aData['authority'] == authorityID) {
                $row.addClass('current-item');
            }

            $row.addClass('clickable');
            if(aData['insolr']=="false"){
                $row.addClass("notinsolr");
            }

            $row.click(function() {
                var $this = $(this);
                $this.siblings('.current-item').removeClass('current-item');
                $this.addClass('current-item');
                var wrapper = $this.closest('.dataTables_wrapper').find('.vcard-wrapper');
                wrapper.find('.no-vcard-selected:visible').hide();
                var vcard = wrapper.find('.vcard');
                vcard.data('authorityID', aData['authority']);
                vcard.data('name', aData['value']);

                var notDisplayed = ['insolr','value','authority'];
                var predefinedOrder = ['last-name','first-name'];
                var variable = vcard.find('.variable');
                variable.empty();
                predefinedOrder.forEach(function (entry) {
                    variableItem(aData, entry, variable);
                });

                for (var key in aData) {
                    if (aData.hasOwnProperty(key) && notDisplayed.indexOf(key) < 0 && predefinedOrder.indexOf(key) < 0) {
                        variableItem(aData, key, variable);
                    }
                }

                function variableItem(aData, key, variable) {
                    var label = key.replace(/-/g, ' ');
                    var dataString = '';
                    dataString += '<li class="vcard-' + key + '">' +
                        '<label>' + label + ': </label>';

                    if(key == 'orcid'){
                        dataString +='<span><a target="_blank" href="http://orcid.org/' + aData[key] + '">' + aData[key] + '</a></span>';
                    } else {
                        dataString += '<span>' + aData[key] + '</span>';
                    }
                    dataString += '</li>';

                    variable.append(dataString);
                    return label;
                }
                
                if(aData['insolr']!="false"){
                    var discoverLink = window.DSpace.context_path + "/discover?filtertype=author&filter_relational_operator=authority&filter=" + aData['insolr'];
                    vcard.find('.vcard-insolr span').empty().append('<a href="'+ discoverLink+'" target="_new">view items</a>');
                }else{
                    vcard.find('.vcard-insolr span').text("0");
                }
                vcard.find('.vcard-add input').click(function() {
                    if (authorityInput.indexOf('value_') != -1) {
                        // edit item
                        $('input[name=' + authorityInput + ']').val(vcard.find('.vcard-last-name span').text() + ', ' + vcard.find('.vcard-first-name span').text());
                        var oldAuthority = $('input[name=' + authorityInput + '_authority]');
                        oldAuthority.val(vcard.data('authorityID'));
                        $('textarea[name='+ authorityInput+']').val(vcard.data('name'));
                    } else {
                        // submission
                        var lastName = $('input[name=' + authorityInput + '_last]');
                        if (lastName.size()) { // author input type
                            lastName.val(vcard.find('.vcard-last-name span').text());
                            $('input[name=' + authorityInput + '_first]').val(vcard.find('.vcard-first-name span').text());
                        }
                        else { // other input types
                            $('input[name=' + authorityInput + ']').val(vcard.data('name'));
                        }

                        $('input[name=' + authorityInput + '_authority]').val(vcard.data('authorityID'));
                        $('input[name=submit_'+ authorityInput +'_add]').click();

                    }
                    content.modal('hide');
                });
                vcard.show();
            });

            return nRow;
        },
        "fnDrawCallback": function() {
            var wrapper = $(this).closest('.dataTables_wrapper');
            if (wrapper.find('.current-item').length > 0) {
                wrapper.find('.vcard-wrapper .no-vcard-selected:visible').hide();
                wrapper.find('.vcard-wrapper .vcard:hidden').show();
            }
            else {
                wrapper.find('.vcard-wrapper .vcard:visible').hide();
                wrapper.find('.vcard-wrapper .no-vcard-selected:hidden').show();
            }
            $('#lookup-more-button').click(function () {
                button = lessButton;
                datatable.fnFilter($('.dataTables_filter > input').val());
            });
            $('#lookup-less-button').click(function () {
                button = moreButton;
                datatable.fnFilter($('.dataTables_filter > input').val());
            });
        },
        "fnServerData": function (sSource, aoData, fnCallback) {
            var sEcho;
            var query;
            var start;
            var limit;

            $.each(aoData, function() {
                if (this.name == "sEcho") {
                    sEcho = this.value;
                }
                else if (this.name == "sSearch") {
                    query = this.value;
                }
                else if (this.name == "iDisplayStart") {
                    start = this.value;
                }
                else if (this.name == "iDisplayLength") {
                    limit = this.value;
                }
            });

            if (collectionID == undefined) {
                collectionID = '-1';
            }

            if (sEcho == undefined) {
                sEcho = '';
            }

            if (query == undefined) {
                query = '';
            }

            if (start == undefined) {
                start = '0';
            }

            if (limit == undefined) {
                limit = '0';
            }

            if (button == lessButton) {
                limit = '20';
            }
            if (button == moreButton) {
                limit = '10';
            }


            var data = [];
            data.push({"name": "query", "value": query});
            data.push({"name": "collection", "value": collectionID});
            data.push({"name": "start", "value": start});
            data.push({"name": "limit", "value": limit});

            var $this = $(this);

            $.ajax({
                cache: false,
                url: sSource,
                dataType: 'xml',
                data: data,
                success: function (data) {
                    /* Translate AC XML to DT JSON */
                    var $xml = $(data);
                    var aaData = [];
                    $.each($xml.find('Choice'), function() {
                        // comes from org.dspace.content.authority.SolrAuthority.java
                        var choice = this;

                        var row = [];
                        var rowData = {};

                        for(var k = 0; k < choice.attributes.length; k++) {
                            var attr = choice.attributes[k];
                            rowData[attr.name] = attr.value;
                        }

                        row.push(rowData.value);
                        row.push(rowData);
                        aaData.push(row);

                    });

                    var nbFiltered = $xml.find('Choices').attr('total');

                    var total = $this.data('totalNbPeople');
                    if (total == undefined || (total * 1) < 1) {
                        total = nbFiltered;
                        $this.data('totalNbPeople', total);
                    }

                    var json = {
                        "sEcho": sEcho,
                        "iTotalRecords": total,
                        "iTotalDisplayRecords": nbFiltered,
                        "aaData": aaData
                    };
                    fnCallback(json);
                }
            });
        }
    });
}
