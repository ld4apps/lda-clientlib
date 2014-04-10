import requests, json, jwt
from rdf_json import RDF_JSON_Encoder, RDF_JSON_Document, rdf_json_decoder
from base_constants import ADMIN_USER

SHARED_SECRET = 'our little secret'

encoded_signature = jwt.encode({'user': ADMIN_USER}, SHARED_SECRET, 'HS256')

POST_HEADERS = {
    'Content-type': 'application/rdf+json+ce', 
    'Cookie': 'SSSESSIONID=%s' % encoded_signature, 
    'ce-post-reason': 'ce-create' 
    }

PATCH_HEADERS = {
    'Content-type': 'application/json', 
    'Cookie': 'SSSESSIONID=%s' % encoded_signature, 
    }

GET_HEADERS = {
    'Accept': 'application/rdf+json+ce', 
    'Cookie': 'SSSESSIONID=%s' % encoded_signature, 
    } 

DELETE_HEADERS = {
    'Cookie': 'SSSESSIONID=%s' % encoded_signature, 
    }     

def get(url):
    r = requests.get(url, headers=GET_HEADERS, verify=False)
    if r.status_code != 200:
        print '######## FAILED TO GET url: %s status_code: %s response_text: %s ' % (url, r.status_code, r.text)
        return None    
    return RDF_JSON_Document(json.loads(r.text, object_hook=rdf_json_decoder), url)

def post(url, body):
    r = requests.post(url, headers=POST_HEADERS, data=json.dumps(body, cls=RDF_JSON_Encoder), verify=False)
    if r.status_code != 201:
        print '######## FAILED TO CREATE url: %s status: %s text: %s body: %s' %(url, r.status_code, r.text, body)
        return None
    print '######## POSTed resource: %s, status: %d' % (r.headers['location'], r.status_code)
    return RDF_JSON_Document(json.loads(r.text, object_hook=rdf_json_decoder), r.headers['location'])
    
def patch(url, body):
    r = requests.patch(url, headers=PATCH_HEADERS, data=json.dumps(body, cls=RDF_JSON_Encoder), verify=False)
    if r.status_code != 200:
        print '######## FAILED TO PATCH url: %s status: %s text: %s body: %s' %(url, r.status_code, r.text, body)
        return None
    print '######## PATCHed resource: %s, status: %d' % (url, r.status_code)
    
def delete(url):
    r = requests.delete(url, headers=DELETE_HEADERS)
    if r.status_code != 200 and r.status_code != 204:
        print '######## FAILED TO DELETE url: %s status: %s text: %s' %(url, r.status_code, r.text)
        return None
    print '######## DELETEed resource: %s, status: %d text: %s' % (url, r.status_code, r.text)
