// This class belongs to the controller package.
package controller;

// HttpExchange represents one HTTP request and its response.
import com.sun.net.httpserver.HttpExchange;
// HttpHandler is implemented by classes that handle Java HTTP server endpoints.
import com.sun.net.httpserver.HttpHandler;
// BCrypt hashes the plain password before it is stored in the database.
import org.mindrot.jbcrypt.BCrypt;
// JSONObject is used to parse JSON sent from the frontend signup form.
import org.json.JSONObject;
// DatabaseConnection opens JDBC connections to the Supabase PostgreSQL database.
import util.DatabaseConnection;
// HttpUtils contains reusable CORS and JSON response helpers.
import util.HttpUtils;

// IOException is needed because HTTP request/response operations can fail.
import java.io.IOException;
// java.sql.* imports JDBC classes such as Connection, PreparedStatement, and SQLException.
import java.sql.*;
// Instant is used to create current timestamps for created_at and updated_at.
import java.time.Instant;

// RegisterHandler processes requests sent to the /register endpoint.
public class RegisterHandler implements HttpHandler {

    // The Java HTTP server calls handle() whenever /register receives a request.
    @Override
    public void handle(HttpExchange exchange) throws IOException {

        // Handle browser CORS preflight requests before normal registration logic.
        if (HttpUtils.handlePreflight(exchange)) {
            // If the request was OPTIONS, the helper already sent the response.
            return;
        }

        // Registration should only accept POST because form data is sent in the request body.
        if (!exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            // Reject all non-POST methods with a JSON error response.
            HttpUtils.sendJson(exchange, 405, "{\"message\":\"Method not allowed\"}");
            return;
        }

        try {
            // Read the full JSON request body sent by the frontend.
            String body = new String(exchange.getRequestBody().readAllBytes());

            // Convert the JSON text into a JSONObject for field access.
            JSONObject json = new JSONObject(body);

            // Make sure the signup request includes the required fields.
            if (!json.has("employee_id") || !json.has("email") || !json.has("password")) {
                // Stop immediately if any required value is missing.
                HttpUtils.sendJson(exchange, 400, "{\"message\":\"Missing required fields\"}");
                return;
            }

            // Read the employee ID entered by the user.
            // This must already exist in the employees table because of the foreign key.
            String employeeId = json.getString("employee_id");

            // Read the email address entered during signup.
            String email = json.getString("email");

            // Read the password entered during signup.
            // This starts as plain text only inside the request and should never be stored as-is.
            String password = json.getString("password");

            // Convert the plain password into a BCrypt hash before writing anything to the database.
            // BCrypt automatically generates a salt and stores salt + cost factor inside the final hash.
            String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());

            // Option A flow: all self-registered users start as normal employees.
            // The frontend is not allowed to choose admin or it_manager during signup.
            String role = "employee";

            // Open a database connection to Supabase.
            Connection con = DatabaseConnection.getConnection();

            // Check whether another user account already uses this email.
            String checkQuery = "SELECT 1 FROM users WHERE email = ?";

            // Prepare the email lookup query with a safe placeholder.
            PreparedStatement checkPs = con.prepareStatement(checkQuery);

            // Bind the submitted email to the placeholder.
            checkPs.setString(1, email);

            // Execute the duplicate-email check.
            ResultSet checkRs = checkPs.executeQuery();

            // If a row is returned, that email already exists in users.
            if (checkRs.next()) {
                // Create the duplicate-email response body.
                String response = "{\"message\":\"Email already exists\"}";

                // Send HTTP 400 because the request cannot create a duplicate user email.
                HttpUtils.sendJson(exchange, 400, response);

                // Close the result set before returning.
                checkRs.close();

                // Close the prepared statement before returning.
                checkPs.close();

                // Close the database connection before returning.
                con.close();
                return;
            }

            // Insert a new login/account row for an employee that already exists.
            String query = "INSERT INTO users (employee_id, email, password_hash, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)";

            // Prepare the INSERT statement with placeholders for all dynamic values.
            PreparedStatement ps = con.prepareStatement(query);

            // Bind employee_id to the first SQL placeholder.
            ps.setString(1, employeeId);

            // Bind email to the second SQL placeholder.
            ps.setString(2, email);

            // Store the BCrypt hash in password_hash instead of the original plain password.
            ps.setString(3, hashedPassword);

            // Bind the fixed role value, currently always "employee".
            ps.setString(4, role);

            // Mark the account active immediately for testing.
            // Later, set this to false if you add admin approval.
            ps.setBoolean(5, true);

            // Set created_at to the current server time.
            ps.setTimestamp(6, Timestamp.from(Instant.now()));

            // Set updated_at to the current server time.
            ps.setTimestamp(7, Timestamp.from(Instant.now()));

            // Run the INSERT statement against the Supabase database.
            ps.executeUpdate();

            // Close the INSERT prepared statement.
            ps.close();

            // Close the earlier duplicate-check prepared statement.
            checkPs.close();

            // Close the earlier duplicate-check result set.
            checkRs.close();

            // Close the database connection after registration completes.
            con.close();

            // Build the success response body.
            String response = "{\"message\":\"User registered successfully\"}";

            // Send HTTP 200 to the frontend to confirm successful registration.
            HttpUtils.sendJson(exchange, 200, response);

        } catch (SQLException e) {
            // Print SQL/database errors in IntelliJ for debugging.
            e.printStackTrace();

            // PostgreSQL SQLSTATE 23503 means a foreign key failed.
            // In this app, that usually means employee_id is not present in employees.
            if ("23503".equals(e.getSQLState())) {
                HttpUtils.sendJson(exchange, 400, "{\"message\":\"Employee ID does not exist in employees table\"}");
                return;
            }

            // PostgreSQL SQLSTATE 23505 means a unique constraint failed.
            // In this app, that can happen for duplicate employee_id or duplicate email.
            if ("23505".equals(e.getSQLState())) {
                HttpUtils.sendJson(exchange, 400, "{\"message\":\"Employee ID or email already exists\"}");
                return;
            }

            // PostgreSQL SQLSTATE 23514 means a CHECK constraint failed.
            // In this app, that would usually mean role is not admin, it_manager, or employee.
            if ("23514".equals(e.getSQLState())) {
                HttpUtils.sendJson(exchange, 400, "{\"message\":\"Invalid role selected\"}");
                return;
            }

            // Send a generic database error for other SQL problems.
            HttpUtils.sendJson(exchange, 500, "{\"message\":\"Database error during registration\"}");
        } catch (Exception e) {
            // Print any non-SQL error, such as malformed JSON or unexpected server failures.
            e.printStackTrace();

            // Send a generic server error to the frontend.
            HttpUtils.sendJson(exchange, 500, "{\"message\":\"Registration failed on server\"}");
        }
    }
}
