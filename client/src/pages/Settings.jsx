import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/userContext';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const Settings = () => {
  const { currUser } = useContext(UserContext);
  const [notifications, setNotifications] = useState({
    newMessage: true,
    groupInvite: true,
  });
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (currUser) {
      setEmail(currUser.email);
      setNotifications({
        newMessage: currUser.notifications?.newMessage || true,
        groupInvite: currUser.notifications?.groupInvite || true,
      });
    }
  }, [currUser]);

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications({ ...notifications, [name]: checked });
  };

  const handleEmailChange = (e) => setEmail(e.target.value);

  const handleSaveChanges = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/settings/notifications`,
        notifications,
        { headers: { Authorization: `Bearer ${currUser.token}` } }
      );

      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/user/email`,
        { newEmail: email },
        { headers: { Authorization: `Bearer ${currUser.token}` } }
      );

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
        `${process.env.REACT_APP_BASE_URL}/settings/delete-account`,
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

        <Form.Group as={Row} className="my-3">
          <Form.Label column sm={2}>Notification Preferences:</Form.Label>
          <Col sm={10}>
            <Form.Check
              type="checkbox"
              label="Notify for new messages"
              name="newMessage"
              checked={notifications.newMessage}
              onChange={handleNotificationChange}
            />
            <Form.Check
              type="checkbox"
              label="Notify for group invites"
              name="groupInvite"
              checked={notifications.groupInvite}
              onChange={handleNotificationChange}
            />
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
  );
};

export default Settings;
