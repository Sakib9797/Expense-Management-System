import base64
from email.mime.text import MIMEText
from googleapiclient.discovery import build
import pickle

def send_reset_email(to_email, reset_link):
    with open('token.pickle', 'rb') as token:
        creds = pickle.load(token)

    service = build('gmail', 'v1', credentials=creds)

    message = MIMEText(f'Click the link to reset your password: {reset_link}')
    message['to'] = to_email
    message['subject'] = 'Reset Your Password'
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    
    service.users().messages().send(userId="me", body={"raw": raw}).execute()
