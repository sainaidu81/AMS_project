// This class belongs to the util package because it is shared by multiple handlers.
package util;

// HttpExchange lets helper methods read request data and write response data.
import com.sun.net.httpserver.HttpExchange;

// IOException is required because writing HTTP responses can fail.
import java.io.IOException;
// OutputStream writes response bytes back to the browser/frontend.
import java.io.OutputStream;
// StandardCharsets.UTF_8 ensures JSON responses are encoded consistently.
import java.nio.charset.StandardCharsets;

// HttpUtils contains reusable HTTP helper methods for this simple Java backend.
public final class HttpUtils {
    // Private constructor prevents creating objects from this utility-only class.
    private HttpUtils() {
    }

    // Add the CORS headers needed for the React frontend to call this backend from another port.
    public static void addCorsHeaders(HttpExchange exchange) {
        // Allow requests from any origin during local development.
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");

        // Tell the browser which HTTP methods this backend accepts.
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

        // Tell the browser it is allowed to send JSON content headers.
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
    }

    // Handle the browser's OPTIONS preflight request before the real POST request.
    public static boolean handlePreflight(HttpExchange exchange) throws IOException {
        // CORS headers must be included on the preflight response.
        addCorsHeaders(exchange);

        // Browsers send OPTIONS first when making JSON POST requests across ports.
        if (exchange.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            // 204 means the preflight succeeded and there is no response body.
            exchange.sendResponseHeaders(204, -1);

            // Return true so the caller knows no more processing is needed.
            return true;
        }

        // Return false for normal requests such as POST /login.
        return false;
    }

    // Send a JSON response with a chosen HTTP status code.
    public static void sendJson(HttpExchange exchange, int statusCode, String response) throws IOException {
        // Add CORS headers to every normal response as well as preflight responses.
        addCorsHeaders(exchange);

        // Tell the frontend that the response body is JSON.
        exchange.getResponseHeaders().set("Content-Type", "application/json");

        // Convert the JSON string to UTF-8 bytes before writing it to the response stream.
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);

        // Send the HTTP status code and exact response body length.
        exchange.sendResponseHeaders(statusCode, bytes.length);

        // Open the response body stream and automatically close it after writing.
        try (OutputStream os = exchange.getResponseBody()) {
            // Write the JSON bytes back to the browser.
            os.write(bytes);
        }
    }
}
