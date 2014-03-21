RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
CE = 'http://ibm.com/ce/ns#'
BP = 'http://open-services.net/ns/basicProfile#'
DC = 'http://purl.org/dc/terms/'

function Container_Page_Constructor (page_rdf_json) {
    Page_Constructor.call(this, page_rdf_json)
    }

Container_Page_Constructor.prototype = new Page_Constructor()

Container_Page_Constructor.prototype.constructor = Container_Page_Constructor

Page_Constructor.prototype.page_body_header_html = function(page_body) {
    return '\
        <h1>' + (this.page_rdf_json.getValue('#id') || '<new>') + '</h1>'
    }

Container_Page_Constructor.prototype.process_page_body_header = function() {
    }
    
Page_Constructor.prototype.page_body_detail_html = function(page_body) {
    return '\
        <ul id= "container-members"></ul>\
        <button type="button" id="new_member_button">New Member</button>'
    }
    
Container_Page_Constructor.prototype.process_page_body_detail = function() {
    var newMemberInstructions = this.page_rdf_json.getValue(BP+'newMemberInstructions') 
    var members = get_container_members(this.page_rdf_json)
    var members_ul = document.getElementById('container-members')
    for (var i = 0; i < members.length; i++) { 
        var li = document.createElement('LI')
        li.className = 'member'
        var inner_html = '\
            <a href="' + members[i] + '" target="_parent">' + this.page_rdf_json.getValue(DC+'title', members[i], members[i]) + '</a>'
        li.innerHTML = inner_html
        members_ul.appendChild(li)
        }
    var new_member_button = document.getElementById('new_member_button')
    new_member_button.onclick= function() {window.top.location.href = newMemberInstructions}
    if (window.parent != window) {
        window.parent.setIframeHeightToContentHeight(window.parent.document.getElementById(this.page_rdf_json.getValue('#id')))
        }
    }