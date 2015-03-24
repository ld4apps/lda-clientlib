
RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
RDFS = 'http://www.w3.org/2000/01/rdf-schema#'
OWL = 'http://www.w3.org/2002/07/owl#'
XSD = 'http://www.w3.org/2001/XMLSchema#'
LDP = 'http://www.w3.org/ns/ldp#'
DC = 'http://purl.org/dc/terms/'
CE = 'http://ibm.com/ce/ns#'
AC = 'http://ibm.com/ce/ac/ns#'
VCARD = 'http://www.w3.org/2006/vcard/ns#'
FOAF = 'http://xmlns.com/foaf/0.1/'
    
rdf_util = (function () {

    function URI (uri_string) {
        this.uri_string = uri_string
        }

    URI.prototype.toString = function() {
        return this.uri_string
        }

    URI.prototype.toJSON = function() {
        return {type: 'uri', value: this.uri_string}
        }

    function BNode (bnode_string) {
        this.bnode_string = bnode_string
        }

    BNode.prototype.toString = function() {
        return this.bnode_string
        }

    BNode.prototype.toJSON = function() {
        return {type: 'bnode', value: this.bnode_string}
        }

    Object.defineProperty(URI.prototype, 'hostname',
        {get:
            function() {
                if (!this.anchor) {
                    this.anchor = document.createElement('A')
                    this.anchor.href = this.uri_string
                    }
                return this.anchor.hostname
                }
            }
        )

    function RDF_Date(date_string) {
        this._proto_ = new Date(date_string)
        }

    RDF_Date.prototype.toJSON = function() {
        return {type : "http://www.w3.org/2001/XMLSchema#dateTime", value : this._proto_.toISOString()} 
        }
        
    function Rdf_Jso (graph_url, default_subject) {
        // Use Object.defineProperty rather than simpler syntax to avoid the property becoming enumerable
        // Other than enumerability, this is the equivalent of 'this.graph_url = graph_url'
        Object.defineProperty(this, 'graph_url', {value: graph_url, writable: true})
        Object.defineProperty(this, 'default_subject_url', {value: default_subject, writable: true})
        Object.defineProperty(this, 'default_object_url', {value: default_subject, writable: true})
        }
    // Use Object.defineProperty rather than simpler syntax to avoid the property becoming enumerable
    Object.defineProperty(Rdf_Jso.prototype, 'default_subject_node',
        {value:
            function() {
                return this[this.graph_url]
                }
            }
        )
    // Use Object.defineProperty rather than simpler syntax to avoid the property becoming enumerable
    Object.defineProperty(Rdf_Jso.prototype, 'default_subject',
        {get:
            function() {
                if (this.default_subject_url === undefined) {
                    return this.graph_url
                    }
                else {
                    return this.default_subject_url
                    }
                }
            },
        {set: // this setter does not work as hoped. set default_subject_url instead
            function(default_subject_url) {
                console.log('set', default_subject_url)
                this.default_subject_url = default_subject_url
                }
            }
        )
    // Use Object.defineProperty rather than simpler syntax to avoid the property becoming enumerable
    Object.defineProperty(Rdf_Jso.prototype, 'default_object',
        {get:
            function() {
                if (this.default_object_url === undefined) {
                    return this.graph_url
                    }
                else {
                    return this.default_object_url
                    }
                }
            },
        {set: // this setter does not work as hoped. set default_object_url instead
            function(default_object_url) {
                this.default_object_url = default_object_url
                }
            }
        )
    // Use Object.defineProperty rather than simpler syntax to avoid the property becoming enumerable
    Object.defineProperty(Rdf_Jso.prototype, 'getValues',
        {value:
            function(attribute, default_value, subject) {
                if (subject === undefined) {
                    subject = this.default_subject
                    }
                try {
                    var values = this[subject][attribute.toString()]
                    }
                catch(err) {
                    return default_value
                    }
                if (values == undefined) {
                    return default_value
                    }
                else {
                    var result = []
                    if (! Array.isArray(values)) {
                        values = [values]
                        }
                    for (var i = 0; i < values.length; i++ ) {
                        result.push(values[i])
                        }
                    return result
                    }
                }
            }
        )
    // Use Object.defineProperty rather than simpler syntax to avoid the property becoming enumerable
    Object.defineProperty(Rdf_Jso.prototype, 'getValue',
        {value:
            function(attribute, default_value, subject) {
                if (subject === undefined) {
                    subject = this.default_subject
                    }
                try {
                    var values = this[subject][attribute.toString()]
                    }
                catch(err) {
                    return default_value // will be undefined if not specified in call
                    }
                if (values !== undefined) {
                    return Array.isArray(values) ? values[0] : values
                    }
                else {
                    return default_value
                    }
                }
            }
        )

    // Use Object.defineProperty rather than simpler syntax to avoid the property becoming enumerable
    Object.defineProperty(Rdf_Jso.prototype, 'setValue',
        {value:
            function(attribute, new_value, subject) {
                attribute = attribute.toString()
                if (subject === undefined) {
                    subject = this.default_subject
                    }
                if (subject in this) {
                    this[subject][attribute] = new_value
                    }
                else {
                    var predicates = {}
                    predicates[attribute] = new_value
                    this[subject] = predicates
                    }
                }
            }
        )

    // Use Object.defineProperty rather than simpler syntax to avoid the property becoming enumerable
    Object.defineProperty(Rdf_Jso.prototype, 'add_triple',
        {value:
            function(subject, attribute, new_value) {
                attribute = attribute.toString()
                if (subject === undefined) {
                    subject = this.default_subject
                    }
                else {
                    subject = subject.toString()
                    }
                if (subject in this) {
                    if (attribute in this[subject]) {
                        var old_value = this[subject][attribute]
                        if (Array.isArray(old_value)) {
                            old_value.push(new_value)
                            }
                        else {
                            var new_array = [old_value]
                            new_array.push(new_value)
                            this[subject][attribute] = new_array
                            }
                        }
                    else {
                        this[subject][attribute] = new_value
                        }
                    }
                else {
                    var predicates = {}
                    predicates[attribute] = new_value
                    this[subject] = predicates
                    }
                }
            }
        )

    // Use Object.defineProperty rather than simpler syntax to avoid the property becoming enumerable
    Object.defineProperty(Rdf_Jso.prototype, 'getSubjects',
        {value:
            function(attribute, object) {
                if (object === undefined) {
                    object = this.default_object
                    }
                else {
                    object = object.toString()
                    }
                var subjects = []
                for (var subject in this) {
                    var decl = this[subject]
                    if (attribute in decl) {
                        var value_array = this.getValues(attribute, null, subject)
                        for (var i = 0; i < value_array.length; i++) {
                            if (value_array[i] == object) {
                                subjects.push(new URI(subject))
                                }
                            }
                        }
                    }
                return subjects
                }
            }
        )

    // Use Object.defineProperty rather than simpler syntax to avoid the property becoming enumerable
    Object.defineProperty(Rdf_Jso.prototype, 'getSubject',
        {value:
            function(attribute, default_value, object) {
                if (object === undefined) {
                    object = this.default_object
                    }
                for (var subject in this) {
                    var decl = this[subject]
                    if (attribute in decl) {
                        //var value_array = decl[attribute]
                        var value_array = this.getValues(attribute, null, subject)
                        for (var i = 0; i < value_array.length; i++) {
                            var value = value_array[i]
                            //if (value['type'] == 'uri' && value['value'] == object) {
                            if (value == object) {
                                return subject
                                }
                            }
                        }
                    }
                return default_value
                }
            }
        )

    // Use Object.defineProperty rather than simpler syntax to avoid the property becoming enumerable
    Object.defineProperty(Rdf_Jso.prototype, 'toString',
        {value:
            function() {
                return JSON.stringify(this)
                }
            }
        )

    function parse(string, content_location, real_subject) {
        function restore_native_types(key, val) {
            if (typeof val === 'object') {
                if ('type' in val && 'value' in val) {
                    if (val.type === 'uri') {
                        return new URI(val.value)
                        }
                    else if (val.type === 'bnode') {
                        return new BNode(val.value)
                        }
                    else if (val.type === 'literal') {
                        if (val.datatype === XSD+'dateTime') {
                            return new Date(val.value)
                            }
                        else {
                            throw 'unexpected datatype: ' + val.datatype
                            }
                        }
                    }
                }
            return val
            }

        var rdf_jso = JSON.parse(string, restore_native_types)
        rdf_jso.__proto__ = Rdf_Jso.prototype
        Object.defineProperty(rdf_jso, 'graph_url', {value: content_location})
        Object.defineProperty(rdf_jso, 'default_subject_url', {value: real_subject})
        return rdf_jso
        }

    function Simple_Jso (rdf_jso, converter) {
        // Use Object.defineProperty rather than simpler syntax to avoid the property becoming enumerable
        // Other than enumerability, this is the equivalent of 'this.graph_url = graph_url'
        Object.defineProperty(this, 'derived_from', {value: rdf_jso, writable: true})
        Object.defineProperty(this, 'converter', {value: converter, writable: true})
        Object.defineProperty(this, 'ommitted_subjects', {value: null, writable: true})
        }

    // Use Object.defineProperty rather than simpler syntax to avoid the property becoming enumerable
    Object.defineProperty(Simple_Jso.prototype, 'convert_to_rdf_jso',
        {value:
            function() {
                return this.converter.convert_to_rdf_jso(this)
                }
            }
        )

    // Use Object.defineProperty rather than simpler syntax to avoid the property becoming enumerable
    Object.defineProperty(Simple_Jso.prototype, 'make_patch',
        {value:
            function() {
                var old_graph = this.derived_from;
                if(this.request)
                    old_graph = parse_rdf_json(this.request);
                return graph_diff(this.convert_to_rdf_jso(), old_graph)[3];                
                }
            }
        )

    var standard_prefixes = {}
        standard_prefixes[RDFS] = 'rdfs'
        standard_prefixes[RDF] = 'rdf'
        standard_prefixes[LDP] = 'ldp'
        standard_prefixes[XSD] = 'xsd'
        standard_prefixes[DC] = 'dc'
        standard_prefixes[CE] = 'ce'
        standard_prefixes[OWL] = 'owl'
        standard_prefixes[AC] = 'ac'
        standard_prefixes[VCARD] = 'vcard'
        standard_prefixes[FOAF] = 'foaf'
        
    function Rdf_converter(prefixes) {
        this.prefixes = {}
        for (var attr in standard_prefixes) {this.prefixes[attr] = standard_prefixes[attr]}
        if (prefixes) {
            for (var attr in prefixes) {
                if(!this.prefixes[attr]){this.prefixes[attr] = prefixes[attr]}
                }
            }
        }

    Rdf_converter.prototype.get_rdf_jso_from_rdfa =  function() {
        function add_predicate_value(decl, predicate, object) {
            if (predicate in decl) {
                decl[predicate].push(object)
                    }
            else {
                decl[predicate] = object
                }
            }

        function get_value_from_element(predicate_element) {
            var value = null
            var rdf_json_value = null
            var one_of_many = predicate_element.hasAttribute('one-of-many')
            if (predicate_element.nodeName=='SPAN') {
                var value_type = null
                var data_type = null
                if (predicate_element.hasAttribute('datatype')) {
                    data_type = predicate_element.getAttribute('datatype')}
                else {
                    data_type = 'http://www.w3.org/2001/XMLSchema#string'}
                if (data_type == 'http://www.w3.org/2001/XMLSchema#integer') {rdf_json_value = parseInt(predicate_element.textContent, 10)}
                else if (data_type == 'http://www.w3.org/2001/XMLSchema#double') {rdf_json_value = parseFloat(predicate_element.textContent)}
                else if (data_type == 'http://www.w3.org/2001/XMLSchema#boolean') {rdf_json_value = predicate_element.textContent === 'true'}
                else if (data_type == 'http://www.w3.org/2001/XMLSchema#dateTime') {rdf_json_value = new RDF_Date(predicate_element.textContent)}
                else if (data_type == 'http://www.w3.org/2001/XMLSchema#string') {rdf_json_value = predicate_element.textContent}
                else if (data_type == 'graph') {
                    var sub_elements2 = graph_div.children
                    for (var k=0; k<sub_elements2.length; k++) { // iterate per subject
                        var subgraph_div2 = sub_elements2[k]
                        if (subgraph_div2.nodeName=='DIV' && graph_element.hasAttribute('graph')) {
                            value = get_rdf_jso_from_div(subgraph_div2)
                            rdf_json_value = {'value': value, 'type':'graph'}
                            break
                            }
                        }
                    }
                else if (data_type = RDF+'List') {
                    var value_elements = predicate_element.children
                    rdf_json_value = []
                    for (var l=0; l<value_elements.length; l++) { // iterate over values
                        var element_value = get_value_from_element(value_elements[l])
                        if (element_value != null) {
                            rdf_json_value.push(element_value)
                            }
                        }
                    
                    }
                else {rdf_json_value = {'value': predicate_element.textContent, 'datatype': data_type, 'type':'literal'}}
                return rdf_json_value
                }
            else if (predicate_element.nodeName=='A') {
                var href = predicate_element.getAttribute('href')
                rdf_json_value = href.indexOf('_') === 0 ? new BNode(href) : new URI(href)
                return rdf_json_value
                }
            else { // not a span or anchor
                return null
                }
            }
                    
        function get_rdf_jso_from_body(document) {
            var result = new Rdf_Jso(window.location.href)
            var sub_elements = document.body.children
            for (var i=0; i<sub_elements.length; i++) { // iterate per subject
                var subgraph_div = sub_elements[i]
                if (subgraph_div.hasAttribute('resource')) {
                    var sub_graph = {}
                    result[subgraph_div.getAttribute('resource')] = sub_graph
                    var triple_elements = subgraph_div.children
                    for (var j=0; j<triple_elements.length; j++) { // iterate per triple
                        var predicate_element = triple_elements[j]
                        if (predicate_element.hasAttribute('property')) {
                            var predicate = predicate_element.getAttribute('property')
                            var value = get_value_from_element(predicate_element)
                            if (value != null) {
                                add_predicate_value(sub_graph, predicate, value)
                                }
                            }
                        }
                    }
                }
            return result
            }

        var result = get_rdf_jso_from_body(document)
        var real_subject = window.location.href
        result.default_subject_url =  real_subject
        result.default_object_url =  real_subject
        return result
        }

    Rdf_converter.prototype.convert_to_simple_jso = function(rdf_jso) {
        var self = this

        function make_simple_jso_value(rdf_value, already_converted) {
            if (rdf_value instanceof URI || rdf_value instanceof BNode) {
                var uri_string = rdf_value.toString()
                if (uri_string in rdf_jso) {
                    return make_simple_jso(uri_string, already_converted)
                    }
                }
            return rdf_value
            }

        function compact_predicate(predicate) {
        for (var namespace in self.prefixes) {
            if (predicate.substring(0, namespace.length) === namespace) {
                var prefix = self.prefixes[namespace]
                var shortName = predicate.slice(namespace.length)
                shortName = shortName.replace(/-/g, "__")
                return prefix + '_' + shortName
                }
            }
        return predicate
        }

        function make_simple_jso(subject, already_converted) {
            if (subject in already_converted) {
                return already_converted[subject]
                }
            else {
                var simple_jso = new Simple_Jso(rdf_jso, self)
                simple_jso._subject = subject
                already_converted [subject] = simple_jso
                for (var predicate in rdf_jso[subject]) {
                    var value_array = rdf_jso[subject][predicate]
                    var key = compact_predicate(predicate)
                    if (Array.isArray(value_array)) {
                        simple_jso[key] = []
                        for (var i = 0; i < value_array.length; i++ ) {
                            var rdf_value = value_array[i]
                            simple_jso[key].push(make_simple_jso_value(rdf_value, already_converted))
                            }
                        }
                    else {
                        simple_jso[key] = make_simple_jso_value(value_array, already_converted)
                        }
                    }
                return simple_jso
                }
            }

        var already_converted = {}
        var simple_jso = make_simple_jso(rdf_jso.default_subject, already_converted)
        var ommitted_subjects = {}
        for (var subject in rdf_jso) {
            if (! (subject in already_converted)) {
                ommitted_subjects[subject] = rdf_jso[subject]
                }
            }
        simple_jso.ommitted_subjects = ommitted_subjects
        return simple_jso
        }

    Rdf_converter.prototype.convert_to_rdf_jso = function(simple_jso) {
        var self = this

        function make_rdf_jso_value(simple_jso_value, rdf_jso_graph) {
            if (simple_jso_value && typeof simple_jso_value === 'object' && simple_jso_value.hasOwnProperty('_subject')) {
                var uri_string = make_rdf_jso_subject(simple_jso_value, rdf_jso_graph).toString()
                return uri_string.indexOf('_') === 0 ? new BNode(uri_string) : new URI(uri_string)
                }
            return simple_jso_value
            }

        function expand_predicate(predicate) {
            for (var namespace in self.prefixes) {
                var prefix = self.prefixes[namespace] + '_'
                if (predicate.substring(0, prefix.length) === prefix) {
                    var shortName = predicate.slice(prefix.length)
                    shortName = shortName.replace(/__/g, "-")
                    return namespace + shortName
                    }
                }
            return predicate
            }

        function make_rdf_jso_subject(simple_jso, rdf_jso_graph) {
            var subject = simple_jso['_subject']
            if (!(subject in rdf_jso_graph)) {
                var rdf_jso_subject = {}
                rdf_jso_graph[subject] = rdf_jso_subject
                for (var key in simple_jso) {
                    if (key.indexOf('_') === 0 || key == 'ldp_contains') {
                        continue
                        }
                    var predicate = expand_predicate(key)
                    var value_array = simple_jso[key]
                    if (Array.isArray(value_array)) {
                        rdf_jso_subject[predicate] = []
                        if (!Array.isArray(value_array)) {
                            value_array = [value_array]
                            }
                        for (var i = 0; i < value_array.length; i++ ) {
                            var simple_jso_value = value_array[i]
                            rdf_jso_subject[predicate].push(make_rdf_jso_value(simple_jso_value, rdf_jso_graph))
                            }
                        }
                    else {
                        rdf_jso_subject[predicate] = make_rdf_jso_value(value_array, rdf_jso_graph)
                        }
                    }
                }
            return subject
            }

        var rdf_jso = new Rdf_Jso(simple_jso['_subject'])
        make_rdf_jso_subject(simple_jso, rdf_jso)
        for (var subject in simple_jso.ommitted_subjects) {
            if (subject in rdf_jso) {throw 'unexpected collision'}
            rdf_jso[subject] = simple_jso.ommitted_subjects[subject]
            }
        return rdf_jso
        }

    Rdf_converter.prototype.make_simple_jso = function(request) {
        return this.convert_to_simple_jso(parse_rdf_json(request))}

    function parse_rdf_json(request) {
        if (request.status == 201) {
            var location = request.getResponseHeader('Location')
            return rdf_util.parse(request.responseText, location, location)
            }
        else {
            var content_location = request.getResponseHeader('Content-Location')
            var resource_url = request.resource_url
            var real_subject;
            // get will include a content location but patch will not
            if(content_location) {
                var hash_index = resource_url.indexOf('#')
                real_subject = hash_index >= 0 ? content_location + resource_url.slice(hash_index) : content_location
            }else{
                real_subject = resource_url;
                content_location = resource_url;
            }
            return rdf_util.parse(request.responseText, content_location, real_subject)
            }
        }

    function stringify(object, replacer, indent) {
        already_seen = []
        return JSON.stringify(
            object,
            function(key, value) {
                if (replacer) {
                    value = replacer(key, value)
                    }
                if (typeof value === 'object' && value !== null) {
                    if (value instanceof Simple_Jso) {
                        if (already_seen.indexOf(value) >= 0) {
                            if (value.hasOwnProperty('_subject')) {
                                return 'URI(' + value._subject + ')'
                                }
                            else if (value.hasOwnProperty('_bnodeid')) {
                                return 'BNode(' + value._bnodeid + ')'
                                }
                            else {
                                return "cycle broken"
                                }
                            }
                        else {
                            already_seen.push(value)
                            }
                        }
                    else if ('type' in value && 'value' in value) { // Date, URL or BNode converted to object by toJSON
                        if (value.type === "http://www.w3.org/2001/XMLSchema#dateTime") {value = 'Date(' + value.value.toString() + ')'}
                        else if (value.type === "uri") {value = 'URI(' + value.value.toString() + ')'}
                        else if (value.type === "bnode") {value = 'BNode(' + value.value.toString() + ')'}
                        }
                    }
                return value
                },
            indent)
        }

    function value_in(value, array) {
        for (var i = 0; i < array.length; i++) {
            var match_value = array[i]
            if (typeof match_value === 'object' && typeof value === 'object') {
                if (value == match_value) {return true}
                if (value instanceof URI && match_value instanceof URI && value.toString() === match_value.toString()) {return true}
                if (value instanceof BNode && match_value instanceof BNode && value.toString() === match_value.toString()) {return true}
                if (value instanceof Date && match_value instanceof Date && value.valueOf() === match_value.valueOf()) {return true}
                }
            else if (match_value === value) {return true}
            }
        return false
        }

    function make_str_relative(base, url) {
        // only good enough for the case we care about
        if (url.indexOf(base) === 0) {
            return url.slice(base.length)
            } 
        else {
            return url
            }
        }
    
    function make_obj_relative(base, obj) {
        if (typeof obj == 'object') {
            if (Array.isArray(obj)) {
                var result = []
                for (var i = 0; i < obj.length; i++) {
                    result.push(make_obj_relative(base, obj[i]))
                    }
                return result
                }
            else if (obj instanceof rdf_util.URI) {
                var url_string = obj.toString()
                if (url_string.indexOf(base) === 0) {
                    return new rdf_util.URI(url_string.slice(base.length))
                    } 
                }
            }
        return obj
        }

    function graph_diff(new_graph, old_graph) {
        var added = new Rdf_Jso(), subtracted = new Rdf_Jso(), intersection = new Rdf_Jso(), patch = new Rdf_Jso()
        for (var new_subject in new_graph) {
            for (var new_predicate in new_graph[new_subject]) {
                var new_values = new_graph.getValues(new_predicate, [], new_subject)
                var old_values = old_graph.getValues(new_predicate, [], new_subject)
                for (var i = 0; i < new_values.length; i++) {
                    (value_in(new_values[i], old_values) ? intersection : added).add_triple(new_subject, new_predicate, new_values[i])
                    }
                }
            }
        for (var old_subject in old_graph) {
            for (var old_predicate in old_graph[old_subject]) {
                var old_values = old_graph.getValues(old_predicate, [], old_subject)
                var new_values = new_graph.getValues(old_predicate, [], old_subject)
                for (var i = 0; i < old_values.length; i++) {
                    if (!value_in(old_values[i], new_values)) {
                        subtracted.add_triple(old_subject, old_predicate, old_values[i])
                        }
                    }
                }
            }
        for (var added_subject in added) {
            /* Normally it doesn't matter whether patch subjects are absolute or relative, but there is a case where it makes a difference. Some resources have aliases. If the
               canonical url is '/xx/n.m', it may have an alias of the form '/yy?the_xx_belonging_to_zz'. If we are patching something we retrieved via the alias, then if the patch 
               uses relative urls to refer to its subjects, then the patch can be applied directly to canonical resource without modification. If the patch uses absolute urls, this won't work.
               We do the same thing for objects that are URIs */
            var patch_subject = make_str_relative(new_graph.graph_url, added_subject)
            var added_predicates = added[added_subject]
            for (var added_predicate in added_predicates) {
                patch.setValue(added_predicate, make_obj_relative(new_graph.graph_url, new_graph[added_subject][added_predicate]), patch_subject) // using value from new_graph will maintain the array-ness (or lack thereof)
                }
            }
        for (var subtracted_subject in subtracted) {
            var patch_subject = make_str_relative(new_graph.graph_url, subtracted_subject)
            if (subtracted_subject in new_graph) {
                var subtracted_predicates = subtracted[subtracted_subject]
                for (var subtracted_predicate in subtracted_predicates) {
                    patch.setValue(subtracted_predicate, (subtracted_predicate in new_graph[subtracted_subject]) ? make_obj_relative(new_graph.graph_url, new_graph[subtracted_subject][subtracted_predicate]) : null, patch_subject)
                    }
                }
            else {
                patch[subtracted_subject] = null                
                }
            }
        return [added, subtracted, intersection, patch]
        }

    return {
        parse_rdf_json:parse_rdf_json,
        Rdf_Jso:Rdf_Jso,
        parse:parse,
        Rdf_converter:Rdf_converter,
        URI:URI,
        BNode:BNode,
        stringify:stringify,
        graph_diff:graph_diff
        }
    } ())

