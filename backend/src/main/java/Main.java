import com.sun.net.httpserver.HttpServer;
import controller.LoginHandler;
import java.net.InetSocketAddress;

/**
 * Bootstraps the backend HTTP server and registers application routes.
 */
public class Main {

    /**
     * Starts the local HTTP server on port 8081.
     *
     * @param args command-line arguments supplied at startup
     * @throws Exception if the HTTP server cannot be created or started
     */
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8081), 0);
        server.createContext("/login", new LoginHandler());
        server.start();
        System.out.println("Server started on port 8081");
    }
}
