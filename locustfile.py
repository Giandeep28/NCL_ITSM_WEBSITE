import random
from locust import HttpUser, task, between

class NclItsmLoadTester(HttpUser):
    # Simulate users waiting between 1 to 5 seconds between tasks
    wait_time = between(1, 5)

    def on_start(self):
        """Executed when a simulated user starts, logging in to obtain a JWT."""
        # We will use random employee IDs from 90000000 to 90015000 to simulate the 15,000 employees
        self.eis_number = f"900{random.randint(10000, 25000)}"
        self.username = f"user_{self.eis_number}"
        
        # Prepare headers
        self.headers = {"Content-Type": "application/json"}
        
        # Simulate Authentication Login
        login_payload = {
            "usernameOrEmployeeId": "admin", # Fallback to admin in sandbox, or self.eis_number
            "password": "password"
        }
        
        try:
            with self.client.post("/api/v1/auth/login", json=login_payload, headers=self.headers, catch_response=True) as response:
                if response.status_code == 200:
                    data = response.json()
                    access_token = data.get("accessToken")
                    self.headers["Authorization"] = f"Bearer {access_token}"
                    response.success()
                else:
                    response.failure(f"Login failed with status {response.status_code}")
        except Exception as e:
            pass

    @task(5)
    def view_dashboard_tickets(self):
        """Simulate loading the ticket directory (heavily optimized batch lookup)."""
        self.client.get("/api/v1/tickets", headers=self.headers)

    @task(3)
    def view_user_profile(self):
        """Simulate loading the user profile panel."""
        self.client.get("/api/v1/users/profile", headers=self.headers)

    @task(2)
    def view_hardware_assets(self):
        """Simulate loading the hardware asset registry."""
        self.client.get("/api/v1/assets/hardware", headers=self.headers)

    @task(1)
    def create_support_ticket(self):
        """Simulate a user creating a new ticket (triggers non-blocking background auto-assignment)."""
        ticket_payload = {
            "category": "Hardware",
            "subCategory": "Laptop",
            "impactLevel": random.choice(["Low", "Medium", "High", "Critical"]),
            "summary": "High Load Testing Ticket " + str(random.randint(1000, 9999)),
            "description": "Simulated request under concurrent load spike.",
            "serialNumber": "SN-" + str(random.randint(100000, 999999)),
            "location": "HQ Block A Floor " + str(random.randint(1, 5))
        }
        self.client.post("/api/v1/tickets", json=ticket_payload, headers=self.headers)
