import requests
import json
# Constants
HOST = "https://admin.qenergy.ai"
LOGIN_ENDPOINT = "/api/auth/login/"
# SITE_ENDPOINT = "/api/site/consumption/profile/2025-01-01/2025-12-31"
# SITE_ENDPOINT = "/api/environment/co2/intensity/2025-05-06T02:00:00.000+07:00/2025-05-06T09:00:00.000+07:00"
# SITE_ENDPOINT="/api/site/712/carbon_emission_detail/2025"
SITE_ENDPOINT="/api/site/712/cost_consumption_summary"
# SITE_ENDPOINT="/api/site/712/consumption/profile/2025-05-15/2025-05-16?resolution=hour"
SITE_ENDPOINT="api/site/all/overview_by_date/2025-05-15/2025-05-15"
# ${HOST}/api/site/${siteId}/consumption/hourly/${date}
#SITE_ENDPOINT = "/api/site/708/consumption/profile/2025-01-04/2025-01-05"

# Step 1: Login and get access token
def get_access_token():
    login_url = f"{HOST}{LOGIN_ENDPOINT}"
    payload = {
        "role": 0,
        "password": "Qbots2022",
        "email": "eiu@qenergy.ai"
    }
    headers = {
        "Content-Type": "application/json"
    }

    response = requests.post(login_url, json=payload, headers=headers)
    if response.status_code == 200:
        data = response.json()
        return data.get("access_token")
    else:
        print("Login Failed:", response.status_code, response.text)
        return None

# Step 2: Fetch site data
def fetch_site_data(access_token):
    site_url = f"{HOST}{SITE_ENDPOINT}"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    response = requests.get(site_url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print("Error:", response.status_code, response.text)
        return None

# Main program
def main():
    # Get the access token
    access_token = get_access_token()

    

    if access_token:
        print("Access Token retrieved successfully.")
        # Fetch site data using the token
        site_data = fetch_site_data(access_token)
        if site_data:
            # print("Site Data:", site_data)
            #print("Live Power:", site_data.get("live_power"))
            print(json.dumps(site_data, indent=2))  # ← In ra có khoảng cách
        else:
            print("Failed to retrieve site data.")
    else:
        print("Unable to authenticate.")

if __name__ == "__main__":
    main()
