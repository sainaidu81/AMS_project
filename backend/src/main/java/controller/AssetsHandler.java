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
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

/**
 * Handles listing, creating, updating, and deleting asset records.
 */
public class AssetsHandler implements HttpHandler {
    private static final int MAX_SERVICE_TAG_LENGTH = 50;
    private static final int MAX_SHORT_LENGTH = 50;
    private static final int MAX_MEDIUM_LENGTH = 100;

    /**
     * Routes asset requests by HTTP method.
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
                listAssets(exchange);
                return;
            }

            if (method.equalsIgnoreCase("POST")) {
                createAsset(exchange);
                return;
            }

            if (method.equalsIgnoreCase("PUT")) {
                updateAsset(exchange);
                return;
            }

            if (method.equalsIgnoreCase("DELETE")) {
                deleteAsset(exchange);
                return;
            }

            HttpUtils.sendJson(exchange, 405, "{\"message\":\"Method not allowed\"}");
        } catch (SQLException e) {
            e.printStackTrace();
            HttpUtils.sendJson(exchange, 500, "{\"message\":\"Asset request failed on server\"}");
        } catch (IllegalArgumentException e) {
            HttpUtils.sendJson(exchange, 400, new JSONObject().put("message", e.getMessage()).toString());
        } catch (Exception e) {
            e.printStackTrace();
            HttpUtils.sendJson(exchange, 500, "{\"message\":\"Asset request failed on server\"}");
        }
    }

    private void listAssets(HttpExchange exchange) throws SQLException, IOException {
        String query = """
                SELECT
                    service_tag,
                    asset_type,
                    brand,
                    model,
                    serial_number,
                    manufactured_date,
                    ram,
                    storage_capacity,
                    operating_system,
                    status,
                    created_at,
                    updated_at
                FROM assets
                ORDER BY service_tag
                """;

        try (
                Connection con = DatabaseConnection.getConnection();
                PreparedStatement ps = con.prepareStatement(query);
                ResultSet rs = ps.executeQuery()
        ) {
            JSONArray assets = new JSONArray();

            while (rs.next()) {
                assets.put(assetFromResultSet(rs));
            }

            JSONObject response = new JSONObject();
            response.put("assets", assets);
            HttpUtils.sendJson(exchange, 200, response.toString());
        }
    }

    private void createAsset(HttpExchange exchange) throws SQLException, IOException {
        JSONObject json = new JSONObject(new String(exchange.getRequestBody().readAllBytes()));
        String serviceTag = requiredString(json, "service_tag", "Service tag", MAX_SERVICE_TAG_LENGTH);
        String assetType = requiredString(json, "asset_type", "Asset type", MAX_SHORT_LENGTH);
        String brand = requiredString(json, "brand", "Brand", MAX_MEDIUM_LENGTH);
        String model = requiredString(json, "model", "Model", MAX_MEDIUM_LENGTH);
        String serialNumber = requiredString(json, "serial_number", "Serial number", MAX_MEDIUM_LENGTH);
        Date manufacturedDate = optionalDate(json, "manufactured_date", "Manufacture date");
        String ram = optionalString(json, "ram", MAX_SHORT_LENGTH);
        String storageCapacity = optionalString(json, "storage_capacity", MAX_SHORT_LENGTH);
        String operatingSystem = optionalString(json, "operating_system", MAX_SHORT_LENGTH);
        String status = requiredStatus(json);

        String query = """
                INSERT INTO assets (
                    service_tag,
                    asset_type,
                    brand,
                    model,
                    serial_number,
                    manufactured_date,
                    ram,
                    storage_capacity,
                    operating_system,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                RETURNING
                    service_tag,
                    asset_type,
                    brand,
                    model,
                    serial_number,
                    manufactured_date,
                    ram,
                    storage_capacity,
                    operating_system,
                    status,
                    created_at,
                    updated_at
                """;

        try (
                Connection con = DatabaseConnection.getConnection();
                PreparedStatement ps = con.prepareStatement(query)
        ) {
            ps.setString(1, serviceTag);
            ps.setString(2, assetType);
            ps.setString(3, brand);
            ps.setString(4, model);
            ps.setString(5, serialNumber);
            setNullableDate(ps, 6, manufacturedDate);
            setNullableString(ps, 7, ram);
            setNullableString(ps, 8, storageCapacity);
            setNullableString(ps, 9, operatingSystem);
            ps.setString(10, status);

            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                JSONObject response = new JSONObject();
                response.put("message", "Asset added successfully");
                response.put("asset", assetFromResultSet(rs));
                HttpUtils.sendJson(exchange, 201, response.toString());
            }
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                HttpUtils.sendJson(exchange, 409, "{\"message\":\"Service tag or serial number already exists\"}");
                return;
            }

            throw e;
        }
    }

    private void updateAsset(HttpExchange exchange) throws SQLException, IOException {
        String serviceTag = pathId(exchange, "/assets/");
        JSONObject json = new JSONObject(new String(exchange.getRequestBody().readAllBytes()));
        String assetType = requiredString(json, "asset_type", "Asset type", MAX_SHORT_LENGTH);
        String brand = requiredString(json, "brand", "Brand", MAX_MEDIUM_LENGTH);
        String model = requiredString(json, "model", "Model", MAX_MEDIUM_LENGTH);
        String serialNumber = requiredString(json, "serial_number", "Serial number", MAX_MEDIUM_LENGTH);
        Date manufacturedDate = optionalDate(json, "manufactured_date", "Manufacture date");
        String ram = optionalString(json, "ram", MAX_SHORT_LENGTH);
        String storageCapacity = optionalString(json, "storage_capacity", MAX_SHORT_LENGTH);
        String operatingSystem = optionalString(json, "operating_system", MAX_SHORT_LENGTH);
        String status = requiredStatus(json);

        String query = """
                UPDATE assets
                SET
                    asset_type = ?,
                    brand = ?,
                    model = ?,
                    serial_number = ?,
                    manufactured_date = ?,
                    ram = ?,
                    storage_capacity = ?,
                    operating_system = ?,
                    status = ?
                WHERE service_tag = ?
                RETURNING
                    service_tag,
                    asset_type,
                    brand,
                    model,
                    serial_number,
                    manufactured_date,
                    ram,
                    storage_capacity,
                    operating_system,
                    status,
                    created_at,
                    updated_at
                """;

        try (
                Connection con = DatabaseConnection.getConnection();
                PreparedStatement ps = con.prepareStatement(query)
        ) {
            ps.setString(1, assetType);
            ps.setString(2, brand);
            ps.setString(3, model);
            ps.setString(4, serialNumber);
            setNullableDate(ps, 5, manufacturedDate);
            setNullableString(ps, 6, ram);
            setNullableString(ps, 7, storageCapacity);
            setNullableString(ps, 8, operatingSystem);
            ps.setString(9, status);
            ps.setString(10, serviceTag);

            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    HttpUtils.sendJson(exchange, 404, "{\"message\":\"Asset not found\"}");
                    return;
                }

                JSONObject response = new JSONObject();
                response.put("message", "Asset updated successfully");
                response.put("asset", assetFromResultSet(rs));
                HttpUtils.sendJson(exchange, 200, response.toString());
            }
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                HttpUtils.sendJson(exchange, 409, "{\"message\":\"Serial number already exists\"}");
                return;
            }

            throw e;
        }
    }

    private void deleteAsset(HttpExchange exchange) throws SQLException, IOException {
        String serviceTag = pathId(exchange, "/assets/");
        String query = "DELETE FROM assets WHERE service_tag = ?";

        try (
                Connection con = DatabaseConnection.getConnection();
                PreparedStatement ps = con.prepareStatement(query)
        ) {
            ps.setString(1, serviceTag);
            int deleted = ps.executeUpdate();

            if (deleted == 0) {
                HttpUtils.sendJson(exchange, 404, "{\"message\":\"Asset not found\"}");
                return;
            }

            HttpUtils.sendJson(exchange, 200, "{\"message\":\"Asset deleted successfully\"}");
        } catch (SQLException e) {
            if ("23503".equals(e.getSQLState())) {
                HttpUtils.sendJson(exchange, 409, "{\"message\":\"Cannot delete asset because it has assignment or history records\"}");
                return;
            }

            throw e;
        }
    }

    private static JSONObject assetFromResultSet(ResultSet rs) throws SQLException {
        JSONObject asset = new JSONObject();
        asset.put("service_tag", rs.getString("service_tag"));
        asset.put("asset_type", rs.getString("asset_type"));
        asset.put("brand", rs.getString("brand"));
        asset.put("model", rs.getString("model"));
        asset.put("serial_number", rs.getString("serial_number"));
        asset.put("manufactured_date", dateToString(rs.getDate("manufactured_date")));
        asset.put("ram", nullToEmpty(rs.getString("ram")));
        asset.put("storage_capacity", nullToEmpty(rs.getString("storage_capacity")));
        asset.put("operating_system", nullToEmpty(rs.getString("operating_system")));
        asset.put("status", rs.getString("status"));
        asset.put("created_at", timestampToString(rs.getTimestamp("created_at")));
        asset.put("updated_at", timestampToString(rs.getTimestamp("updated_at")));
        return asset;
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

    private static Date optionalDate(JSONObject json, String key, String label) {
        String value = json.optString(key, "").trim();

        if (value.isEmpty()) {
            return null;
        }

        try {
            return Date.valueOf(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(label + " must use YYYY-MM-DD format");
        }
    }

    private static String requiredStatus(JSONObject json) {
        String status = requiredString(json, "status", "Status", 20);

        if (
                !status.equals("available") &&
                !status.equals("assigned") &&
                !status.equals("maintenance") &&
                !status.equals("retired")
        ) {
            throw new IllegalArgumentException("Status must be available, assigned, maintenance, or retired");
        }

        return status;
    }

    private static void setNullableString(PreparedStatement ps, int index, String value) throws SQLException {
        if (value == null || value.isBlank()) {
            ps.setNull(index, java.sql.Types.VARCHAR);
            return;
        }

        ps.setString(index, value);
    }

    private static void setNullableDate(PreparedStatement ps, int index, Date value) throws SQLException {
        if (value == null) {
            ps.setNull(index, java.sql.Types.DATE);
            return;
        }

        ps.setDate(index, value);
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }

    private static String dateToString(Date date) {
        return date == null ? "" : date.toString();
    }

    private static String timestampToString(Timestamp timestamp) {
        return timestamp == null ? "" : timestamp.toString();
    }

    private static String pathId(HttpExchange exchange, String prefix) {
        String path = exchange.getRequestURI().getPath();

        if (!path.startsWith(prefix) || path.length() <= prefix.length()) {
            throw new IllegalArgumentException("Service tag is required in the path");
        }

        return URLDecoder.decode(path.substring(prefix.length()), StandardCharsets.UTF_8).trim();
    }
}
