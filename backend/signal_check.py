import os
import xml.etree.ElementTree as ET


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

NETWORK_FILE = os.path.join(
    BASE_DIR,
    "simulation",
    "network.net.xml"
)


def find_traffic_lights():

    if not os.path.exists(NETWORK_FILE):
        print("Network file not found:")
        print(NETWORK_FILE)
        return

    tree = ET.parse(NETWORK_FILE)
    root = tree.getroot()

    signals = root.findall(".//tlLogic")

    print()
    print("========================================")
    print("      URBANFLOW TRAFFIC SIGNAL CHECK")
    print("========================================")

    if not signals:
        print()
        print("No traffic signals found in the network.")
        print()
        return

    print()
    print(f"Traffic signals found: {len(signals)}")
    print()

    for signal in signals:

        signal_id = signal.get("id")
        program_id = signal.get("programID")
        signal_type = signal.get("type")

        print(f"Signal ID   : {signal_id}")
        print(f"Program ID  : {program_id}")
        print(f"Type        : {signal_type}")

        phases = signal.findall("phase")

        print(f"Phases      : {len(phases)}")

        for index, phase in enumerate(phases):

            duration = phase.get("duration")
            state = phase.get("state")

            print(
                f"  Phase {index + 1}: "
                f"{duration}s | {state}"
            )

        print("----------------------------------------")


if __name__ == "__main__":
    find_traffic_lights()