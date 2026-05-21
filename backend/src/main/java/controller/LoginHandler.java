package controller;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import org.mindrot.jbcrypt.BCrypt;
import org.json.JSONObject;
import util.AuthUtils;
import util.DatabaseConnection;
import util.HttpUtils;

import java.io.IOException;
import java.sql.*;
import java.util.regex.Pattern;

/**
 * Processes authentication requests sent to the {@code /login} endpoint.
 */
public class LoginHandler implements HttpHandler {

    /**
     * Validates the basic {@code user@domain.tld} email shape used by the login flow.
     */
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    /**
     * Guards the login endpoint from unusually large password payloads.
     */
    private static final int MAX_PASSWORD_LENGTH = 128;

    /**
     * Maps a database role to the dashboard route the frontend should open after login.
     *
     * @param role the role stored in the users table
     * @return the dashboard route for the role
     */
    private static String dashboardPathForRole(String role) {
        return switch (role) {
            case "admin" -> "/admin/dashboard";
            case "it_manager" -> "/it/dashboard";
            case "employee" -> "/employee/dashboard";
            default -> "";
        };
    }

    /**
     * Validates login input, checks the stored password hash, and returns a JSON response.
     *
     * @param exchange the HTTP request/response exchange for the current login attempt
     * @throws IOException if the request cannot be read or the response cannot be written
     */
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) {
            return;
        }

        if (!exchange.getRequestMethod().equalsIgnoreCase("POST")) {
            HttpUtils.sendJson(exchange, 405, "{\"message\":\"Method not allowed\"}");
            return;
        }

        try {
            String body = new String(exchange.getRequestBody().readAllBytes());
            JSONObject json = new JSONObject(body);
            if (!json.has("email") || !json.has("password")) {
                HttpUtils.sendJson(exchange, 400, "{\"message\":\"Missing email or password\"}");
                return;
            }

            String email = json.getString("email").trim();
            String password = json.getString("password");

            if (email.isEmpty()) {
                HttpUtils.sendJson(exchange, 400, "{\"message\":\"Email is required\"}");
                return;
            }

            if (!EMAIL_PATTERN.matcher(email).matches()) {
                HttpUtils.sendJson(exchange, 400, "{\"message\":\"Invalid email format\"}");
                return;
            }

            if (password.isEmpty()) {
                HttpUtils.sendJson(exchange, 400, "{\"message\":\"Password is required\"}");
                return;
            }

            if (password.length() > MAX_PASSWORD_LENGTH) {
                HttpUtils.sendJson(exchange, 400, "{\"message\":\"Password is too long\"}");
                return;
            }

            Connection con = DatabaseConnection.getConnection();

            String query = """
                    SELECT
                        u.employee_id,
                        u.email,
                        u.role,
                        u.password_hash,
                        e.full_name,
                        e.department,
                        e.designation
                    FROM users u
                    JOIN employees e ON e.employee_id = u.employee_id
                    WHERE u.email = ? AND e.is_active = true
                    """;

            PreparedStatement ps = con.prepareStatement(query);
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();
            String response;

            if (rs.next()) {
                String storedHash = rs.getString("password_hash");
                if (storedHash != null && BCrypt.checkpw(password, storedHash)) {
                    JSONObject user = new JSONObject();
                    user.put("employee_id", rs.getString("employee_id"));
                    user.put("full_name", rs.getString("full_name"));
                    user.put("email", rs.getString("email"));
                    String role = rs.getString("role");
                    user.put("role", role);
                    user.put("department", rs.getString("department"));
                    user.put("designation", rs.getString("designation"));

                    String dashboardPath = dashboardPathForRole(role);
                    if (dashboardPath.isEmpty()) {
                        HttpUtils.sendJson(exchange, 403, "{\"message\":\"No dashboard is configured for this role\"}");
                        return;
                    }

                    JSONObject success = new JSONObject();
                    success.put("message", "Login successful");
                    success.put("user", user);
                    success.put("token", AuthUtils.issueToken(rs.getString("employee_id")));
                    success.put("dashboardPath", dashboardPath);

                    response = success.toString();
                    HttpUtils.sendJson(exchange, 200, response);
                } else {
                    response = "{\"message\":\"Invalid credentials\"}";
                    HttpUtils.sendJson(exchange, 401, response);
                }
            } else {
                response = "{\"message\":\"Invalid credentials\"}";
                HttpUtils.sendJson(exchange, 401, response);
            }

            rs.close();
            ps.close();
            con.close();

        } catch (Exception e) {
            e.printStackTrace();
            HttpUtils.sendJson(exchange, 500, "{\"message\":\"Login failed on server\"}");
        }
    }
}
