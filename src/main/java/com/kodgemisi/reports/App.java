package com.kodgemisi.reports;


import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URL;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public class App {
    public static void main(String[] args) throws IOException, InterruptedException {
        System.out.println("Started");

        Path nightmarePath = Paths.get("/home/destan/Desktop/reporting/nightmareTryout");
        URL templateUrl = new URL("file:///home/destan/Desktop/reporting/report_template.html");

        // options
        Map<String, String> options = new HashMap<>();
        options.put("inputDataFile", "/home/destan/Desktop/data.json");
        String optionsStr = new ObjectMapper().writeValueAsString(options);

        new NightmareWrapper(nightmarePath).generatePdf(templateUrl, optionsStr);

        System.out.println("ended");
    }

}
