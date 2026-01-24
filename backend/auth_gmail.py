from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import pickle
import os

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def main():
    creds = None
    if os.path.exists('token.pickle'):
        print("Token already exists.")
        return
    
    flow = InstalledAppFlow.from_client_secrets_file(
        'client_secret_325861786392-ulbb7o1nvka8mt6r6vdl6oln78a124m3.apps.googleusercontent.com.json',
        SCOPES
    )
    creds = flow.run_local_server(port=0)
    
    with open('token.pickle', 'wb') as token:
        pickle.dump(creds, token)
    
    print("token.pickle created.")

if __name__ == '__main__':
    main()
