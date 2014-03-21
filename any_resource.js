DC = 'http://purl.org/dc/terms/'
    
function Any_Resource_Page_Constructor (page_rdf_json) {
    Page_Constructor.call(this, page_rdf_json)
    }

Any_Resource_Page_Constructor.prototype = new Page_Constructor()

Any_Resource_Page_Constructor.prototype.constructor = Any_Resource_Page_Constructor

Any_Resource_Page_Constructor.prototype.build_edit_predicate_maps = function () {
    var predicate_maps = new Display_Map ()
    predicate_maps[DC+'title'] = { label: 'Title', id: 'dc:title', displayType: 'text' }
    predicate_maps[DC+'description'] = { label: 'Description', id: 'dc:description', displayType: 'text' }
    return predicate_maps
}