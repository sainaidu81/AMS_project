package util;

import io.github.cdimascio.dotenv.Dotenv;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
    private static final Dotenv dotenv = Dotenv.load();

    private static final String HOST = "db.ygjupwcersfyfunshulu.supabase.co";
    private static final String PORT = "5432";
    private static final String DATABASE = "postgres";
    private static final String USER = "postgres";
    private static final String PASSWORD = dotenv.get("SUPABASE_DB_PASSWORD");

    private static final String URL =
            "jdbc:postgresql://" + HOST + ":" + PORT + "/" + DATABASE + "?sslmode=require";

    public static Connection getConnection() throws SQLException {
        if (PASSWORD == null || PASSWORD.isBlank()) {
            throw new SQLException("SUPABASE_DB_PASSWORD is missing in .env");
        }

        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
