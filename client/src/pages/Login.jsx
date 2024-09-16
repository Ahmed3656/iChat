import React, { useState, useContext } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { Link,useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';

const Login = () => 
  {
  const [input, setInput] = useState({ identifier: '', password: '' });
  const [error, setError] = useState(null);
  const { setCurrUser } = useContext(UserContext);

  const navigate = useNavigate();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    const UserData={identifier:input.identifier,
      password:input.password
    }
      try {
        const res = await fetch(`${process.env.REACT_APP_BASE_URL}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(UserData),
        });
    
        const data = await res.json();
        if (res.ok) {
          console.log(data);
          setCurrUser(data); // Save token
          console.log('Login successful');
          navigate('/chats')
          
        } else {
          setError(data.msg); // Handle error
          
        }
      } catch (err) {
        console.error('Error logging in', err);
      }
    };


  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Row>
        <Col md={12}>
          <h2 className="text-center mb-4">Login</h2>
          {error && <p className="text-danger">{error}</p>}
          <Form onSubmit={handleSubmit}>
            {/* Input for Email/Phone */}
            <Form.Group controlId="formIdentifier" className="mb-3">
              <Form.Label>Email or Phone</Form.Label>
              <Form.Control
                type="text"
                name="identifier"
                placeholder="Enter email or phone number"
                value={input.identifier}
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

            {/* Submit Button */}
            <Button variant="primary" type="submit" className="w-100">
              Login
            </Button>
          </Form>

          {/* Link to the Register Page */}
          <div className="text-center mt-3">
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
