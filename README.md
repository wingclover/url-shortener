# URL Shortener Microservice

### To create NEW shortened url:

Pass your url as a parameter like this:

> https://elderly-roadway.glitch.me/new/https://www.google.com

> https://elderly-roadway.glitch.me/new/http://foo.com:80

Notice the /new/ in the pathname

You will receive a shortened URL in the JSON response like this:

> {"original_url":"https://glitch.com","short_url":"https://elderly-roadway.glitch.me/34516"}

### When you visit the shortened url:

> https://elderly-roadway.glitch.me/85176

It will redirect you to the original url, in this case it is https://www.google.com