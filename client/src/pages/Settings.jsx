import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/userContext';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideBar from '../components/Sidebar';

const Settings = () => {
  const { currUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (!currUser) navigate('/login');
  }, []);

  useEffect(() => {
    if (currUser) {
      setEmail(currUser.email);
    }
  }, [currUser]);

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleCurrentPasswordChange = (e) => setCurrentPassword(e.target.value);
  const handleNewPasswordChange = (e) => setNewPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);
  const handleProfilePictureChange = (e) => setProfilePicture(e.target.files[0]);

  const handleSaveChanges = async () => {
    try {
      // Update email
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/user/email`,
        { newEmail: email },
        { headers: { Authorization: `Bearer ${currUser.token}` } }
      );

      // Update password
      if (newPassword === confirmPassword) {
        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/user/password`,
          { currentPassword, newPassword },
          { headers: { Authorization: `Bearer ${currUser.token}` } }
        );
      } else {
        setErrorMsg('New password and confirmation do not match.');
        return;
      }

      // Update profile picture
      if (profilePicture) {
        const formData = new FormData();
        formData.append('profilePicture', profilePicture);

        await axios.put(
          `${process.env.REACT_APP_BASE_URL}/user/profile-picture`,
          formData,
          { headers: { Authorization: `Bearer ${currUser.token}` } }
        );
      }

      setSuccessMsg('Changes saved successfully.');
      setErrorMsg('');
    } catch (error) {
      setErrorMsg('Failed to save changes: ' + error.message);
      setSuccessMsg('');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/users/delete`,
        { headers: { Authorization: `Bearer ${currUser.token}` } }
      );

      setSuccessMsg('Account deleted successfully.');
      setErrorMsg('');
      // Optionally, redirect the user after account deletion
    } catch (error) {
      setErrorMsg('Failed to delete account: ' + error.message);
      setSuccessMsg('');
    }
  };

  return (
    <div className="d-flex">
      <SideBar />
      <Container className="my-4">
        <h2>Settings</h2>

        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}

        <Form>
          <Form.Group as={Row} controlId="formEmail">
            <Form.Label column sm={2}>Email:</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your new email"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="formCurrentPassword" className="my-3">
            <Form.Label column sm={2}>Current Password:</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="password"
                value={currentPassword}
                onChange={handleCurrentPasswordChange}
                placeholder="Enter your current password"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="formNewPassword" className="my-3">
            <Form.Label column sm={2}>New Password:</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={handleNewPasswordChange}
                placeholder="Enter your new password"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="formConfirmPassword" className="my-3">
            <Form.Label column sm={2}>Confirm Password:</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirm your new password"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="formProfilePicture" className="my-3">
            <Form.Label column sm={2}>Profile Picture:</Form.Label>
            <Col sm={10}>
              <Form.Control type="file" onChange={handleProfilePictureChange} />
            </Col>
          </Form.Group>

          <Row className="my-3">
            <Col>
              <Button variant="primary" onClick={handleSaveChanges}>
                Save Changes
              </Button>
            </Col>
          </Row>
        </Form>

        <Button variant="danger" onClick={handleDeleteAccount} className="mt-3">
          Delete Account
        </Button>
      </Container>
    </div>
  );
};

export default Settings;
