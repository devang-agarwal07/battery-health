"""
╔═══════════════════════════════════════════════════════════════╗
║  VoltGuard — Serial-to-Firebase Real-Time Data Bridge        ║
║  Reads Arduino sensor data via COM3 and pushes to Firebase   ║
╚═══════════════════════════════════════════════════════════════╝

Requirements:
    pip install pyserial firebase-admin

Before running:
    1. Go to Firebase Console → Project Settings → Service Accounts
    2. Click "Generate New Private Key" → save the JSON file
    3. Place that JSON file in THIS folder and rename it to:
       serviceAccountKey.json
    4. Update FIREBASE_DB_URL below with YOUR database URL
"""

import serial
import time
import re
import json
import os
from datetime import datetime

import firebase_admin
from firebase_admin import credentials, db

# ═══════════════════════════════════════════════════════════
# CONFIGURATION — Update these values for YOUR setup
# ═══════════════════════════════════════════════════════════
SERIAL_PORT = "COM3"          # Change to your Arduino's COM port
BAUD_RATE = 9600              # Must match Arduino's Serial.begin()
FIREBASE_DB_URL = "https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com/"  # ← REPLACE THIS
SERVICE_ACCOUNT_KEY = os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")

# SoH Calculation Constants (mirrors the dashboard algorithm)
Voc = 3.62       # Nominal Open Circuit Voltage (V)
R_NEW = 0.2      # Ideal internal resistance for a new cell (Ohms)
R_MAX = 2.5      # Maximum failed internal resistance threshold (Ohms)


def calculate_soh(voltage, current_mA, temperature):
    """
    Calculates State of Health — identical logic to the React dashboard
    so that the phone view shows the same SoH as the laptop.
    """
    current_A = current_mA / 1000.0

    # Internal resistance
    R_measured = abs(Voc - voltage) / current_A if current_A > 0 else 0

    # Base resistance health
    base_soh = (1 - ((R_measured - R_NEW) / (R_MAX - R_NEW))) * 100
    base_soh = max(0, min(100, base_soh))

    # Thermal stress penalty
    temp_penalty = 0
    if temperature > 35:
        import math
        temp_penalty = math.ceil((temperature - 35) / 10) * 10

    # Final SoH
    final_soh = max(0, round(base_soh - temp_penalty))

    return final_soh, R_measured, base_soh, temp_penalty


def init_firebase():
    """Initialize the Firebase Admin SDK."""
    if not os.path.exists(SERVICE_ACCOUNT_KEY):
        print("═" * 60)
        print("  ERROR: serviceAccountKey.json not found!")
        print()
        print("  Steps to fix:")
        print("  1. Go to https://console.firebase.google.com")
        print("  2. Select your project")
        print("  3. Project Settings → Service Accounts")
        print("  4. Click 'Generate New Private Key'")
        print("  5. Save the file as 'serviceAccountKey.json'")
        print(f"     in: {os.path.dirname(__file__)}")
        print("═" * 60)
        raise FileNotFoundError("serviceAccountKey.json is missing")

    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
    firebase_admin.initialize_app(cred, {
        "databaseURL": FIREBASE_DB_URL
    })
    print("✅ Firebase initialized successfully")


def push_to_firebase(voltage, current, temperature, soh, system_off=False):
    """Push a single reading to Firebase Realtime Database."""
    timestamp = datetime.now().isoformat()

    data = {
        "voltage": round(voltage, 2),
        "current": round(current, 2),
        "temperature": round(temperature, 1),
        "soh": soh,
        "power": round(voltage * current, 1),  # mW
        "systemOff": system_off,
        "timestamp": timestamp,
    }

    # Update the 'latest' node (overwritten each time — your dashboard listens here)
    ref = db.reference("battery/latest")
    ref.set(data)

    # Also append to a 'history' log (limited to last 100 entries)
    history_ref = db.reference("battery/history")
    history_ref.push(data)

    # Trim history to last 100 entries
    snapshot = history_ref.order_by_key().get()
    if snapshot and len(snapshot) > 100:
        keys = list(snapshot.keys())
        for old_key in keys[:-100]:
            history_ref.child(old_key).delete()

    return data


def main():
    """Main loop: read serial → parse → push to Firebase."""
    print()
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║   VoltGuard — Serial-to-Firebase Data Bridge             ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print()

    # Step 1: Initialize Firebase
    init_firebase()

    # Step 2: Open serial port
    print(f"🔌 Connecting to {SERIAL_PORT} at {BAUD_RATE} baud...")
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=2)
        time.sleep(2)  # Wait for Arduino to reset
        print(f"✅ Serial port {SERIAL_PORT} opened successfully")
    except serial.SerialException as e:
        print(f"❌ Could not open {SERIAL_PORT}: {e}")
        print("   → Make sure Arduino is plugged in and the correct COM port is set")
        print("   → Close Arduino Serial Monitor if it's open (it locks the port)")
        return

    print()
    print("📡 Listening for Arduino data... (Ctrl+C to stop)")
    print("─" * 55)

    # Temporary storage for a single reading block
    voltage = None
    current = None
    temperature = None

    try:
        while True:
            line = ser.readline().decode("utf-8", errors="ignore").strip()

            if not line:
                continue

            # Handle SYSTEM OFF state
            if "SYSTEM OFF" in line:
                push_to_firebase(0, 0, 0, 0, system_off=True)
                print(f"⏸  SYSTEM OFF — switch is open")
                continue

            # Parse the labeled format from code.ino
            v_match = re.match(r"Voltage:\s*([\d.]+)", line)
            i_match = re.match(r"Current:\s*([\d.]+)", line)
            t_match = re.match(r"Temperature:\s*([\d.]+)", line)

            if v_match:
                voltage = float(v_match.group(1))
            elif i_match:
                current = float(i_match.group(1))
            elif t_match:
                temperature = float(t_match.group(1))
            elif line.startswith("---"):
                # End-of-block marker → we have a complete reading
                if voltage is not None and current is not None and temperature is not None:
                    soh, r_int, base, penalty = calculate_soh(voltage, current, temperature)
                    data = push_to_firebase(voltage, current, temperature, soh)

                    print(
                        f"⚡ V={data['voltage']}V  "
                        f"I={data['current']}mA  "
                        f"T={data['temperature']}°C  "
                        f"SoH={data['soh']}%  "
                        f"P={data['power']}mW  "
                        f"→ Firebase ✓"
                    )

                # Reset for next block
                voltage = None
                current = None
                temperature = None

    except KeyboardInterrupt:
        print()
        print("─" * 55)
        print("🛑 Bridge stopped by user")
    finally:
        ser.close()
        print("🔌 Serial port closed")


if __name__ == "__main__":
    main()
