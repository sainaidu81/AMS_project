// Import useState so this component can store form input values while the user types.
import { useState } from "react";

// Import the API helper that sends login data to the Java backend.
import { loginUser } from "../services/api";

// Login is the page component shown at the default route "/".
export default function Login() {

  // Store the login form values in React state.
  const [form, setForm] = useState({
    // Email starts empty until the user types into the email input.
    email: "",

    // Password starts empty until the user types into the password input.
    password: ""
  });

  // Update the correct field in state whenever the user types in an input.
  const handleChange = (e) => {
    // Copy the current form values and replace only the field that changed.
    setForm({
      // Keep the existing values that did not change.
      ...form,

      // Use the input's name attribute to decide whether to update email or password.
      [e.target.name]: e.target.value
    });
  };

  // Handle the form submit event when the Login button is clicked.
  const handleSubmit = async (e) => {
    // Prevent the browser from refreshing the page after form submission.
    e.preventDefault();

    try {
      // Send the current email and password to the backend /login endpoint.
      const data = await loginUser(form);

      // Show the backend's response message to the user.
      alert(data.message);

    } catch (err) {
      // Show the backend error message when login fails.
      alert(err.message || "Error connecting to backend");
    }
  };

  // Return the JSX that renders the login page.
  return (
    // Outer wrapper for the login page content.
    <div>
      {/* Page heading shown above the login form. */}
      <h2>Login Page</h2>

      {/* Form calls handleSubmit when the user clicks Login or presses Enter. */}
      <form onSubmit={handleSubmit}>
        {/* Email input uses name="email" so handleChange updates form.email. */}
        <input name="email" placeholder="Email" onChange={handleChange} /><br /><br />

        {/* Password input uses type="password" so typed characters are hidden. */}
        <input name="password" type="password" placeholder="Password" onChange={handleChange} /><br /><br />

        {/* Submit button triggers the form's onSubmit handler. */}
        <button type="submit">Login</button>
      </form>

      {/* Basic navigation link that sends new users to the signup page. */}
      <p>
        {/* The href matches the /signup route defined in AppRoutes.jsx. */}
        Don't have an account? <a href="/signup">Signup</a>
      </p>
    </div>
  );
}
