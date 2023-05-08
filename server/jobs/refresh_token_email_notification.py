import requests
import boto3
import datetime
from server.jobs.jobs_config import AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY, SERVER_URI

# Define the endpoint URL
ENDPOINT_URL = f"{SERVER_URI}/api/get-expiring-airtable-refresh-tokens"

# Define the SES client
ses_client = boto3.client('ses', region_name=AWS_REGION, aws_access_key_id=AWS_ACCESS_KEY_ID, aws_secret_access_key=AWS_SECRET_ACCESS_KEY)

# Make the request to the endpoint
response = requests.get(ENDPOINT_URL)

# Parse the response data
data = response.json()

if __name__ == '__main__':
    # Iterate over the interviews and send the emails
    for interview_id, interview_data in test_data.items():
        email = interview_data['owner']['email']
        name = interview_data['interview']['name']
        expires = interview_data['interview']['refreshTokenExpires']
        expires_string = datetime.datetime.fromtimestamp(expires/1000).strftime('%B %d, %Y')

        subject = "Action required: Interview app"
        body = f"Your Airtable authentication for your Interview named: {name} will expire on {expires_string}. \n\nPlease sign into {SERVER_URI} and reconnect your Airtable connection in order to keep it active. Otherwise, your Interview may stop functioning as expected."

        print(subject)
        print(body)
        print([email])
        sender_email = 'no-reply@tsdataclinic.com'
        raw_email = {
            'Data': f"Subject: {subject} \n\n{body}\n"
        }
        response = ses_client.send_raw_email(Source=sender_email, Destinations=[email], RawMessage=raw_email)
        print(response)

