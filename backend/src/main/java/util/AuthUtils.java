package util;

import com.sun.net.httpserver.HttpExchange;
import io.github.cdimascio.dotenv.Dotenv;
import org.json.JSONObject;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashSet;
import java.util.Set;

/**
 * Issues and verifies signed bearer tokens for backend API requests.
 */
public final class AuthUtils {
    private static final Dotenv DOTENV = Dotenv.load();
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final long TOKEN_TTL_SECONDS = 8 * 60 * 60;

    private AuthUtils() {
    }

    /**
     * Authenticated user details loaded from the database after token verification.
     *
     * @param employeeId employee identifier from the users table
     * @param email user email from the users table
     * @param role current role from the users table
     * @param fullName matching employee full name
     */
    public record AuthenticatedUser(String employeeId, String email, String role, String fullName) {
    }

    /**
     * Creates a compact signed token for the authenticated employee.
     *
     * @param employeeId employee id to store as the token subject
     * @return signed bearer token
     */
    public static String issueToken(String employeeId) {
        long issuedAt = Instant.now().getEpochSecond();
        long expiresAt = issuedAt + TOKEN_TTL_SECONDS;

        JSONObject header = new JSONObject()
                .put("alg", "HS256")
                .put("typ", "JWT");
        JSONObject payload = new JSONObject()
                .put("sub", employeeId)
                .put("iat", issuedAt)
                .put("exp", expiresAt);

        String unsignedToken = base64Url(header.toString().getBytes(StandardCharsets.UTF_8))
                + "."
                + base64Url(payload.toString().getBytes(StandardCharsets.UTF_8));

        return unsignedToken + "." + sign(unsignedToken);
    }

    /**
     * Verifies the bearer token and confirms the user still has an allowed role.
     *
     * @param exchange active HTTP exchange
     * @param allowedRoles roles permitted to access the current endpoint
     * @return current authenticated user, or {@code null} when a response was already sent
     * @throws IOException if the response cannot be written
     * @throws SQLException if the current user cannot be checked in the database
     */
    public static AuthenticatedUser requireAnyRole(HttpExchange exchange, String... allowedRoles)
            throws IOException, SQLException {
        String token = bearerToken(exchange);

        if (token == null) {
            HttpUtils.sendJson(exchange, 401, "{\"message\":\"Authentication token is required\"}");
            return null;
        }

        String employeeId = verifyToken(token);

        if (employeeId == null) {
            HttpUtils.sendJson(exchange, 401, "{\"message\":\"Invalid or expired authentication token\"}");
            return null;
        }

        AuthenticatedUser user = loadCurrentUser(employeeId);

        if (user == null) {
            HttpUtils.sendJson(exchange, 401, "{\"message\":\"Authenticated user is no longer active\"}");
            return null;
        }

        Set<String> permitted = new HashSet<>(Arrays.asList(allowedRoles));

        if (!permitted.contains(user.role())) {
            HttpUtils.sendJson(exchange, 403, "{\"message\":\"You do not have permission to access this resource\"}");
            return null;
        }

        return user;
    }

    private static String bearerToken(HttpExchange exchange) {
        String authorization = exchange.getRequestHeaders().getFirst("Authorization");

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return null;
        }

        String token = authorization.substring("Bearer ".length()).trim();
        return token.isEmpty() ? null : token;
    }

    private static String verifyToken(String token) {
        String[] parts = token.split("\\.");

        if (parts.length != 3) {
            return null;
        }

        String unsignedToken = parts[0] + "." + parts[1];
        String expectedSignature = sign(unsignedToken);

        if (!MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                parts[2].getBytes(StandardCharsets.UTF_8)
        )) {
            return null;
        }

        try {
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            JSONObject payload = new JSONObject(payloadJson);
            long expiresAt = payload.getLong("exp");

            if (expiresAt <= Instant.now().getEpochSecond()) {
                return null;
            }

            String employeeId = payload.optString("sub", "").trim();
            return employeeId.isEmpty() ? null : employeeId;
        } catch (Exception e) {
            return null;
        }
    }

    private static AuthenticatedUser loadCurrentUser(String employeeId) throws SQLException {
        String query = """
                SELECT
                    u.employee_id,
                    u.email,
                    u.role,
                    e.full_name
                FROM users u
                JOIN employees e ON e.employee_id = u.employee_id
                WHERE u.employee_id = ? AND e.is_active = true
                """;

        try (
                Connection con = DatabaseConnection.getConnection();
                PreparedStatement ps = con.prepareStatement(query)
        ) {
            ps.setString(1, employeeId);

            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }

                return new AuthenticatedUser(
                        rs.getString("employee_id"),
                        rs.getString("email"),
                        rs.getString("role"),
                        rs.getString("full_name")
                );
            }
        }
    }

    private static String sign(String value) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(tokenSecret().getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            return base64Url(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Could not sign authentication token", e);
        }
    }

    private static String tokenSecret() {
        String configuredSecret = DOTENV.get("AMS_TOKEN_SECRET");

        if (configuredSecret != null && !configuredSecret.isBlank()) {
            return configuredSecret;
        }

        String databasePassword = DOTENV.get("SUPABASE_DB_PASSWORD");

        if (databasePassword != null && !databasePassword.isBlank()) {
            return databasePassword;
        }

        throw new IllegalStateException("AMS_TOKEN_SECRET or SUPABASE_DB_PASSWORD is required for token signing");
    }

    private static String base64Url(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
