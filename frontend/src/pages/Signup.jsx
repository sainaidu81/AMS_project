// Import useState so this component can store signup form input values.
import { useState } from "react";

// Import the API helper that sends registration data to the Java backend.
import { registerUser } from "../services/api";

// Signup is the page component shown at the "/signup" route.
export default function Signup() {

  // Store the signup form values in React state.
  const [form, setForm] = useState({
    // Employee ID must already exist in the employees table in Supabase.
    employee_id: "",

    // Email starts empty until the user types into the email input.
    email: "",

    // Password starts empty until the user types into the password input.
    password: ""
  });

  // Update the correct form field whenever the user types.
  const handleChange = (e) => {
    // Copy the existing form object and replace only the changed field.
    setForm({
      // Keep the values of the fields that did not change.
      ...form,

      // Use the input's name attribute to update employee_id, email, or password.
      [e.target.name]: e.target.value
    });
  };

  // Handle the signup form submit event.
  const handleSubmit = async (e) => {
    // Prevent the browser's default page refresh on form submission.
    e.preventDefault();

    try {
      // Send the signup data to the backend /register endpoint.
      const data = await registerUser(form);

      // Show the backend success message, such as "User registered successfully".
      alert(data.message);

    } catch (err) {
      // Show the backend error message if registration fails.
      alert(err.message || "Error connecting to backend");
    }
  };

  // Return the JSX that renders the signup page.
  return (
    // Outer wrapper for the signup page content.
    <div>
      {/* Page heading shown above the signup form. */}
      <h2>Signup Page</h2>

      {/* Form calls handleSubmit when Register is clicked or Enter is pressed. */}
      <form onSubmit={handleSubmit}>
        {/* Employee ID input must match an existing employees.employee_id row. */}
        <input name="employee_id" placeholder="Employee ID" onChange={handleChange} /><br /><br />

        {/* Email input becomes users.email in the database. */}
        <input name="email" placeholder="Email" onChange={handleChange} /><br /><br />

        {/* Password input becomes users.password_hash in the database for now. */}
        <input name="password" type="password" placeholder="Password" onChange={handleChange} /><br /><br />

        {/* Submit button triggers the form's onSubmit handler. */}
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
