// Import Java's lightweight built-in HTTP server class.
import com.sun.net.httpserver.HttpServer;
// Import the handler class that processes /login API requests.
import controller.LoginHandler;
// Import the class used to bind the server to a host/port combination.
import java.net.InetSocketAddress;

// Main is the entry point class for the backend application.
public class Main {

    // Java starts running the backend from this main method.
    public static void main(String[] args) throws Exception {

        // Create an HTTP server that listens on local port 8081.
        // The second argument is the backlog size; 0 means Java uses the default.
        HttpServer server = HttpServer.create(new InetSocketAddress(8081), 0);

        // Connect the /login URL path to LoginHandler.
        // Any POST request to http://localhost:8081/login is handled there.
        server.createContext("/login", new LoginHandler());

        // Start accepting incoming HTTP requests.
        server.start();

        // Print a confirmation message in the IntelliJ run console.
        System.out.println("Server started on port 8081");
    }
}
