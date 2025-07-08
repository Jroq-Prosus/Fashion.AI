import requests

def translate_url(url):
    # Add an extra slash after 'product-images' if not present
    url = url.replace('product-images/', 'product-images//')
    # Encode spaces as %20
    url = url.replace(' ', '%20')
    return url


def reverse_geocode(latlon_str):
    """
    Accepts a string in the format 'lat,lon', parses it, and returns (city, country) using Nominatim reverse geocoding.
    """
    try:
        lat, lon = map(float, latlon_str.split(","))
    except Exception as e:
        print(f"Invalid lat,lon string: {latlon_str}")
        return "", ""
    url = f"https://nominatim.openstreetmap.org/reverse"
    params = {
        "lat": lat,
        "lon": lon,
        "format": "json",
        "zoom": 10,  # city-level
        "addressdetails": 1
    }
    headers = {
        "User-Agent": "FashionAI/1.0"
    }
    resp = requests.get(url, params=params, headers=headers)
    resp.raise_for_status()
    data = resp.json()
    address = data.get("address", {})
    city = address.get("city") or address.get("town") or address.get("village") or address.get("hamlet") or ""
    country = address.get("country", "")
    return city, country