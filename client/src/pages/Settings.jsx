import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/userContext';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import SideBar from '../components/Sidebar';

const Settings = () => {
  const { currUser, setCurrUser } = useContext(UserContext);
  const [name, setName] = useState('');
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
    else {
      setName(currUser.name);
      setEmail(currUser.email);
    }
  }, [currUser, navigate]);

  const handleNameChange = (e) => setName(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleCurrentPasswordChange = (e) => setCurrentPassword(e.target.value);
  const handleNewPasswordChange = (e) => setNewPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);
  const handleProfilePictureChange = (e) => setProfilePicture(e.target.files[0]);

  const handleSaveChanges = async () => {
    if (!currentPassword) {
      setErrorMsg('Current password is required to make changes.');
      return;
    }

    try {
      const updateData = {
        currPassword: currentPassword
      };

      if (name !== currUser.name) updateData.name = name;
      if (email !== currUser.email) updateData.email = email;
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setErrorMsg('New passwords do not match.');
          return;
        }
        updateData.newPassword = newPassword;
        updateData.confirmNewPassword = confirmPassword;
      }

      const response = await axios.patch(
        `${process.env.REACT_APP_BASE_URL}/users/edituser`,
        updateData,
        { headers: { Authorization: `Bearer ${currUser.token}` } }
      );

      if (response.data.message === 'No fields to update') {
        setSuccessMsg('No changes were made.');
      } else {
        setCurrUser(response.data);
        setSuccessMsg('User information updated successfully.');
      }

      setErrorMsg('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Handle profile picture update if a new picture is selected
      if (profilePicture) {
        const formData = new FormData();
        formData.append('profilePicture', profilePicture);
        formData.append('currPassword', currentPassword);

        const pictureResponse = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/users/change-profile-picture`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${currUser.token}`,
            },
          }
        );

        setCurrUser(prevUser => ({ ...prevUser, profilePicture: pictureResponse.data.profilePicture }));
        setSuccessMsg(prevMsg => prevMsg + ' Profile picture updated successfully.');
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to save changes.');
      setSuccessMsg('');
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentPassword) {
      setErrorMsg('Current password is required to delete account.');
      return;
    }

    try {
      await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/users/delete`,
        { 
          headers: { Authorization: `Bearer ${currUser.token}` },
          data: { currPassword: currentPassword }
        }
      );

      setSuccessMsg('Account deleted successfully.');
      setErrorMsg('');
      setCurrUser(null);
      navigate('/login');
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to delete account.');
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
          <Form.Group as={Row} controlId="formName">
            <Form.Label column sm={2}>Name:</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Enter your name"
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="formEmail" className="my-3">
            <Form.Label column sm={2}>Email:</Form.Label>
            <Col sm={10}>
              <Form.Control
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
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