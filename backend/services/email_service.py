"""Email service for sending notifications."""

import base64
from email.mime.text import MIMEText
from googleapiclient.discovery import build
import pickle
from google_auth_oauthlib.flow import InstalledAppFlow
import os


SCOPES = ['https://www.googleapis.com/auth/gmail.send']


class EmailService:
    """Service for sending emails via Gmail API."""

    @staticmethod
    def gmail_authenticate():
        """Authenticate with Gmail API."""
        creds = None
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token:
                creds = pickle.load(token)
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'client_secret_325861786392-ulbb7o1nvka8mt6r6vdl6oln78a124m3.apps.googleusercontent.com.json',
                SCOPES
            )
            creds = flow.run_local_server(port=0)
            with open('token.pickle', 'wb') as token:
                pickle.dump(creds, token)
        return creds

    @staticmethod
    def send_reset_email(to_email, reset_link):
        """
        Send password reset email.
        
        Args:
            to_email (str): Recipient email address.
            reset_link (str): Password reset link.
            
        Returns:
            dict: Result dictionary with success status and message.
        """
        try:
            creds = EmailService.gmail_authenticate()
            service = build('gmail', 'v1', credentials=creds)
            message = MIMEText(f'Click the link to reset your password: {reset_link}')
            message['to'] = to_email
            message['subject'] = 'Reset Your Password'
            raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
            service.users().messages().send(userId="me", body={"raw": raw}).execute()
            return {'success': True, 'message': 'Email sent successfully'}
        except Exception as e:
            return {'success': False, 'message': str(e)}