ld_util = (function () {

    function set_headers(headers, request) {
        if (headers) {
            for (header in headers) {
                var header_value = headers[header]
                if (Array.isArray(header_value)) {
                    for (var i = 0; i < header_value.length; i++) {
                        request.setRequestHeader(header, header_value[i])
                        }
                    }
                else {
                    request.setRequestHeader(header, header_value)
                    }
                }
            }
        }

    function hasHeader(headers, header) {
        for (hdr in headers) {
            if (hdr.toLowerCase() == header.toLowerCase()) {return true}
            }
        return false
        }

    function get(resource_url, handle_result, headers) {
        resource_url = resource_url.toString()
        if (resource_url.indexOf('http:') === 0) {resource_url = resource_url.slice(5)} // don't force http if the browser is doing https
        else if (resource_url.indexOf('https:') === 0) {resource_url = resource_url.slice(6)} // don't force https if the browser is doing http
        var request=new XMLHttpRequest()
        if (!!handle_result) {
            request.onreadystatechange=function() {
                if (request.readyState==4) {
                    handle_result(request) }
                }
            }
        request.open("GET", resource_url, !!handle_result);
        request.resource_url = resource_url // we will need this later to construct the rdf_util from the response
        request.withCredentials = 'true'
        headers = headers || {}
        set_headers(headers, request)
        if (!hasHeader(headers, 'Accept')) {
            request.setRequestHeader('Accept', 'application/rdf+json+ce')
            }
        request.send()
        return request
        }

    function getHTML(resource_url, handle_result, headers) {
        headers = headers || {}
        headers['Accept'] = 'text/html'
        return get(resource_url, handle_result, headers)
        }

    function send_transform(resource_url, input_resource, handle_result, headers) {
        resource_url = resource_url.toString()
        if (resource_url.indexOf('http:') === 0) {resource_url = resource_url.slice(5)} // don't force http if the browser is doing https
        else if (resource_url.indexOf('https:') === 0) {resource_url = resource_url.slice(6)} // don't force https if the browser is doing http
        var query_str = JSON.stringify(input_resource)
        var request=new XMLHttpRequest()
        if (!!handle_result) {
            request.onreadystatechange=function() {
                if (request.readyState==4) {
                    handle_result(request)
                    }
                }
            }
        request.open('POST',resource_url, !!handle_result)
        set_headers(headers, request)
        if (!hasHeader(headers, 'Content-type')) {
            request.setRequestHeader('Content-type', 'application/json')
            }
        //request.setRequestHeader('Content-Length', query_str.length)
        request.setRequestHeader('CE-Post-Reason', 'CE-Transform')
        request.send(query_str)
        return request
        }
    function send_create(resource_url, new_resource, handle_result, headers) {
        resource_url = resource_url.toString()
        if (resource_url.indexOf('http:') === 0) {resource_url = resource_url.slice(5)} // don't force http if the browser is doing https
        else if (resource_url.indexOf('https:') === 0) {resource_url = resource_url.slice(6)} // don't force https if the browser is doing http
        if ('_subject' in new_resource && !hasHeader(headers, 'Content-type')) {
            new_resource = APPLICATION_ENVIRON.rdf_converter.convert_to_rdf_jso(new_resource)
            }
        var json_str = JSON.stringify(new_resource)
        var request=new XMLHttpRequest()
        if (!!handle_result) {
            request.onreadystatechange=function() {
                if (request.readyState==4) {
                    handle_result(request)
                    }
                }
            }
        request.open('POST',resource_url, !!handle_result)
        set_headers(headers, request)
        if (!hasHeader(headers, 'Content-type')) {
            request.setRequestHeader('Content-type', 'application/rdf+json+ce')
            }
        request.setRequestHeader('CE-Post-Reason', 'CE-Create')
        request.send(json_str)
        return request
        }
    function send_put(resource_url, resource, handle_result, headers) {
        resource_url = resource_url.toString()
        if (resource_url.indexOf('http:') === 0) {resource_url = resource_url.slice(5)} // don't force http if the browser is doing https
        else if (resource_url.indexOf('https:') === 0) {resource_url = resource_url.slice(6)} // don't force https if the browser is doing http
        var json_str = JSON.stringify(resource)
        var request=new XMLHttpRequest()
        if (!!handle_result) {
            request.onreadystatechange=function() {
                if (request.readyState==4) {
                    handle_result(request)
                    }
                }
            }
        request.open('PUT',resource_url, !!handle_result)
        set_headers(headers, request)
        if (!hasHeader(headers, 'Content-type')) {
            request.setRequestHeader('Content-type', 'application/rdf+json+ce')
            }
        request.send(json_str)
        return request
        }
    function send_patch(resource_url, revision, patch_struct, handle_result, headers) {
        original_resource_url = resource_url = resource_url.toString()
        if (resource_url.indexOf('http:') === 0) {resource_url = resource_url.slice(5)} // don't force http if the browser is doing https
        else if (resource_url.indexOf('https:') === 0) {resource_url = resource_url.slice(6)} // don't force https if the browser is doing http
        var json_str = JSON.stringify(patch_struct)
        var request=new XMLHttpRequest()
        request.resource_url = original_resource_url // we will need this later to construct the rdf_util from the response
        if (!!handle_result) {
            request.onreadystatechange=function() {
                if (request.readyState==4) {
                    handle_result(request)
                    }
                }
            }
        request.open("PATCH", resource_url, !!handle_result)
        request.setRequestHeader('CE-Revision', revision.toString())
        set_headers(headers, request)
        if (!hasHeader(headers, 'Content-type')) {
            request.setRequestHeader('Content-type', 'application/rdf+json+ce')
            }
        //request.setRequestHeader('Content-Length', json_str.length)
        request.send(json_str)
        return request
        }
    function send_delete(resource_url, handle_result, headers) {
        resource_url = resource_url.toString()
        if (resource_url.indexOf('http:') === 0) {resource_url = resource_url.slice(5)} // don't force http if the browser is doing https
        else if (resource_url.indexOf('https:') === 0) {resource_url = resource_url.slice(6)} // don't force https if the browser is doing http
        var request = new XMLHttpRequest()
        if (!!handle_result) {
            request.onreadystatechange=function() {
                if (request.readyState==4) {
                    handle_result(request)
                    }
                }
            }
        request.open("DELETE", resource_url, !!handle_result);
        set_headers(headers, request)
        request.send()
        return request
        }

    function setInnerHTML(element, inner_HTML) {
        function forceScript(old_script_element) {
            //var new_script_element = old_script_element.cloneNode() - doesn't work - clone is inactive and will not load
            if (old_script_element.parentNode) { // if there is no parent, the script is no longer in the dom
                var new_script_element = document.createElement('script')
                var old_attributes = old_script_element.attributes
                var id_attrib = null
                for (var a_i = 0; a_i < old_attributes.length; a_i++) {
                    var attrib = old_attributes[a_i]
                    new_script_element.setAttribute(attrib.name, attrib.value)
                    }
                new_script_element.innerHTML = old_script_element.innerHTML
                old_script_element.parentNode.insertBefore(new_script_element, old_script_element)
                if (old_script_element.parentNode) { // if there is no parent, the script is no longer in the dom
                    old_script_element.parentNode.removeChild(old_script_element)
                    }
                return new_script_element
                }
            }

        function forceAllScripts(element) {
            var scripts = element.getElementsByTagName('script');
            scripts = [].slice.call(scripts, 0)
            for (var i = 0; i < scripts.length; i++) { // fire off the async ones first
                var script = scripts[i]
                if (script.hasAttribute('async') || script.hasAttribute('defer')) {
                    if (old_script_element.hasAttribute('src') || old_script_element.hasAttribute('load-src')) { // external script
                        if (script.hasAttribute('type') && scripts[i].getAttribute('type') != 'text/javascript') {
                            // external, non-javascript. Chrome, at least, will not load script elements with a type other than 'text/javascript'
                            if (script.hasAttribute('load-src')) { // user wants the load to happen anyway
                                getHTML(src_url, function(request) {
                                    if (request.status==200) {
                                        script.innerHTML = request.responseText
                                        }
                                    else {
                                        console.log('could not load script - status: ', request.status )
                                        }
                                    })
                                }
                            }
                        else { // external javascript
                            forceScript(script)
                            }
                        }
                    else { // internal script
                        forceScript(old_script_element)
                        }
                    scripts.splice(i, 1)
                    i--
                    }
                }
            // now do the sync ones in order.
            var j = 0
            function forceNextScript() {
                if (j < scripts.length) {
                    var old_script_element = scripts[j]
                    j++
                    if (old_script_element.hasAttribute('src') || old_script_element.hasAttribute('load-src')) { // external script
                        if (old_script_element.hasAttribute('type') && old_script_element.getAttribute('type') != 'text/javascript') { // external, non-javascript. Chrome, at least, will not load script elements with a type other than 'text/javascript'
                            if (old_script_element.hasAttribute('load-src')) { // user wants the load to happen
                                var src_url = old_script_element.getAttribute('load-src')
                                getHTML(src_url, function(request) {
                                    if (request.status==200) {
                                        old_script_element.innerHTML = request.responseText
                                        }
                                    else {
                                        console.log('could not load script - status: ', request.status )
                                        }
                                    forceNextScript()
                                    })
                                }
                            else {  // standard browser behaviour - no load
                                forceNextScript()
                                }
                            }
                        else { // external javascript - force it to load
                            forceScript(old_script_element).onload = forceNextScript
                            }
                        }
                    else { // internal script
                        forceScript(old_script_element)
                        forceNextScript()
                        }
                    }
                }
            forceNextScript()
            }
        element.innerHTML = inner_HTML // sadly, innerHTML refuses to load and execute scripts. We have to force them to load and execute
        forceAllScripts(element)
        }

    function onload(prefixes, type_to_template_map, predicate_to_template_map) {
        var rdf_converter =  new rdf_util.Rdf_converter(prefixes)
        var initial_rdf_jso = rdf_converter.get_rdf_jso_from_rdfa()
        var initial_simple_jso = rdf_converter.convert_to_simple_jso(initial_rdf_jso)
        APPLICATION_ENVIRON = {
            initial_rdf_jso:initial_rdf_jso,
            initial_simple_jso:initial_simple_jso,
            rdf_converter:rdf_converter
            }
        var rdf_type = initial_simple_jso['rdf_type']
        var theme_url = null
        if (rdf_type == CE+'NewMemberInstructions' && predicate_to_template_map) {
            var container = initial_simple_jso.ce_newMemberContainer
            var membershipPredicate = 'ldp_hasMemberRelation' in container ? container.ldp_hasMemberRelation : container.ldp_isMemberOfRelation
            theme_url = predicate_to_template_map[membershipPredicate.toString()]
            }
        else if (rdf_type == LDP+'DirectContainer' && predicate_to_template_map) {
            var container = initial_simple_jso
            var membershipPredicate = 'ldp_hasMemberRelation' in container ? container.ldp_hasMemberRelation : container.ldp_isMemberOfRelation
            theme_url = predicate_to_template_map[membershipPredicate.toString()]
            }
        else {
            if (typeof type_to_template_map === 'string') {
                theme_url = type_to_template_map
                }
            else {
                theme_url = type_to_template_map[rdf_type]
                }
            }
        if (theme_url) {
            ld_util.getHTML(theme_url, function(request) {
                if (request.status == 200) {
                    var app_html = request.responseText
                    ld_util.setInnerHTML(document.body, request.responseText)
                    }
                else {
                    console.log ('failed to load theme: ' + theme_url + ' status: ', request.status)
                    }
                })
            }
        else {
            console.log('No theme found for: ', initial_simple_jso)
            }
        }

    return {
        get:get,
        getRDF:get,
        getHTML:getHTML,
        send_transform:send_transform,
        send_create:send_create,
        send_patch:send_patch,
        send_delete:send_delete,
        send_put:send_put,
        setInnerHTML:setInnerHTML,
        onload:onload
        }
} ())

