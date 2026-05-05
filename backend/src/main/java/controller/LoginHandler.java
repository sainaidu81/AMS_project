// This class belongs to the controller package.
package controller;

// HttpExchange represents one HTTP request and its response.
import com.sun.net.httpserver.HttpExchange;
// HttpHandler is the interface Java's HTTP server calls for each request.
import com.sun.net.httpserver.HttpHandler;
// JSONObject is used to parse the JSON body sent by the frontend.
import org.json.JSONObject;
// DatabaseConnection provides a JDBC connection to the Supabase PostgreSQL DB.
import util.DatabaseConnection;
// HttpUtils centralizes CORS and JSON response helper logic.
import util.HttpUtils;

// IOException is required because reading/writing HTTP requests can fail.
import java.io.IOException;
// java.sql.* imports Connection, PreparedStatement, ResultSet, and SQL exceptions.
import java.sql.*;

// LoginHandler processes requests sent to the /login endpoint.
public class LoginHandler implements HttpHandler {

    // The Java HTTP server calls handle() whenever /login receives a request.
    @Override
    public void handle(HttpExchange exchange) throws IOException {

        // Handle the browser's CORS preflight request before normal login logic.
        if (HttpUtils.handlePreflight(exchange)) {
            // If it was an OPTIONS request, the response has already been sent.
            return;
        }

        // Only POST requests should be allowed for login because credentials are sent in the body.
        if (!exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            // Send a JSON error if someone tries GET, PUT, DELETE, etc.
            HttpUtils.sendJson(exchange, 405, "{\"message\":\"Method not allowed\"}");
            return;
        }

        try {
            // Read the entire request body sent by the frontend.
            String body = new String(exchange.getRequestBody().readAllBytes());

            // Convert the JSON string into a JSONObject so fields can be read by name.
            JSONObject json = new JSONObject(body);

            // Validate that the request contains both values needed for login.
            if (!json.has("email") || !json.has("password")) {
                // Stop early if email or password is missing.
                HttpUtils.sendJson(exchange, 400, "{\"message\":\"Missing email or password\"}");
                return;
            }

            // Extract the email typed in the login form.
            String email = json.getString("email");

            // Extract the password typed in the login form.
            String password = json.getString("password");

            // Open a connection to the Supabase PostgreSQL database.
            Connection con = DatabaseConnection.getConnection();

            // Query the users table for an active account with matching email and password.
            // Note: password_hash currently stores the plain password; later this should use BCrypt.
            String query = "SELECT * FROM users WHERE email = ? AND password_hash = ? AND is_active = true";

            // Prepare the SQL statement safely with placeholders instead of string concatenation.
            PreparedStatement ps = con.prepareStatement(query);

            // Bind the email value to the first ? in the SQL query.
            ps.setString(1, email);

            // Bind the password value to the second ? in the SQL query.
            ps.setString(2, password);

            // Execute the SELECT query and receive matching rows, if any.
            ResultSet rs = ps.executeQuery();

            // Store the JSON message that will be sent back to the frontend.
            String response;

            // rs.next() is true when the database found a matching active user.
            if (rs.next()) {
                // Build a success JSON response.
                response = "{\"message\":\"Login successful\"}";

                // Send HTTP 200 to show the login request succeeded.
                HttpUtils.sendJson(exchange, 200, response);
            } else {
                // Build a failure JSON response when credentials do not match.
                response = "{\"message\":\"Invalid credentials\"}";

                // Send HTTP 401 to show the user is not authenticated.
                HttpUtils.sendJson(exchange, 401, response);
            }

            // Close the result set after reading query results.
            rs.close();

            // Close the prepared statement after the query is finished.
            ps.close();

            // Close the database connection after login processing is complete.
            con.close();

        } catch (Exception e) {
            // Print the full backend error in IntelliJ for debugging.
            e.printStackTrace();

            // Send a generic error message to the frontend.
            HttpUtils.sendJson(exchange, 500, "{\"message\":\"Login failed on server\"}");
        }
    }
}
