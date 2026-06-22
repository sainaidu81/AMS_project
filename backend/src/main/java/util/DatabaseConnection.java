package util;

import java.sql.Connection;
import java.sql.SQLException;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
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

    private static HikariDataSource dataSource;

    /**
     * Creates a small connection pool for the Supabase pooler.
     *
     * @return the configured Hikari data source
     */
    private static HikariDataSource createDataSource() throws SQLException {
        if (PASSWORD == null || PASSWORD.isBlank()) {
            throw new SQLException("SUPABASE_DB_PASSWORD is missing in .env");
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(URL);
        config.setDriverClassName("org.postgresql.Driver");
        config.setUsername(USER);
        config.setPassword(PASSWORD);
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.setConnectionTimeout(10_000);
        config.setIdleTimeout(300_000);
        config.setMaxLifetime(1_800_000);
        config.setPoolName("ams-supabase-pool");

        return new HikariDataSource(config);
    }

    private static synchronized HikariDataSource getDataSource() throws SQLException {
        if (dataSource == null) {
            try {
                dataSource = createDataSource();
                Runtime.getRuntime().addShutdownHook(new Thread(DatabaseConnection::closePool));
            } catch (RuntimeException e) {
                throw new SQLException("Could not initialize database connection pool", e);
            }
        }

        return dataSource;
    }

    /**
     * Borrows a pooled JDBC connection using the configured Supabase credentials.
     *
     * @return a live PostgreSQL connection
     * @throws SQLException if a connection cannot be borrowed
     */
    public static Connection getConnection() throws SQLException {
        return getDataSource().getConnection();
    }

    /**
     * Closes the connection pool when the application is shutting down.
     */
    public static void closePool() {
        if (dataSource != null) {
            dataSource.close();
        }
    }
}
