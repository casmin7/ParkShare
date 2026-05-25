import xml.etree.ElementTree as ET

tree = ET.parse('capabilities.xml')
root = tree.getroot()

# Find all FeatureType names
names = []
for elem in root.iter():
    if elem.tag.endswith('Name'):
        names.append(elem.text)

print("Found Names in capabilities.xml:")
for name in names:
    if 'parking' in name or 'parc' in name.lower() or 'Sector4' in name:
        print(f"  {name}")
