package controller;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import org.mindrot.jbcrypt.BCrypt;
import org.json.JSONArray;
import org.json.JSONObject;
import util.AuthUtils;
import util.DatabaseConnection;
import util.HttpUtils;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

/**
 * Handles listing user records without exposing password hashes.
 */
public class UsersHandler implements HttpHandler {

    /**
     * Routes user requests by HTTP method.
     *
     * @param exchange the HTTP request/response exchange for the current request
     * @throws IOException if request or response IO fails
     */
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpUtils.handlePreflight(exchange)) {
            return;
        }

        String method = exchange.getRequestMethod();

        try {
            if (AuthUtils.requireAnyRole(exchange, "admin", "it_manager") == null) {
                return;
            }

            if (method.equalsIgnoreCase("GET")) {
                listUsers(exchange);
                return;
            }

            if (method.equalsIgnoreCase("POST")) {
                createUser(exchange);
                return;
            }

            if (method.equalsIgnoreCase("PUT")) {
                updateUser(exchange);
                return;
            }

            if (method.equalsIgnoreCase("DELETE")) {
                deleteUser(exchange);
                return;
            }

            HttpUtils.sendJson(exchange, 405, "{\"message\":\"Method not allowed\"}");
        } catch (SQLException e) {
            e.printStackTrace();
            HttpUtils.sendJson(exchange, 500, "{\"message\":\"User request failed on server\"}");
        } catch (IllegalArgumentException e) {
            HttpUtils.sendJson(exchange, 400, new JSONObject().put("message", e.getMessage()).toString());
        } catch (Exception e) {
            e.printStackTrace();
            HttpUtils.sendJson(exchange, 500, "{\"message\":\"User request failed on server\"}");
        }
    }

    private void listUsers(HttpExchange exchange) throws SQLException, IOException {
        String query = """
                SELECT
                    u.employee_id,
                    e.full_name,
                    u.email,
                    u.role,
                    u.created_at,
                    u.updated_at
                FROM users u
                LEFT JOIN employees e ON e.employee_id = u.employee_id
                ORDER BY u.employee_id
                """;

        try (
                Connection con = DatabaseConnection.getConnection();
                PreparedStatement ps = con.prepareStatement(query);
                ResultSet rs = ps.executeQuery()
        ) {
            JSONArray users = new JSONArray();

            while (rs.next()) {
                JSONObject user = new JSONObject();
                user.put("employee_id", rs.getString("employee_id"));
                user.put("full_name", nullToEmpty(rs.getString("full_name")));
                user.put("email", nullToEmpty(rs.getString("email")));
                user.put("role", rs.getString("role"));
                user.put("created_at", timestampToString(rs.getTimestamp("created_at")));
                user.put("updated_at", timestampToString(rs.getTimestamp("updated_at")));
                users.put(user);
            }

            JSONObject response = new JSONObject();
            response.put("users", users);
            HttpUtils.sendJson(exchange, 200, response.toString());
        }
    }

    private void createUser(HttpExchange exchange) throws SQLException, IOException {
        JSONObject json = new JSONObject(new String(exchange.getRequestBody().readAllBytes()));
        String employeeId = requiredString(json, "employee_id", "Employee ID", 50);
        String email = requiredString(json, "email", "Email", 150);
        String password = requiredString(json, "password", "Password", 128);
        String role = requiredString(json, "role", "Role", 20);

        if (!role.equals("admin") && !role.equals("it_manager") && !role.equals("employee")) {
            throw new IllegalArgumentException("Role must be admin, it_manager, or employee");
        }

        if (!activeEmployeeExists(employeeId)) {
            HttpUtils.sendJson(exchange, 404, "{\"message\":\"Active employee not found\"}");
            return;
        }

        String passwordHash = BCrypt.hashpw(password, BCrypt.gensalt());
        String query = """
                INSERT INTO users (employee_id, email, password_hash, role)
                VALUES (?, ?, ?, ?)
                RETURNING employee_id, email, role, created_at, updated_at
                """;

        try (
                Connection con = DatabaseConnection.getConnection();
                PreparedStatement ps = con.prepareStatement(query)
        ) {
            ps.setString(1, employeeId);
            ps.setString(2, email);
            ps.setString(3, passwordHash);
            ps.setString(4, role);

            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                JSONObject user = new JSONObject();
                user.put("employee_id", rs.getString("employee_id"));
                user.put("email", rs.getString("email"));
                user.put("role", rs.getString("role"));
                user.put("created_at", timestampToString(rs.getTimestamp("created_at")));
                user.put("updated_at", timestampToString(rs.getTimestamp("updated_at")));

                JSONObject response = new JSONObject();
                response.put("message", "User added successfully");
                response.put("user", user);
                HttpUtils.sendJson(exchange, 201, response.toString());
            }
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                HttpUtils.sendJson(exchange, 409, "{\"message\":\"User already exists for this employee or email\"}");
                return;
            }

            throw e;
        }
    }

    private void updateUser(HttpExchange exchange) throws SQLException, IOException {
        String employeeId = pathId(exchange, "/users/");
        JSONObject json = new JSONObject(new String(exchange.getRequestBody().readAllBytes()));
        String email = requiredString(json, "email", "Email", 150);
        String role = requiredString(json, "role", "Role", 20);

        if (!role.equals("admin") && !role.equals("it_manager") && !role.equals("employee")) {
            throw new IllegalArgumentException("Role must be admin, it_manager, or employee");
        }

        String query = """
                UPDATE users
                SET email = ?, role = ?
                WHERE employee_id = ?
                RETURNING employee_id, email, role, created_at, updated_at
                """;

        try (
                Connection con = DatabaseConnection.getConnection();
                PreparedStatement ps = con.prepareStatement(query)
        ) {
            ps.setString(1, email);
            ps.setString(2, role);
            ps.setString(3, employeeId);

            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    HttpUtils.sendJson(exchange, 404, "{\"message\":\"User not found\"}");
                    return;
                }

                JSONObject user = new JSONObject();
                user.put("employee_id", rs.getString("employee_id"));
                user.put("email", rs.getString("email"));
                user.put("role", rs.getString("role"));
                user.put("created_at", timestampToString(rs.getTimestamp("created_at")));
                user.put("updated_at", timestampToString(rs.getTimestamp("updated_at")));

                JSONObject response = new JSONObject();
                response.put("message", "User updated successfully");
                response.put("user", user);
                HttpUtils.sendJson(exchange, 200, response.toString());
            }
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                HttpUtils.sendJson(exchange, 409, "{\"message\":\"Email already exists\"}");
                return;
            }

            throw e;
        }
    }

    private void deleteUser(HttpExchange exchange) throws SQLException, IOException {
        String employeeId = pathId(exchange, "/users/");
        String query = "DELETE FROM users WHERE employee_id = ?";

        try (
                Connection con = DatabaseConnection.getConnection();
                PreparedStatement ps = con.prepareStatement(query)
        ) {
            ps.setString(1, employeeId);
            int deleted = ps.executeUpdate();

            if (deleted == 0) {
                HttpUtils.sendJson(exchange, 404, "{\"message\":\"User not found\"}");
                return;
            }

            HttpUtils.sendJson(exchange, 200, "{\"message\":\"User deleted successfully\"}");
        }
    }

    private static String requiredString(JSONObject json, String key, String label, int maxLength) {
        String value = json.optString(key, "").trim();

        if (value.isEmpty()) {
            throw new IllegalArgumentException(label + " is required");
        }

        if (value.length() > maxLength) {
            throw new IllegalArgumentException(label + " must be " + maxLength + " characters or fewer");
        }

        return value;
    }

    private boolean activeEmployeeExists(String employeeId) throws SQLException {
        String query = "SELECT 1 FROM employees WHERE employee_id = ? AND is_active = true";

        try (
                Connection con = DatabaseConnection.getConnection();
                PreparedStatement ps = con.prepareStatement(query)
        ) {
            ps.setString(1, employeeId);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    private static String pathId(HttpExchange exchange, String prefix) {
        String path = exchange.getRequestURI().getPath();

        if (!path.startsWith(prefix) || path.length() <= prefix.length()) {
            throw new IllegalArgumentException("Employee ID is required in the path");
        }

        return URLDecoder.decode(path.substring(prefix.length()), StandardCharsets.UTF_8).trim();
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private static String timestampToString(Timestamp timestamp) {
        return timestamp == null ? "" : timestamp.toString();
    }
}
