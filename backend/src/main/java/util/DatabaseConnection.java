package util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import io.github.cdimascio.dotenv.Dotenv;

/**
 * Centralizes the JDBC configuration used to connect to the Supabase database.
 */
public class DatabaseConnection {
    private static final Dotenv dotenv = Dotenv.load();

    /**
     * Supabase session pooler host used by the backend.
     */
    private static final String HOST = "aws-1-ap-northeast-1.pooler.supabase.com";

    private static final String PORT = "5432";

    private static final String DATABASE = "postgres";

    private static final String USER = "postgres.ygjupwcersfyfunshulu";

    private static final String PASSWORD = dotenv.get("SUPABASE_DB_PASSWORD");

    private static final String URL =
            "jdbc:postgresql://" + HOST + ":" + PORT + "/" + DATABASE + "?sslmode=require";


    /**
     * Opens a new JDBC connection using the configured Supabase credentials.
     *
     * @return a live PostgreSQL connection
     * @throws SQLException if configuration is missing or the connection cannot be opened
     */
    public static Connection getConnection() throws SQLException {
        if (PASSWORD == null || PASSWORD.isBlank()) {
            throw new SQLException("SUPABASE_DB_PASSWORD is missing in .env");
        }

        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("PostgreSQL JDBC driver not found", e);
        }

        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
