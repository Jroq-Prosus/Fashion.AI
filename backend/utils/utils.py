def translate_url(url):
    # Add an extra slash after 'product-images' if not present
    url = url.replace('product-images/', 'product-images//')
    # Encode spaces as %20
    url = url.replace(' ', '%20')
    return url