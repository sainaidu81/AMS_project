import java.io.IOException;
import java.net.BindException;
import java.net.InetSocketAddress;

import com.sun.net.httpserver.HttpServer;

import controller.AssetsAssignmentsHandler;
import controller.AssetsHandler;
import controller.EmployeesHandler;
import controller.LoginHandler;
import controller.UsersHandler;

/**
 * Bootstraps the backend HTTP server and registers application routes.
 */
public class Main {

    /**
     * Starts the local HTTP server on a configured port.
     *
     * @param args command-line arguments supplied at startup
     */
    public static void main(String[] args) {
        int port = getServerPort();

        try {
            HttpServer server = createServerOnAvailablePort(port, 8085);
            server.createContext("/login", new LoginHandler());
            server.createContext("/employees", new EmployeesHandler());
            server.createContext("/users", new UsersHandler());
            server.createContext("/assets", new AssetsHandler());
            server.createContext("/asset_assignments", new AssetsAssignmentsHandler());
            server.createContext("/assets_assignements", new AssetsAssignmentsHandler());
            server.start();
            System.out.println("Server started on port " + server.getAddress().getPort());
        } catch (BindException ex) {
            System.err.println(ex.getMessage());
            System.err.println("Stop the application using that port or set the PORT environment variable to a different port.");
            System.exit(1);
        } catch (IOException ex) {
            ex.printStackTrace();
            System.exit(1);
        }
    }

    private static HttpServer createServerOnAvailablePort(int startPort, int maxPort) throws IOException {
        for (int currentPort = startPort; currentPort <= maxPort; currentPort++) {
            try {
                return HttpServer.create(new InetSocketAddress(currentPort), 0);
            } catch (BindException ex) {
                System.err.println("Port " + currentPort + " is busy, trying next port...");
            }
        }
        throw new BindException("Unable to find an available port between " + startPort + " and " + maxPort + ".");
    }

    private static int getServerPort() {
        String portValue = System.getenv("PORT");
        if (portValue != null && !portValue.isBlank()) {
            try {
                return Integer.parseInt(portValue);
            } catch (NumberFormatException ex) {
                System.err.println("Invalid PORT value: " + portValue + ". Falling back to default port 8081.");
            }
        }
        return 8081;
    }
}
