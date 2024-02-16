package org.ontobot;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import org.semanticweb.owlapi.model.*;

import java.io.File;
import java.io.FileNotFoundException;
import java.nio.file.Files;
import java.util.Hashtable;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

import static spark.Spark.port;
import static spark.Spark.post;

public class Main {
    public static void main(String[] args) throws OWLOntologyCreationException, FileNotFoundException, OWLOntologyStorageException {
        String filepath = "src/main/java/org/ontobot/newresponse.json";
        JsonArray taxonomies = JsonFileReader.GetTaxonomies(filepath);
        JsonArray ops = JsonFileReader.GetOps(filepath);
        String[] concepts = JsonFileReader.GetConcepts(filepath);
        String sessionID = JsonFileReader.getSessionID(filepath);

        assert taxonomies != null;

        OntoBuilder ontoBuilder = new OntoBuilder();

        // generate taxonomy stage ontology
//        ontoBuilder.build(concepts, taxonomies);
//        ontoBuilder.saveGeneratedOntology(sessionID);

        // check consistency of taxonomy level stage
//        ontoBuilder.build(concepts, taxonomies);
//        ontoBuilder.getConsistencyResult();

        // check consistency of simple op level stage and advanced level stage

        ontoBuilder.build(concepts, taxonomies, ops);
        ontoBuilder.getConsistencyResult();
        ontoBuilder.saveGeneratedOntology(sessionID);

    }
}
