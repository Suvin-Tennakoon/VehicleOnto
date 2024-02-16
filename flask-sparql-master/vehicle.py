from flask import Flask, render_template, request
from flask import jsonify
import rdflib


g = rdflib.Graph()
g.parse("vehicledata.owl")
print("graph has %s statements." % len(g))

app = Flask(__name__)

@app.route("/vehicle/categories")
def categories():
#GET: Return sorted names of all categories
    qres = g.query(
            """
            PREFIX table:<http://swat.cse.lehigh.edu/resources/onto/nobel.owl#>
            PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX xsd:<http://www.w3.org/2001/XMLSchema#>
            SELECT ?w
            {
                    ?g rdf:type table:VehicleType;
                    table:Problem ?w.
                    }
            GROUP BY ?w
            ORDER BY ?w""")

    unique_category = []
    for row in qres:
        category = ("%s" % row).split('/')[-4]
        if category not in unique_category:
            unique_category.append(category)

    return jsonify({"categories": unique_category})

@app.route("/vehicle/years")
def year():
#GET: Return sorted years are awarded
    qres = g.query(
            """
            PREFIX table:<http://swat.cse.lehigh.edu/resources/onto/nobel.owl#>
            PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX xsd:<http://www.w3.org/2001/XMLSchema#>
            SELECT ?w
            {
                    ?g rdf:type table:VehicleType;
                    table:Problem ?w.
                    }
            GROUP BY ?w
            ORDER BY ?w""")

    unique_year = []

    for row in qres:
        year = ("%s" % row).split('/')[-2]
        if year not in unique_year:
            unique_year.append(year)

    unique_year.sort()

    return jsonify({"years": unique_year})

@app.route("/vehicle/vmodels")
def vmodels():
#GET: Return sorted names of all nations
    qres = g.query(
            """
            PREFIX table:<http://swat.cse.lehigh.edu/resources/onto/nobel.owl#>
            PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX xsd:<http://www.w3.org/2001/XMLSchema#>
            SELECT ?n
            {
                    ?g rdf:type table:VehicleType;
                    table:vmodel ?n.
                    }
            GROUP BY ?n
            ORDER BY ?n""")

    vmodel = []
    for row in qres:
        name = ("%s" % row).rsplit('/',1)[-1]
        vmodel.append(name)

    return jsonify({"vmodels": vmodel})

if __name__ == "__main__":
    app.run()
