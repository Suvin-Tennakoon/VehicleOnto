from ontobot.model.output import Error, Response
from ontobot.utils.rules.subkind import Subkind
from ontobot.utils.rules.custom import Custom
from ontobot.utils.rules.phase import Phase
from ontobot.utils.rules.rolemixin import RMixin
from ontobot.utils.rules.category import Category
from ontobot.utils.rules.role import Role
from ontobot.utils.rules import custom
from ontobot.utils.owl import OWL
from ontobot.services import factory, firestore_connect
from ontobot.utils import cmethod

from ontobot.db.taxonomy import Taxonomy


def validate_taxonomy_service(parsed_json):
    # print(parsed_json)
    try:
        valid_concept = []
        all_concepts = []
        warn_list = []; warn_list.clear()
        owl = OWL(parsed_json)
        sessionID = parsed_json['sessionId']

        # get all concepts into a set
        all_concepts = owl.get_taxonomy_concepts()

        subkind_pattern: Subkind = factory.ODPFactory.get_ontouml_odp(
            'subkind', parsed_json)
        custom_pattern: Custom = factory.ODPFactory.get_ontouml_odp(
            'custom', parsed_json)
        phase_pattern: Phase = factory.ODPFactory.get_ontouml_odp(
            'phase', parsed_json)
        rolemixin_pattern: RMixin = factory.ODPFactory.get_ontouml_odp(
            'rolemixin', parsed_json)
        category_pattern: Category = factory.ODPFactory.get_ontouml_odp(
            'category', parsed_json)
        role_pattern: Role = factory.ODPFactory.get_ontouml_odp(
            'role', parsed_json
        )

        # identify valid concepts
        valid_concept.extend(subkind_pattern.get_subkind_list())
        valid_concept.extend(phase_pattern.get_phase_list())
        valid_concept.extend(custom_pattern.get_custom_list())
        valid_concept.extend(rolemixin_pattern.get_rolemixin_list())
        valid_concept.extend(category_pattern.get_category_list())
        valid_concept.extend(role_pattern.get_role_list())

        # identify warning messages
        warn_list.extend(phase_pattern.get_phase_warn_list())
        warn_list.extend(category_pattern.get_category_warn_list())

        # convirt valid_consept list into set
        valid_concept = set(valid_concept)

        if valid_concept == all_concepts:
            # add custom ontology pattern (QQ pattern) 
            # return Response.send_response("can proceed further")
            result = owl.get_taxonomy_concept_with_meta()
            
            _ = Taxonomy(result)
            firestore_connect.create_new_document(sessionID, {
                "sessionID": sessionID,
                "msg": cmethod.convertToTaxonomyContent(result=result)
            })
            new_parsed_json = custom.get_qq_pattern(parsed_json, result)

            if len(warn_list) == 0:
                #return Response.send_response(new_parsed_json)
                return Response.next(msg=new_parsed_json)
            else:
                #return Error.send_taxonomy_warn(warn_list=warn_list)
                return Error.next(err=warn_list, type="warning")

        else:
            set_difference = all_concepts - valid_concept
            #return Error.send_taxonomy_error(list(set_difference), owl.get_taxonomy_concept_with_meta())
            return Error.next(err={
                'list': list(set_difference),
                'tcwm' : owl.get_taxonomy_concept_with_meta()
            }, type="error_taxonomy")

    except Exception as err:
        return Error.next(err=err.with_traceback(), type="error")


def get_taxonomy_owl(parsed_json):
    try:
        if len(parsed_json) == 0:
            raise Exception('data array is empty')

        session_id = parsed_json['sessionId']
        owl_old = OWL(parsed_json)
        all_concepts = owl_old.get_taxonomy_concepts()
        # result = owl_old.get_taxonomy_concept_with_meta() # All the concepts inside an array according to the BFS
        # new_parsed_json = custom.get_qq_pattern(parsed_json, result)    # Generate QQ Pattern
        taxo_json = owl_old.get_taxonomy_json()
        # owl_new = OWL(parsed_json) # This is for firestores
        
        firestore_connect.create_new_owlTaxo_document(session_id=session_id, obj={
            "sessionID": session_id,
            "concepts": list(all_concepts),
            "taxonomy": cmethod.convertToTaxonomyContent(result= taxo_json)
        })
        
        owl_java = OWL(parsed_json)

        # return Response.send_response({
        #     "sessionID": session_id,
        #     "concepts": list(all_concepts),
        #     "taxonomy": owl_java.get_taxonomy_json()
        # })

        return Response.next({
            "sessionID": session_id,
            "concepts": list(all_concepts),
            "taxonomy": owl_java.get_taxonomy_json()
        })

    except Exception as err:
        # return Error.send_something_went_wrong_error(err)
        return Error.next(err=err)


