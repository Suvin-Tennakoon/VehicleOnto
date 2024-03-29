import firebase_admin
import os
from firebase_admin import credentials,firestore

# Join the directory name and file name to create the full path
full_path = os.path.abspath('../flask-server/ontobot/keys/firestore-key.json')

# Fetch the service account key JSON file contents
cred = credentials.Certificate(full_path)
# Initialize the app with a service account, granting admin privileges
firebase_admin.initialize_app(cred)

db = firestore.client()

taxonomy_ref = db.collection('TaxonomyContents')
owl_taxonomy_ref = db.collection('OWLTaxonomyContents')
owl_complete_content_ref = db.collection('OWLCompleteContents') 
owl_taxonomy_populate_ref = db.collection('TaxonomyPopulateContents')
nary_ref = db.collection('NaryContents')

doc_ref = taxonomy_ref.document()
owl_doc_ref = owl_taxonomy_ref.document()
owl_complete_doc_ref = owl_complete_content_ref.document()
owl_taxo_populate_doc_ref = owl_taxonomy_populate_ref.document()
nary_doc_ref = nary_ref.document()

# Define a function to create n-ary concepts in a collection
def create_nary_document(session_id=None, obj=None):
    query = nary_ref.where("sessionID", "==", session_id)
    results = query.get()
    if len(results) > 0:
        # Loop through the documents and delete each one
        for doc in results:
            doc.reference.delete()
    
    nary_doc_ref.set(obj)

# Define a function to create taxonomy populate document in a collection
def create_new_taxo_populate_document(session_id=None, obj=None):
    query = owl_taxonomy_populate_ref.where("sessionID", "==", session_id)
    results = query.get()
    if len(results) > 0:
        # Loop through the documents and delete each one
        for doc in results:
            doc.reference.delete()
    
    owl_taxo_populate_doc_ref.set(obj)

# Define a function to create a new document in a collection
def create_new_document(session_id=None, obj=None):

    query = taxonomy_ref.where("sessionID", "==", session_id)
    results = query.get()

    if len(results) > 0:
        # Loop through the documents and delete each one
        for doc in results:
            doc.reference.delete()
    
    doc_ref.set(obj)

# Define a function to create a new owl-taxonomy document in a collection
def create_new_owlTaxo_document(session_id=None, obj=None):
    query = owl_taxonomy_ref.where("sessionID", "==", session_id)
    results = query.get()

    if len(results) > 0:
        # Loop through the documents and delete each one
        for doc in results:
            doc.reference.delete()
    
    owl_doc_ref.set(obj)


# Define a function to create a new owl-complete document in a collection
def create_new_owlComplete_document(session_id=None, obj=None):
    query = owl_complete_content_ref.where("sessionID", "==", session_id)
    results = query.get()

    if len(results) > 0:
        # Loop through the documents and delete each one
        for doc in results:
            doc.reference.delete()
    
    owl_complete_doc_ref.set(obj)


# Define a function to get a document from TaxonomyContents collection
def get_document(session_id):
    query = taxonomy_ref.where("sessionID", "==", session_id)
    results = query.get()

    # Get the first document that matches the query
    if len(results) > 0:
        # Convert the document data to a Python dictionary
        user_data = results[0].to_dict()
        # Return the user data
        return user_data
    else:
        return None


# Define a function to get a document from OWLTaxonomyContents collection
def get_OwlTaxo_document(session_id):
    query = owl_taxonomy_ref.where("sessionID", "==", session_id)
    results = query.get()

    # Get the first document that matches the query
    if len(results) > 0:
        # Convert the document data to a Python dictionary
        user_data = results[0].to_dict()
        # Return the user data
        return user_data
    else:
        return None


# Define a function to get a document from OWLCompleteContents collection
def get_owlComplete_document(session_id):
    query = owl_complete_content_ref.where("sessionID", "==", session_id)
    results = query.get()

    # Get the first document that matches the query
    if len(results) > 0:
        # Convert the document data to a Python dictionary
        user_data = results[0].to_dict()
        # Return the user data
        return user_data
    else:
        return None
    

def get_nary_document(session_id):
    query = nary_ref.where("sessionID", "==", session_id)
    results = query.get()

    # Get the first document that matches the query
    if len(results) > 0:
        # Convert the document data to a Python dictionary
        user_data = results[0].to_dict()
        # Return the user data
        return user_data
    else:
        return None
