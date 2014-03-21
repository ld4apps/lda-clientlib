RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
BP = 'http://open-services.net/ns/basicProfile#'
XSD = 'http://www.w3.org/2001/XMLSchema#'
DC = 'http://purl.org/dc/terms/'
CE = 'http://ibm.com/ce/ns#'
CE_post_reason = 'CE-Create'

function New_Member_Page_Constructor (page_rdf_json) {
    Page_Constructor.call(this, page_rdf_json)
    }

New_Member_Page_Constructor.prototype = new Page_Constructor()

New_Member_Page_Constructor.prototype.constructor = New_Member_Page_Constructor
    
New_Member_Page_Constructor.prototype.construct_page_body = function() {
    CE_post_container = this.page_rdf_json.getValue(BP+'newMemberContainer')
    Page_Constructor.prototype.construct_page_body.call(this)
    }   
    
New_Member_Page_Constructor.prototype.page_body_header_html = function() {
    var newMemberPrototypes = this.page_rdf_json.getValues(BP+'newMemberPrototypes')
    var inner_html = '<h2>'
    if (newMemberPrototypes.length == 1) {
        var prototypeResource = newMemberPrototypes[0]
        inner_html += 'New ' + this.page_rdf_json.getValue(RDFS+'label', null, prototypeResource)    
        }
    else {
        inner_html = 'New <select id="new-member-type-selector"></select>'
        }
    var container = this.page_rdf_json.getValue(BP+'newMemberContainer')
    var membership_predicate = this.page_rdf_json.getValue(BP+'membershipPredicate', '', container)
    var membership_subject = this.page_rdf_json.getValue(BP+'membershipSubject', null, container)
    var membership_object = this.page_rdf_json.getValue(BP+'membershipObject', null, container)
    if (membership_object) {
        inner_html += ' with property ' + membership_predicate + ' pointing to ' + (membership_subject || membership_object)
        }
    else {
        inner_html += ' referenced by property ' + membership_predicate + ' of ' + (membership_subject || membership_object)
        }
    inner_html += '</h2>'
    return inner_html
    }

New_Member_Page_Constructor.prototype.process_page_body_header = function() {
    var newMemberPrototypes = this.page_rdf_json.getValues(BP+'newMemberPrototypes')
    if (newMemberPrototypes.length > 1) {
        var new_member_type_selector = document.getElementById('new-member-type-selector')
        var inner_html = ''
        for (var i = 0; i< newMemberPrototypes.length; i++) {
            var prototypeResource = newMemberPrototypes[i]
            var label = this.page_rdf_json.getValue(RDFS+'label', null, prototypeResource)
            var prototype_url = this.page_rdf_json.getValue(BP+'newMemberPrototype', null, prototypeResource)
            innerHTM += '<option value ="' + prototype_url + '">' + label + '</option>'
            }
        new_member_type_selector.innerHTML = inner_html
        new_member_type_selector.onchange = function() {
            var prototype_url = this.options[this.selectedIndex].value
            var page_body_iframe = document.getElementById('page-body-iframe')
            page_body_iframe.src = prototype_url
            }
        }
    }

New_Member_Page_Constructor.prototype.page_body_detail_html = function() {
    return '<iframe id="page-body-iframe" class="page-body-iframe"  frameborder="0" scrolling="no" seamless></iframe>'
    }
    
New_Member_Page_Constructor.prototype.process_page_body_detail = function() {
    var newMemberPrototypes = this.page_rdf_json.getValues(BP+'newMemberPrototypes')
    var prototype_url = this.page_rdf_json.getValue(BP+'newMemberPrototype', null, newMemberPrototypes[0])
    var page_body_iframe = document.getElementById('page-body-iframe')
    page_body_iframe.src = prototype_url
    }