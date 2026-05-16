package util;

import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

/**
 * Provides shared helpers for writing JSON responses and handling CORS.
 */
public final class HttpUtils {
    private HttpUtils() {
    }

    /**
     * Adds the CORS headers required by the frontend.
     *
     * @param exchange the active HTTP exchange
     */
    public static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
    }

    /**
     * Handles browser preflight requests for CORS-protected endpoints.
     *
     * @param exchange the active HTTP exchange
     * @return {@code true} when the request was an OPTIONS preflight request
     * @throws IOException if the preflight response cannot be written
     */
    public static boolean handlePreflight(HttpExchange exchange) throws IOException {
        addCorsHeaders(exchange);
        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return true;
        }

        return false;
    }

    /**
     * Sends a JSON response with the supplied HTTP status code.
     *
     * @param exchange the active HTTP exchange
     * @param statusCode the HTTP status code to send
     * @param response the JSON body to write
     * @throws IOException if the response cannot be written
     */
    public static void sendJson(HttpExchange exchange, int statusCode, String response) throws IOException {
        addCorsHeaders(exchange);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
