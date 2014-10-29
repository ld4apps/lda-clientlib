import os, urlparse

if 'HOSTINGSITE_HOST' in os.environ:
    HOSTINGSITE_HOST = os.environ['HOSTINGSITE_HOST'].lower() # hostname and port (if there is one)
    HOSTINGSITE_HOST = HOSTINGSITE_HOST if len(HOSTINGSITE_HOST.split(':')) > 1 else HOSTINGSITE_HOST+':80'
else:
    HOSTINGSITE_HOST = None
    
def get_request_host(environ): # TODO: this function should be moved to a different module in lda-clientlib (e.g., clientutils.py)
    return environ.get('HTTP_CE_RESOURCE_HOST') or environ.get('HTTP_HOST')

# This class implements a URL Policy where the tenant is part of (or derived from) the hostname (e.g., http://cloudsupplements.cloudapps4.me/cat/1.2)
class HostnameTenantURLPolicy():
    def construct_url(self, hostname, tenant, namespace=None, document_id=None, extra_segments=None, query_string=None):
        # hostname is the request hostname. If the hostname is null we are building a relative url.
        # The caller is responsible for assuring that the hostname is compatible with the tenant.
        if document_id is not None:
            parts = ['http:/', hostname, namespace, document_id] if hostname is not None else ['', namespace, document_id]
            if extra_segments is not None:
                parts.extend(extra_segments)
        else:
            if extra_segments is not None:
                raise ValueError('if document_id is None, extra_segments must also be None')
            if namespace is not None:
                parts = ['http:/', hostname, namespace] if hostname is not None else ['', namespace]
            else:
                parts = ['http:/', hostname, ''] if hostname is not None else ['','']
        result =  '/'.join(parts)
        if query_string:
            return '?'.join((result, query_string))
        else:
            return result
     
    def get_url_components(self, environ):
        request_host = get_request_host(environ)
        if request_host is not None:
            tmp_req_host = request_host.lower()
            tmp_req_host = tmp_req_host if len(tmp_req_host.split(':')) > 1 else tmp_req_host+':80'
            if HOSTINGSITE_HOST is None or tmp_req_host == HOSTINGSITE_HOST: 
                tenant = 'hostingsite'
            else:
                tenant_parts = tmp_req_host.split('.')
                if '.'.join(tenant_parts[1:]) == HOSTINGSITE_HOST:
                    tenant = tenant_parts[0]
                else:
                    #TODO: look up a table to see if it's a 'custom domain' for a known tenant
                    tenant = 'hostingsite'
        else:
            tenant = None
        path = environ['PATH_INFO']
        path_parts, namespace, document_id, extra_path_segments = self.parse_path(path)
        return (tenant, namespace, document_id, extra_path_segments, path, path_parts, request_host, environ['QUERY_STRING'])

    def parse_path(self, path):
        path_parts = path.split('/')
        namespace = document_id = extra_path_segments = None
        if len(path_parts) > 1 and path_parts[-1] != '': #trailing /
            namespace = path_parts[1]
            if len(path_parts) > 2:
                document_id = path_parts[2]
                if len(path_parts) > 3:
                    extra_path_segments = path_parts[3:]  
        return path_parts, namespace, document_id, extra_path_segments
        
    def parse(self, url):
        parse_rslt = urlparse.urlparse(str(url))
        path_parts, namespace, document_id, extra_path_segments = self.parse_path(parse_rslt.path)
        return namespace, document_id, extra_path_segments, parse_rslt
    
if __name__ == '__main__':
    # run a few tests
    url_policy = HostnameTenantURLPolicy()
    print url_policy.construct_url('cloudsupplements.cloudapps4.me', 'cloudsupplements', 'cat', '1.2')
    print url_policy.construct_url('cloudsupplements.cloudapps4.me', 'cloudsupplements', 'cat')
    print url_policy.construct_url('cloudsupplements.cloudapps4.me', 'cloudsupplements')    
    print url_policy.construct_url(None, 'cloudsupplements', 'cat', '1.2')
    print url_policy.construct_url(None, 'cloudsupplements', 'cat')
    print url_policy.construct_url(None, 'cloudsupplements')    
    
    tenant, namespace, document_id, extra_path_segments, path, path_parts, hostname, query_string = \
        url_policy.get_url_components({'PATH_INFO': '/cat/1.2', 'HTTP_HOST': 'cloudsupplements.cloudapps4.me', 'QUERY_STRING': None})
    print url_policy.construct_url(hostname, tenant, namespace, document_id)
    
    tenant, namespace, document_id, extra_path_segments, path, path_parts, hostname, query_string = \
        url_policy.get_url_components({'PATH_INFO': '/cat', 'HTTP_HOST': 'cloudsupplements.cloudapps4.me', 'QUERY_STRING': None})
    print url_policy.construct_url(hostname, tenant, namespace, document_id)

    tenant, namespace, document_id, extra_path_segments, path, path_parts, hostname, query_string = \
        url_policy.get_url_components({'PATH_INFO': '/', 'HTTP_HOST': 'cloudsupplements.cloudapps4.me', 'QUERY_STRING': None})
    print url_policy.construct_url(hostname, tenant, namespace, document_id)
