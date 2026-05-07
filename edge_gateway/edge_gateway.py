import paho.mqtt.client as mqtt
import ssl
import json

# --- AWS EC2 mTLS Configuration ---
AWS_BROKER = "51.20.131.161"
AWS_PORT = 8883
AWS_USER = "sensor_node"
AWS_PASS = "bachelorproject2026"

# File paths to the certificates you copied to the Pi
CA_CERTS = "/home/pi/certs/ca.crt"
CERTFILE = "/home/pi/certs/arduino_client.crt"
KEYFILE = "/home/pi/certs/arduino_client.key"

# --- Local Raspberry Pi Configuration ---
LOCAL_BROKER = "127.0.0.1" # The Pi talks to its own internal broker
LOCAL_PORT = 1883

# ---------------------------------------------------------
# Callback: When the AWS connection succeeds
def on_aws_connect(client, userdata, flags, rc):
    if rc == 0:
        print("[AWS] Successfully connected to EC2 with mTLS!")
    else:
        print(f"[AWS] Failed to connect, return code {rc}")

# Callback: When the local Pi broker receives data from an Arduino
def on_local_message(client, userdata, msg):
    try:
        # Decode the JSON payload from the Arduino
        payload = msg.payload.decode("utf-8")
        data = json.loads(payload)
        sensor_id = data.get("sensor_id", "unknown")
        
        print(f"[LOCAL] Received data from Sensor {sensor_id}: {payload}")
        
        # Determine the correct AWS topic
        aws_topic = f"bachelor-project/sensors/{sensor_id}"
        
        # Forward the exact same payload securely to AWS
        print(f"[GATEWAY] Encrypting and forwarding to AWS topic: {aws_topic}...")
        aws_client.publish(aws_topic, payload)
        
    except Exception as e:
        print(f"[ERROR] Failed to process message: {e}")

# ---------------------------------------------------------
# 1. Setup the Secure AWS Client
aws_client = mqtt.Client("PiEdgeGateway")
aws_client.username_pw_set(AWS_USER, AWS_PASS)

# Configure the mTLS context
aws_client.tls_set(ca_certs=CA_CERTS,
                   certfile=CERTFILE,
                   keyfile=KEYFILE,
                   tls_version=ssl.PROTOCOL_TLSv1_2)

# Tell it not to check the EC2 server's hostname against the certificate (since you use an IP)
aws_client.tls_insecure_set(True) 
aws_client.on_connect = on_aws_connect

# Connect to AWS
print("[AWS] Attempting secure connection to EC2...")
aws_client.connect(AWS_BROKER, AWS_PORT, 60)
aws_client.loop_start() # Run AWS network loop in the background

# ---------------------------------------------------------
# 2. Setup the Local Listening Client
local_client = mqtt.Client("LocalListener")
local_client.on_message = on_local_message

print("[LOCAL] Connecting to internal Pi broker...")
local_client.connect(LOCAL_BROKER, LOCAL_PORT, 60)

# Subscribe to any topic starting with "local/sensors/"
local_client.subscribe("local/sensors/#")

print("[SYSTEM] Edge Gateway is active and listening...")
# Run the local network loop forever
local_client.loop_forever()