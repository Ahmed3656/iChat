import React, { useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';  // for redirecting
import axios from 'axios';  // you can use fetch if you prefer

const Register = () => {
  const [input, setInput] = useState({ name: '', email: '', phone: '', password: '', profilePicture: null });
  const [error, setError] = useState(null);
  const navigate = useNavigate();  // for redirecting after registration

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setInput((prev) => ({
      ...prev,
      profilePicture: e.target.files[0],  // Store the file object
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Perform basic validation (you can extend this)
    if (!input.email && !input.phone) {
      setError('Please enter an email or phone number.');
      return;
    }

    // Create a FormData object
    const formData = new FormData();
    formData.append('name', input.name);
    formData.append('email', input.email);
    formData.append('phone', input.phone);
    formData.append('password', input.password);
    if (input.profilePicture) {
      formData.append('profilePicture', input.profilePicture);  // Append the file
    }

    try {
      // Send POST request to the register endpoint
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/users/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',  // Set the content type for file uploads
        },
      });

      // Redirect to login or another page
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Row>
        <Col md={12}>
          <h2 className="text-center mb-4">Register</h2>
          {error && <p className="text-danger">{error}</p>}
          <Form onSubmit={handleSubmit}>
            {/* Input for Name */}
            <Form.Group controlId="formName" className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                placeholder="Enter your name"
                value={input.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            {/* Input for Email */}
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                value={input.email}
                onChange={handleInputChange}
              />
            </Form.Group>

            {/* Input for Phone */}
            <Form.Group controlId="formPhone" className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={input.phone}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            {/* Input for Password */}
            <Form.Group controlId="formPassword" className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password"
                value={input.password}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            {/* Input for Profile Picture */}
            <Form.Group controlId="formProfilePicture" className="mb-3">
              <Form.Label>Profile Picture</Form.Label>
              <Form.Control
                type="file"
                name="profilePicture"
                onChange={handleFileChange}  // Handle file input change
              />
            </Form.Group>

            {/* Submit Button */}
            <Button variant="primary" type="submit" className="w-100">
              Register
            </Button>
          </Form>

          {/* Link to Login Page */}
          <div className="text-center mt-3">
            <p>Already have an account? <Link to="/login">Login here</Link></p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;