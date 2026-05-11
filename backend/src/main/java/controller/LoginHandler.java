// This class belongs to the controller package.
package controller;

// HttpExchange represents one HTTP request and its response.
import com.sun.net.httpserver.HttpExchange;
// HttpHandler is the interface Java's HTTP server calls for each request.
import com.sun.net.httpserver.HttpHandler;
// BCrypt verifies a plain password against the stored BCrypt hash from the database.
import org.mindrot.jbcrypt.BCrypt;
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
// Pattern is used for a practical backend email format check before querying the database.
import java.util.regex.Pattern;

// LoginHandler processes requests sent to the /login endpoint.
public class LoginHandler implements HttpHandler {

    // This email pattern intentionally checks the practical shape used by most login systems.
    // It rejects missing @, missing domain, missing dot in the domain, and whitespace.
    // The frontend uses the same kind of check for UX, but this backend check is the enforcement point.
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    // Login should not enforce password complexity because existing passwords may follow older policies.
    // This limit is an abuse guard to reject unusually large request bodies before BCrypt work happens.
    private static final int MAX_PASSWORD_LENGTH = 128;

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

            // Extract and trim the email typed in the login form.
            // Trimming email is safe because leading/trailing spaces are not meaningful in this app.
            String email = json.getString("email").trim();

            // Extract the password typed in the login form.
            // Do not trim passwords: a leading or trailing space could be part of the user's real password.
            String password = json.getString("password");

            // Enforce backend validation before doing any database lookup.
            // The frontend also checks this to guide users, but API callers can bypass the frontend completely.
            if (email.isEmpty()) {
                HttpUtils.sendJson(exchange, 400, "{\"message\":\"Email is required\"}");
                return;
            }

            // Reject emails that do not have the normal user@domain.tld shape.
            if (!EMAIL_PATTERN.matcher(email).matches()) {
                HttpUtils.sendJson(exchange, 400, "{\"message\":\"Invalid email format\"}");
                return;
            }

            // Login requires a password, but complexity rules belong to password creation/reset flows.
            if (password.isEmpty()) {
                HttpUtils.sendJson(exchange, 400, "{\"message\":\"Password is required\"}");
                return;
            }

            // Reject unusually long passwords before running BCrypt to avoid unnecessary expensive work.
            if (password.length() > MAX_PASSWORD_LENGTH) {
                HttpUtils.sendJson(exchange, 400, "{\"message\":\"Password is too long\"}");
                return;
            }

            // Open a connection to the Supabase PostgreSQL database.
            Connection con = DatabaseConnection.getConnection();

            // Fetch the active user by email first.
            // With BCrypt, login cannot compare raw password text in SQL because the stored hash includes a salt.
            String query = "SELECT password_hash FROM users WHERE email = ? AND is_active = true";

            // Prepare the SQL statement safely with placeholders instead of string concatenation.
            PreparedStatement ps = con.prepareStatement(query);

            // Bind the email value to the first ? in the SQL query.
            ps.setString(1, email);

            // Execute the SELECT query and receive matching rows, if any.
            ResultSet rs = ps.executeQuery();

            // Store the JSON message that will be sent back to the frontend.
            String response;

            // rs.next() is true when the database found an active user for this email.
            if (rs.next()) {
                // Read the stored BCrypt hash from the password_hash column.
                String storedHash = rs.getString("password_hash");

                // Compare the plain password from the form with the stored BCrypt hash.
                // BCrypt.checkpw handles the embedded salt automatically, so the user can type the normal password.
                if (storedHash != null && BCrypt.checkpw(password, storedHash)) {
                    // Build a success JSON response when the password matches the stored hash.
                    response = "{\"message\":\"Login successful\"}";

                    // Send HTTP 200 to show the login request succeeded.
                    HttpUtils.sendJson(exchange, 200, response);
                } else {
                    // Build a failure JSON response when the password does not match the stored hash.
                    response = "{\"message\":\"Invalid credentials\"}";

                    // Send HTTP 401 to show the user is not authenticated.
                    HttpUtils.sendJson(exchange, 401, response);
                }
            } else {
                // Build a failure JSON response when the email does not belong to an active user.
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
