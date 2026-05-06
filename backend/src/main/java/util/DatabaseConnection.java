// This class belongs to the util package because it is shared backend helper code.
package util;

// Dotenv loads secrets and configuration values from the backend/.env file.
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import io.github.cdimascio.dotenv.Dotenv;

// DatabaseConnection centralizes all Supabase PostgreSQL connection settings.
public class DatabaseConnection {
    // Load environment variables from the .env file in the backend project folder.
    private static final Dotenv dotenv = Dotenv.load();

    // Supabase session pooler host.
    // The pooler is used instead of the direct DB host because it works better from local IPv4 networks.
    private static final String HOST = "aws-1-ap-northeast-1.pooler.supabase.com";

    // PostgreSQL listens on port 5432 by default.
    private static final String PORT = "5432";

    // Supabase's default database name is postgres.
    private static final String DATABASE = "postgres";

    // Pooler username copied from Supabase's connection string.
    private static final String USER = "postgres.ygjupwcersfyfunshulu";

    // Database password is read from backend/.env so it is not hard-coded into source code.
    private static final String PASSWORD = dotenv.get("SUPABASE_DB_PASSWORD");

    // JDBC connection URL for PostgreSQL.
    // sslmode=require is needed because Supabase requires SSL for database connections.
    private static final String URL =
            "jdbc:postgresql://" + HOST + ":" + PORT + "/" + DATABASE + "?sslmode=require";


    // Open and return a new database connection whenever a handler needs DB access.
    public static Connection getConnection() throws SQLException {
        // Fail early with a clear message if the .env password is missing.
        if (PASSWORD == null || PASSWORD.isBlank()) {
            throw new SQLException("SUPABASE_DB_PASSWORD is missing in .env");
        }

        // Load the PostgreSQL JDBC driver. [due to the error jdbc driver not found]
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("PostgreSQL JDBC driver not found", e);
        }

        // Create the actual JDBC connection using the URL, username, and password.
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
