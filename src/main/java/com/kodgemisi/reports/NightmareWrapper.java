package com.kodgemisi.reports;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.function.Consumer;

/**
 * This class is a wrapper for Nightmare.js process.
 *
 * Created on 12/1/16.
 *
 * @author destan
 */
public class NightmareWrapper {

    // This is thread safe so can be loaded at startup and reused
    final private Path directory;

    /**
     *
     * @param directory where <code>generatePdf.js</code> file is located at.
     *                  Also a symlink to node binary is expected in this directory.
     */
    public NightmareWrapper(Path directory) {
        if (directory == null) {
            throw new IllegalArgumentException("directory is required.");
        }

        this.directory = directory;
    }

    /**
     * This method blocks until the process is finished.
     * This method is thread safe.
     *
     * @param url
     * @param options may be null
     * @param data to be passed as command line argument after serialized to JSON
     * @throws IOException
     * @throws InterruptedException
     */
    public void generatePdf(final URL url, Map<String, String> options, Map<String, Object> data) throws IOException, InterruptedException {
        // using URL class instead of String class is for validation

        if (url == null) {
            throw new IllegalArgumentException("url is required.");
        }

        // options should be passed even it's empty to ensure correct argument order when there is also "data" as last argument
        // e.g node generatePdf.js http://example.com {} {"some": "data"}
        if(options == null) {
            options = Collections.emptyMap();
        }

        final String optionsStr = new ObjectMapper().writeValueAsString(options);

        // ProcessBuilder is not thread safe so every thread (HTTP request) needs a new instance
        final ProcessBuilder processBuilder = new ProcessBuilder();

        final Map<String, String> env = processBuilder.environment();
        env.put("DEBUG", "nightmare*");//TODO put only if debug flag is set [need a debug flag]

        // merging user provided arguments with our essential ones
        // order of "commandArguments.add" is IMPORTANT!
        final List<String> commandArguments = new ArrayList(5);

        // nightmare_wrapper.sh 'wraps' xvfb-run for headless environments
        commandArguments.add("./nightmare_wrapper.sh");
        commandArguments.add("generatePdf.js");
        commandArguments.add(url.toString());// target url
        commandArguments.add(optionsStr);

        if(data != null) {
            final String dataStr = new ObjectMapper().writeValueAsString(data);
            commandArguments.add(dataStr);
        }

        Process process = processBuilder
                .directory(directory.toFile())
                .command(commandArguments)
                .start();

        StreamGobbler streamGobbler = new StreamGobbler(process.getInputStream(), process.getErrorStream(), System.out::println);
        Executors.newSingleThreadExecutor().submit(streamGobbler);// FIXME use a pool
        int exitCode = process.waitFor();

        System.out.println("NightmareWrapper: exitCode " + exitCode);
    }

    /**
     * This is same as calling {@link #generatePdf(URL, Map, Map)} with a null as 3rd parameter.
     *
     * @param url
     * @param options may be null
     * @throws IOException
     * @throws InterruptedException
     * @see #generatePdf(URL, Map, Map)
     */
    public void generatePdf(URL url, Map<String, String> options) throws IOException, InterruptedException {
        this.generatePdf(url, options, null);
    }

    //http://www.baeldung.com/run-shell-command-in-java
    private static class StreamGobbler implements Runnable {
        private InputStream inputStream;
        private InputStream errorStream;
        private Consumer<String> consumer;

        public StreamGobbler(InputStream inputStream, InputStream errorStream, Consumer<String> consumer) {
            this.inputStream = inputStream;
            this.errorStream = errorStream;
            this.consumer = consumer;
        }

        @Override
        public void run() {
            new BufferedReader(new InputStreamReader(inputStream)).lines().forEach(consumer);
            new BufferedReader(new InputStreamReader(errorStream)).lines().forEach(consumer);
        }
    }
}
