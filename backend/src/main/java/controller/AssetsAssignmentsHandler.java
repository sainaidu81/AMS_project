package controller;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import org.json.JSONArray;
import org.json.JSONObject;
import util.AuthUtils;
import util.DatabaseConnection;
import util.HttpUtils;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Locale;

/**
 * Handles listing, creating, updating, and deleting asset assignment records.
 */
public class AssetsAssignmentsHandler implements HttpHandler {
    private static final int MAX_SERVICE_TAG_LENGTH = 50;
    private static final int MAX_EMPLOYEE_ID_LENGTH = 50;
    private static final int MAX_HOST_NAME_LENGTH = 150;

    /**
     * Routes asset assignment requests by HTTP method.
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
            if (AuthUtils.requireAnyRole(exchange, "admin") == null) {
                return;
            }

            if (method.equalsIgnoreCase("GET")) {
                listAssignments(exchange);
                return;
            }

            if (method.equalsIgnoreCase("POST")) {
                createAssignment(exchange);
                return;
            }

            if (method.equalsIgnoreCase("PUT")) {
                updateAssignment(exchange);
                return;
            }

            if (method.equalsIgnoreCase("DELETE")) {
                deleteAssignment(exchange);
                return;
            }

            HttpUtils.sendJson(exchange, 405, "{\"message\":\"Method not allowed\"}");
        } catch (SQLException e) {
            e.printStackTrace();
            HttpUtils.sendJson(exchange, 500, "{\"message\":\"Asset assignment request failed on server\"}");
        } catch (IllegalArgumentException e) {
            HttpUtils.sendJson(exchange, 400, new JSONObject().put("message", e.getMessage()).toString());
        } catch (Exception e) {
            e.printStackTrace();
            HttpUtils.sendJson(exchange, 500, "{\"message\":\"Asset assignment request failed on server\"}");
        }
    }

    private void listAssignments(HttpExchange exchange) throws SQLException, IOException {
        String query = """
                SELECT
                    id,
                    service_tag,
                    employee_id,
                    issued_by_emp_id,
                    issued_date,
                    host_name,
                    return_date,
                    return_by_emp_id,
                    asset_condition,
                    issue_found,
                    issue_comment
                FROM asset_assignments
                ORDER BY id
                """;

        try (
                Connection con = DatabaseConnection.getConnection();
                PreparedStatement ps = con.prepareStatement(query);
                ResultSet rs = ps.executeQuery()
        ) {
            JSONArray assignments = new JSONArray();

            while (rs.next()) {
                assignments.put(assignmentFromResultSet(rs));
            }

            JSONObject response = new JSONObject();
            response.put("asset_assignments", assignments);
            HttpUtils.sendJson(exchange, 200, response.toString());
        }
    }

    private void createAssignment(HttpExchange exchange) throws SQLException, IOException {
        JSONObject json = new JSONObject(new String(exchange.getRequestBody().readAllBytes()));
        AssignmentInput input = assignmentInput(json);

        try (Connection con = DatabaseConnection.getConnection()) {
            String hostName = generateHostName(con, input.serviceTag(), input.employeeId());
            String query = """
                    INSERT INTO asset_assignments (
                        service_tag,
                        employee_id,
                        issued_by_emp_id,
                        issued_date,
                        host_name,
                        return_date,
                        return_by_emp_id,
                        asset_condition,
                        issue_found,
                        issue_comment
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    RETURNING
                        id,
                        service_tag,
                        employee_id,
                        issued_by_emp_id,
                        issued_date,
                        host_name,
                        return_date,
                        return_by_emp_id,
                        asset_condition,
                        issue_found,
                        issue_comment
                    """;

            try (PreparedStatement ps = con.prepareStatement(query)) {
                setAssignmentParams(ps, input, hostName);

                try (ResultSet rs = ps.executeQuery()) {
                    rs.next();
                    JSONObject response = new JSONObject();
                    response.put("message", "Asset assignment added successfully");
                    response.put("asset_assignment", assignmentFromResultSet(rs));
                    HttpUtils.sendJson(exchange, 201, response.toString());
                }
            }
        } catch (SQLException e) {
            if ("23503".equals(e.getSQLState())) {
                HttpUtils.sendJson(exchange, 409, "{\"message\":\"Service tag or employee reference does not exist\"}");
                return;
            }

            throw e;
        }
    }

    private void updateAssignment(HttpExchange exchange) throws SQLException, IOException {
        int id = pathId(exchange);
        JSONObject json = new JSONObject(new String(exchange.getRequestBody().readAllBytes()));
        AssignmentInput input = assignmentInput(json);

        try (Connection con = DatabaseConnection.getConnection()) {
            String hostName = generateHostName(con, input.serviceTag(), input.employeeId());
            String query = """
                    UPDATE asset_assignments
                    SET
                        service_tag = ?,
                        employee_id = ?,
                        issued_by_emp_id = ?,
                        issued_date = ?,
                        host_name = ?,
                        return_date = ?,
                        return_by_emp_id = ?,
                        asset_condition = ?,
                        issue_found = ?,
                        issue_comment = ?
                    WHERE id = ?
                    RETURNING
                        id,
                        service_tag,
                        employee_id,
                        issued_by_emp_id,
                        issued_date,
                        host_name,
                        return_date,
                        return_by_emp_id,
                        asset_condition,
                        issue_found,
                        issue_comment
                    """;

            try (PreparedStatement ps = con.prepareStatement(query)) {
                setAssignmentParams(ps, input, hostName);
                ps.setInt(11, id);

                try (ResultSet rs = ps.executeQuery()) {
                    if (!rs.next()) {
                        HttpUtils.sendJson(exchange, 404, "{\"message\":\"Asset assignment not found\"}");
                        return;
                    }

                    JSONObject response = new JSONObject();
                    response.put("message", "Asset assignment updated successfully");
                    response.put("asset_assignment", assignmentFromResultSet(rs));
                    HttpUtils.sendJson(exchange, 200, response.toString());
                }
            }
        } catch (SQLException e) {
            if ("23503".equals(e.getSQLState())) {
                HttpUtils.sendJson(exchange, 409, "{\"message\":\"Service tag or employee reference does not exist\"}");
                return;
            }

            throw e;
        }
    }

    private void deleteAssignment(HttpExchange exchange) throws SQLException, IOException {
        int id = pathId(exchange);
        String query = "DELETE FROM asset_assignments WHERE id = ?";

        try (
                Connection con = DatabaseConnection.getConnection();
                PreparedStatement ps = con.prepareStatement(query)
        ) {
            ps.setInt(1, id);
            int deleted = ps.executeUpdate();

            if (deleted == 0) {
                HttpUtils.sendJson(exchange, 404, "{\"message\":\"Asset assignment not found\"}");
                return;
            }

            HttpUtils.sendJson(exchange, 200, "{\"message\":\"Asset assignment deleted successfully\"}");
        }
    }

    private static AssignmentInput assignmentInput(JSONObject json) {
        return new AssignmentInput(
                requiredString(json, "service_tag", "Service tag", MAX_SERVICE_TAG_LENGTH),
                requiredString(json, "employee_id", "Employee ID", MAX_EMPLOYEE_ID_LENGTH),
                optionalString(json, "issued_by_emp_id", MAX_EMPLOYEE_ID_LENGTH),
                optionalTimestamp(json, "issued_date", "Issue date"),
                optionalTimestamp(json, "return_date", "Return date"),
                optionalString(json, "return_by_emp_id", MAX_EMPLOYEE_ID_LENGTH),
                optionalString(json, "asset_condition", 2000),
                optionalBoolean(json, "issue_found"),
                optionalString(json, "issue_comment", 2000)
        );
    }

    private static void setAssignmentParams(PreparedStatement ps, AssignmentInput input, String hostName)
            throws SQLException {
        ps.setString(1, input.serviceTag());
        ps.setString(2, input.employeeId());
        setNullableString(ps, 3, input.issuedByEmpId());
        setNullableTimestamp(ps, 4, input.issuedDate());
        ps.setString(5, hostName);
        setNullableTimestamp(ps, 6, input.returnDate());
        setNullableString(ps, 7, input.returnByEmpId());
        setNullableString(ps, 8, input.assetCondition());
        setNullableBoolean(ps, 9, input.issueFound());
        setNullableString(ps, 10, input.issueComment());
    }

    private static String generateHostName(Connection con, String serviceTag, String employeeId)
            throws SQLException {
        String query = """
                SELECT
                    a.asset_type,
                    a.manufactured_date,
                    e.designation
                FROM assets a
                CROSS JOIN employees e
                WHERE a.service_tag = ? AND e.employee_id = ?
                """;

        try (PreparedStatement ps = con.prepareStatement(query)) {
            ps.setString(1, serviceTag);
            ps.setString(2, employeeId);

            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    throw new IllegalArgumentException("Service tag or employee does not exist");
                }

                Date manufacturedDate = rs.getDate("manufactured_date");

                if (manufacturedDate == null) {
                    throw new IllegalArgumentException("Asset manufacture date is required to generate host name");
                }

                String assetType = hostPart(rs.getString("asset_type"), "-");
                String designation = hostPart(rs.getString("designation"), "_");
                String year = String.valueOf(manufacturedDate.toLocalDate().getYear());
                String serviceTagSuffix = serviceTag.length() <= 4
                        ? serviceTag.toUpperCase(Locale.ROOT)
                        : serviceTag.substring(serviceTag.length() - 4).toUpperCase(Locale.ROOT);
                String hostName = "INFO-" + assetType + "-HYD-" + designation + "-" + year + "-" + serviceTagSuffix;

                if (hostName.length() > MAX_HOST_NAME_LENGTH) {
                    throw new IllegalArgumentException("Generated host name is too long");
                }

                return hostName;
            }
        }
    }

    private static String hostPart(String value, String separator) {
        return value == null
                ? ""
                : value.trim()
                        .toUpperCase(Locale.ROOT)
                        .replaceAll("[^A-Z0-9]+", separator)
                        .replaceAll("^" + separator + "+|" + separator + "+$", "");
    }

    private static JSONObject assignmentFromResultSet(ResultSet rs) throws SQLException {
        JSONObject assignment = new JSONObject();
        assignment.put("id", rs.getInt("id"));
        assignment.put("service_tag", rs.getString("service_tag"));
        assignment.put("employee_id", rs.getString("employee_id"));
        assignment.put("issued_by_emp_id", nullToEmpty(rs.getString("issued_by_emp_id")));
        assignment.put("issued_date", timestampToString(rs.getTimestamp("issued_date")));
        assignment.put("host_name", nullToEmpty(rs.getString("host_name")));
        assignment.put("return_date", timestampToString(rs.getTimestamp("return_date")));
        assignment.put("return_by_emp_id", nullToEmpty(rs.getString("return_by_emp_id")));
        assignment.put("asset_condition", nullToEmpty(rs.getString("asset_condition")));
        assignment.put("issue_found", rs.getObject("issue_found") == null ? JSONObject.NULL : rs.getBoolean("issue_found"));
        assignment.put("issue_comment", nullToEmpty(rs.getString("issue_comment")));
        return assignment;
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

    private static Boolean optionalBoolean(JSONObject json, String key) {
        if (!json.has(key) || json.isNull(key) || json.optString(key, "").isBlank()) {
            return null;
        }

        return json.optBoolean(key);
    }

    private static Timestamp optionalTimestamp(JSONObject json, String key, String label) {
        String value = json.optString(key, "").trim();

        if (value.isEmpty()) {
            return null;
        }

        try {
            if (value.length() == 10) {
                return Timestamp.valueOf(value + " 00:00:00");
            }

            return Timestamp.valueOf(LocalDateTime.parse(value.replace(" ", "T")));
        } catch (IllegalArgumentException | DateTimeParseException e) {
            throw new IllegalArgumentException(label + " must use YYYY-MM-DD or YYYY-MM-DDTHH:mm format");
        }
    }

    private static void setNullableString(PreparedStatement ps, int index, String value) throws SQLException {
        if (value == null || value.isBlank()) {
            ps.setNull(index, java.sql.Types.VARCHAR);
            return;
        }

        ps.setString(index, value);
    }

    private static void setNullableTimestamp(PreparedStatement ps, int index, Timestamp value) throws SQLException {
        if (value == null) {
            ps.setNull(index, java.sql.Types.TIMESTAMP);
            return;
        }

        ps.setTimestamp(index, value);
    }

    private static void setNullableBoolean(PreparedStatement ps, int index, Boolean value) throws SQLException {
        if (value == null) {
            ps.setNull(index, java.sql.Types.BOOLEAN);
            return;
        }

        ps.setBoolean(index, value);
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private static String timestampToString(Timestamp timestamp) {
        return timestamp == null ? "" : timestamp.toString();
    }

    private static int pathId(HttpExchange exchange) {
        String path = exchange.getRequestURI().getPath();
        String prefix = path.startsWith("/assets_assignements/")
                ? "/assets_assignements/"
                : "/asset_assignments/";

        if (!path.startsWith(prefix) || path.length() <= prefix.length()) {
            throw new IllegalArgumentException("Asset assignment ID is required in the path");
        }

        String value = URLDecoder.decode(path.substring(prefix.length()), StandardCharsets.UTF_8).trim();

        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Asset assignment ID must be a number");
        }
    }

    private record AssignmentInput(
            String serviceTag,
            String employeeId,
            String issuedByEmpId,
            Timestamp issuedDate,
            Timestamp returnDate,
            String returnByEmpId,
            String assetCondition,
            Boolean issueFound,
            String issueComment
    ) {
    }
}