misc_util = (function () {
    function getSSSessionId() {
        var ss_session_id = document.cookie.match(/(^|; )SSSESSIONID=[\"]*([^";]*)/)
        return ss_session_id ? ss_session_id[2] : null
    }

    function get_jwt_claims() {
        var ss_session_id = getSSSessionId()
        return ss_session_id ? JSON.parse(atob(ss_session_id.split('.')[1])) : null
    }

    function post_logout() { 
        var http=new XMLHttpRequest()
        http.onreadystatechange=function() {
            if (http.readyState==4) {
                if (http.status==200) {
                    window.top.location.reload(forceGet=true)
                    }
                }
            }
        query_str = '{}'
        http.open('POST','/account/logout',true)
        http.setRequestHeader('Content-type', 'application/json') // login is a query. What is logout?
        http.setRequestHeader('Content-Length', query_str.length)
        http.send(query_str)
        }
    
    function get_login() {
        loc = window.top.location.pathname
        if (!(loc == '/account/login' || loc == '/account/new')) {
            window.top.name = window.top.location.href
            }
        window.top.location.assign('/account/login')
        }
    
    function History_Tracker(resource_url, already_in_history, original_document_url) {
        this.resource_url = resource_url
        this.already_in_history = already_in_history
        this.original_document_url =original_document_url
        }
    History_Tracker.prototype.accept_url = function() {
        if (!this.already_in_history) { // if it's a history event, there is already a history entry, so don't make another
            if (navigator.userAgent.indexOf('Firefox') >= 0) { 
                /* Firefox is the friendly browser when it comes to history handing. Firefox only returns history events to a page (technically, document) 
                   if the page created them in the first place. If the user navigates to a history event created by a different page than the current one, 
                   FireFox will load that page instead of sending a history event to the current page. */
                history.pushState(null, null, this.resource_url)
                }
            else { // The Firefox behaviour is what we want on all browsers, but we have to work harder to get it on the other ones.*/
                history.pushState({original_document_url:this.original_document_url}, null, this.resource_url) 
                }
            }
        }
     History_Tracker.prototype.decline_url = function() {           
        if (!this.already_in_history) { // it's OK not to handle if it's not a history event (i.e. it's a new click). We just need to load the right app for it
            window.location.href = this.resource_url
            }
        else { // should not happen. If there is a history event for this resource, it is supposed to mean we took it before and should take it again
            console.log('cannot show resource referenced in history event: ', resource_json)
            }
        }
    function Dispatcher(claims_element_click, get_resource_and_show_view) {
        this.claims_element_click = claims_element_click
        this.get_resource_and_show_view = get_resource_and_show_view
        this.original_document_url = document.location.href
        }
    Dispatcher.prototype.hook_history_and_links = function() {
        var self = this
        if (navigator.userAgent.indexOf('Firefox') < 0) {
            /* Firefox is the friendly browser when it comes to history handing. Firefox only returns history events to a page (technically, document) 
               if the page created them in the first place. If the user navigates to a history event created by a different page than the current one, 
               FireFox will load that page instead of sending a history event to the current page. The Firefox behaviour is what we want on all browsers, 
               but we have to work a bit to get it on the other ones. The first step is to make sure that any events we get from the other
               browsers will have enough information in them that we can tell whether or not it's for the current page or another page. */
            var updated_state = history.state || {}
            updated_state.original_document_url = this.original_document_url
            history.replaceState(updated_state, null) 
            }
        document.onclick = function( event ) {
            var element = event.target
            if (element.nodeName == "A") {
                if (self.claims_element_click(element, event)) { // so far it looks like it might be something we handle, but we won't know for sure until we load it
                    event.preventDefault()
                    var history_tracker = new History_Tracker(element.href, false)
                    self.get_resource_and_show_view(element.href, history_tracker)
                    }
                }
            }
        window.onpopstate = function(event) {
            var history_tracker = new History_Tracker(window.location.href, true)
            if (navigator.userAgent.indexOf('Firefox') < 0) {
                /* If it's not Firefox, the event may not be for this page. Previously we made sure that the state for the event would include a URL we can use to check.*/
                if (event.state && event.state.original_document_url == self.original_document_url) { // it really is for us
                    self.get_resource_and_show_view(window.location.href, history_tracker)
                    }
                else { // Event for a different page. Firefox would have loaded the page for us instead of sending us the event. Chrome and IE work the other way.
                    document.location.reload()
                    }
                }
            else {
                self.get_resource_and_show_view(window.location.href, history_tracker)
                }
            }
        }
    Dispatcher.prototype.go_to = function(url) {
        var history_tracker = new History_Tracker(url.toString(), false)
        this.get_resource_and_show_view(window.location.href, history_tracker)
        }

    return {
        getSSSessionId:getSSSessionId,
        get_login:get_login,
        post_logout:post_logout,
        Dispatcher:Dispatcher,
        get_jwt_claims:get_jwt_claims
    }
} ())
