package org.ontobot;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import java.io.FileReader;
import java.io.IOException;

public class JsonFileReader {
    public static void main(String[] args) {
    }
    public static JsonArray GetTaxonomies(String jsonPath) {
        Gson gson = new Gson();

        try (FileReader reader = new FileReader(jsonPath)) {
            JsonObject jsonObject = gson.fromJson(reader, JsonObject.class);
            // use jsonObject to access the data
            JsonObject msg = jsonObject.getAsJsonObject("msg");

            return msg.getAsJsonArray("taxonomy");

        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
    public static JsonArray GetOps(String jsonPath) {
        Gson gson = new Gson();

        try (FileReader reader = new FileReader(jsonPath)) {
            JsonObject jsonObject = gson.fromJson(reader, JsonObject.class);
            // use jsonObject to access the data
            JsonObject msg = jsonObject.getAsJsonObject("msg");

            return msg.getAsJsonArray("op");

        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static String[] GetConcepts(String jsonPath) {
        Gson gson = new Gson();

        try (FileReader reader = new FileReader(jsonPath)) {
            JsonObject jsonObject = gson.fromJson(reader, JsonObject.class);
            // use jsonObject to access the data
            JsonObject msg = jsonObject.getAsJsonObject("msg");

            JsonArray jsonArray = msg.getAsJsonArray("concepts");

            String[] stringArray = new String[jsonArray.size()];
            for (int i = 0; i < jsonArray.size(); i++) {
                stringArray[i] = jsonArray.get(i).toString();
            }
            return stringArray;

        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static String getSessionID(String jsonPath) {
        Gson gson = new Gson();

        try (FileReader reader = new FileReader(jsonPath)){
            JsonObject jsonObject = gson.fromJson(reader, JsonObject.class);
            // use jsonObject to access the data
            JsonObject msg = jsonObject.getAsJsonObject("msg");
            return msg.get("sessionID").toString();

        } catch (IOException e) {
            e.printStackTrace();
        }

        return null;
    }
}
