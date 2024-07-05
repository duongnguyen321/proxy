# Proxy server

It used to call any thing with method: GET/POST/PUT/PATCH/DELETE,....

Without cors.

Can use by:

```bash
curl https://proxy.ndng.net/{YOUR_URL_PAGE_OR_API}

# https://proxy.ndng.net/ndng.net THIS IS HTML RETURNED
# https://proxy.ndng.net/ndng.net/api THIS IS JSON RETURNED
```

Of course, it can use in browser.

Have a query: `?disable=`

- **js|javascript** => disable js in web
- **css|style** => disable styling in web
- **img|image** => disable images in web

AND of course, it can multiple disable like: `?disable=js|css|img`
