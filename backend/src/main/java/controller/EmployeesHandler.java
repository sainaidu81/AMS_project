package controller;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import org.json.JSONArray;
import org.json.JSONObject;
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
 * Handles listing and creating employee records.
 */
public class EmployeesHandler implements HttpHandler {
    private static final int MAX_EMPLOYEE_ID_LENGTH = 50;
    private static final int MAX_NAME_LENGTH = 100;
    private static final int MAX_MOBILE_LENGTH = 20;

    /**
     * Routes employee requests by HTTP method.
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
            if (method.equalsIgnoreCase("GET")) {
                listEmployees(exchange);
                return;
            }

            if (method.equalsIgnoreCase("POST")) {
                createEmployee(exchange);
                return;
            }

            if (method.equalsIgnoreCase("PUT")) {
                updateEmployee(exchange);
                return;
            }

            if (method.equalsIgnoreCase("DELETE")) {
                deactivateEmployee(exchange);
                return;
            }

            HttpUtils.sendJson(exchange, 405, "{\"message\":\"Method not allowed\"}");
        } catch (SQLException e) {
            e.printStackTrace();
            HttpUtils.sendJson(exchange, 500, "{\"message\":\"Employee request failed on server\"}");
        } catch (IllegalArgumentException e) {
            HttpUtils.sendJson(exchange, 400, new JSONObject().put("message", e.getMessage()).toString());
        } catch (Exception e) {
            e.printStackTrace();
            HttpUtils.sendJson(exchange, 500, "{\"message\":\"Employee request failed on server\"}");
        }
    }

    private void listEmployees(HttpExchange exchange) throws SQLException, IOException {
        String query = """
                SELECT
                    employee_id,
                    full_name,
                    department,
                    designation,
                    mobile_number,
                    address,
                    is_active,
                    created_at,
                    updated_at
                FROM employees
                ORDER BY employee_id
                """;

        try (
                Connection con = DatabaseConnection.getConnection();
                PreparedStatement ps = con.prepareStatement(query);
                ResultSet rs = ps.executeQuery()
        ) {
            JSONArray employees = new JSONArray();

            while (rs.next()) {
                employees.put(employeeFromResultSet(rs));
            }

            JSONObject response = new JSONObject();
            response.put("employees", employees);
            HttpUtils.sendJson(exchange, 200, response.toString());
        }
    }

    private void createEmployee(HttpExchange exchange) throws SQLException, IOException {
        String body = new String(exchange.getRequestBody().readAllBytes());
        JSONObject json = new JSONObject(body);

        String employeeId = requiredString(json, "employee_id", "Employee ID", MAX_EMPLOYEE_ID_LENGTH);
        String fullName = requiredString(json, "full_name", "Full name", MAX_NAME_LENGTH);
        String department = requiredString(json, "department", "Department", MAX_NAME_LENGTH);
        String designation = requiredString(json, "designation", "Designation", MAX_NAME_LENGTH);
        String mobileNumber = optionalString(json, "mobile_number", MAX_MOBILE_LENGTH);
        String address = optionalString(json, "address", 1000);
        boolean isActive = json.optBoolean("is_active", true);

        String query = """
                INSERT INTO employees (
                    employee_id,
                    full_name,
                    department,
                    designation,
                    mobile_number,
                    address,
                    is_active
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                RETURNING
                    employee_id,
                    full_name,
                    department,
                    designation,
                    mobile_number,
                    address,
                    is_active,
                    created_at,
                    updated_at
                """;

        try (
                Connection con = DatabaseConnection.getConnection();
                PreparedStatement ps = con.prepareStatement(query)
        ) {
            ps.setString(1, employeeId);
            ps.setString(2, fullName);
            ps.setString(3, department);
            ps.setString(4, designation);
            setNullableString(ps, 5, mobileNumber);
            setNullableString(ps, 6, address);
            ps.setBoolean(7, isActive);

            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                JSONObject response = new JSONObject();
                response.put("message", "Employee added successfully");
                response.put("employee", employeeFromResultSet(rs));
                HttpUtils.sendJson(exchange, 201, response.toString());
            }
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                HttpUtils.sendJson(exchange, 409, "{\"message\":\"Employee ID already exists\"}");
                return;
            }

            throw e;
        }
    }

    private void updateEmployee(HttpExchange exchange) throws SQLException, IOException {
        String employeeId = pathId(exchange, "/employees/");
        JSONObject json = new JSONObject(new String(exchange.getRequestBody().readAllBytes()));
        String fullName = requiredString(json, "full_name", "Full name", MAX_NAME_LENGTH);
        String department = requiredString(json, "department", "Department", MAX_NAME_LENGTH);
        String designation = requiredString(json, "designation", "Designation", MAX_NAME_LENGTH);
        String mobileNumber = optionalString(json, "mobile_number", MAX_MOBILE_LENGTH);
        String address = optionalString(json, "address", 1000);
        boolean isActive = json.optBoolean("is_active", true);

        String query = """
                UPDATE employees
                SET
                    full_name = ?,
                    department = ?,
                    designation = ?,
                    mobile_number = ?,
                    address = ?,
                    is_active = ?
                WHERE employee_id = ?
                RETURNING
                    employee_id,
                    full_name,
                    department,
                    designation,
                    mobile_number,
                    address,
                    is_active,
                    created_at,
                    updated_at
                """;

        try (
                Connection con = DatabaseConnection.getConnection();
                PreparedStatement ps = con.prepareStatement(query)
        ) {
            ps.setString(1, fullName);
            ps.setString(2, department);
            ps.setString(3, designation);
            setNullableString(ps, 4, mobileNumber);
            setNullableString(ps, 5, address);
            ps.setBoolean(6, isActive);
            ps.setString(7, employeeId);

            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    HttpUtils.sendJson(exchange, 404, "{\"message\":\"Employee not found\"}");
                    return;
                }

                JSONObject response = new JSONObject();
                response.put("message", "Employee updated successfully");
                response.put("employee", employeeFromResultSet(rs));
                HttpUtils.sendJson(exchange, 200, response.toString());
            }
        }
    }

    private void deactivateEmployee(HttpExchange exchange) throws SQLException, IOException {
        String employeeId = pathId(exchange, "/employees/");

        try (Connection con = DatabaseConnection.getConnection()) {
            con.setAutoCommit(false);

            try (
                    PreparedStatement deleteUser = con.prepareStatement("DELETE FROM users WHERE employee_id = ?");
                    PreparedStatement updateEmployee = con.prepareStatement("""
                            UPDATE employees
                            SET is_active = false
                            WHERE employee_id = ?
                            """)
            ) {
                deleteUser.setString(1, employeeId);
                deleteUser.executeUpdate();

                updateEmployee.setString(1, employeeId);
                int updated = updateEmployee.executeUpdate();

                if (updated == 0) {
                    con.rollback();
                    HttpUtils.sendJson(exchange, 404, "{\"message\":\"Employee not found\"}");
                    return;
                }

                con.commit();
                HttpUtils.sendJson(exchange, 200, "{\"message\":\"Employee deactivated and credentials removed\"}");
            } catch (SQLException e) {
                con.rollback();
                throw e;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    private static JSONObject employeeFromResultSet(ResultSet rs) throws SQLException {
        JSONObject employee = new JSONObject();
        employee.put("employee_id", rs.getString("employee_id"));
        employee.put("full_name", rs.getString("full_name"));
        employee.put("department", rs.getString("department"));
        employee.put("designation", rs.getString("designation"));
        employee.put("mobile_number", nullToEmpty(rs.getString("mobile_number")));
        employee.put("address", nullToEmpty(rs.getString("address")));
        employee.put("is_active", rs.getBoolean("is_active"));
        employee.put("created_at", timestampToString(rs.getTimestamp("created_at")));
        employee.put("updated_at", timestampToString(rs.getTimestamp("updated_at")));
        return employee;
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

    private static String optionalString(JSONObject json, String key, int maxLength) {
        String value = json.optString(key, "").trim();

        if (value.length() > maxLength) {
            throw new IllegalArgumentException(key + " must be " + maxLength + " characters or fewer");
        }

        return value;
    }

    private static void setNullableString(PreparedStatement ps, int index, String value) throws SQLException {
        if (value == null || value.isBlank()) {
            ps.setNull(index, java.sql.Types.VARCHAR);
            return;
        }

        ps.setString(index, value);
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private static String timestampToString(Timestamp timestamp) {
        return timestamp == null ? "" : timestamp.toString();
    }

    private static String pathId(HttpExchange exchange, String prefix) {
        String path = exchange.getRequestURI().getPath();

        if (!path.startsWith(prefix) || path.length() <= prefix.length()) {
            throw new IllegalArgumentException("Employee ID is required in the path");
        }

        return URLDecoder.decode(path.substring(prefix.length()), StandardCharsets.UTF_8).trim();
    }
}
