When we use various applications and websites, three essential security steps are continuously at play:

+   Identity 
    
+   Authentication
    
+   Authorization
    

The diagram below shows where these methods apply in a typical website architecture and their meanings.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fced6562d-3be6-4dd4-a141-fed9e6b02182_1600x1226.png)



In this 2-part series, we dive into different authentication methods, including passwords, sessions, cookies, tokens, JWTs (JSON Web Tokens), SSO (Single Sign-On), and OAuth2. We discuss the problems each method solves and how to choose the right authentication method for our needs.

## Password Authentication

Password authentication is a fundamental and widely used mechanism for verifying a user's identity on websites and applications. In this method, users enter their unique username and password combination to gain access to protected resources. The entered credentials are checked against stored user information in the system, and if they match, the user is granted access.

While password authentication is a foundational method for user verification, it has some limitations. Users may forget their passwords, and managing unique usernames and passwords for multiple websites can be challenging. Furthermore, password-based systems can be vulnerable to attacks, such as brute-force or dictionary attacks, if proper security measures aren't in place.

To address these issues, modern systems often implement additional security measures, such as multi-factor authentication, or use other authentication mechanisms (e.g., session-cookie or token-based authentication) to complement or replace password-based authentication for subsequent access to protected resources.

In this section, we will cover password-based authentication first to understand its history and how it functions.

## HTTP Basic Access Authentication

HTTP basic access authentication requires a web browser to provide a username and a password when requesting a protected resource. The credentials are encoded using the Base64 algorithm and included in the HTTP header field *Authorization: Basic*.

Here's how it typically works:

1.  The client sends a request to access a protected resource on the server.
    
2.  If the client has not yet provided any authentication credentials, the server responds with a 401 Unauthorized status code and includes the WWW-Authenticate: Basic header to indicate that it requires basic authentication.
    
3.  The client then prompts the user to enter their username and password, which are combined into a single string in the format username:password.
    
4.  The combined string is Base64 encoded and included in the "Authorization: Basic" header in the subsequent request to the server, e.g., Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=.
    
5.  Upon receiving the request, the server decodes the Base64-encoded credentials and separates the username and password. The server then checks the provided credentials against its user database or authentication service.
    
6.  If the credentials match, the server grants access to the requested resource. If not, the server responds with a 401 Unauthorized status code.
    

HTTP Basic Access Authentication has limitations. The username and password, encoded using Base64, can be easily decoded. Most websites use TLS (Transport Layer Security) to encrypt data between the browser and server, improving security. However, users' credentials may still be exposed to interception or man-in-the-middle attacks.

With HTTP Basic Access Authentication, the browser sends the Authorization header with the necessary credentials for each request to protected resources within the same domain. This provides a smoother user experience, without repeatedly entering the username and password. But, as each website maintains its own usernames and passwords, users may find it difficult to remember their credentials.

This authentication mechanism is obsolete for modern websites.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F10e83d0a-8fb5-42f6-abeb-a5e8980450c3_1600x1275.png)



## Session-Cookie Authentication

Session-cookie authentication addresses HTTP basic access authentication's inability to track user login status. A session ID is generated to track the user's status during their visit. This session ID is recorded both server-side and in the client’s cookie, serving as an authentication mechanism. It is called a session-cookie because it is a cookie with the session ID stored inside. Users must still provide their username and password initially, after which the server creates a session for the user's visit. Subsequent requests include the cookie, allowing the server to compare client-side and server-side session IDs.

Let’s see how it works:

1.  The client sends a request to access a protected resource on the server. If the client has not yet authenticated, the server responds with a login prompt. The client submits their username and password to the server.
    
2.  The server verifies the provided credentials against its user database or authentication service. If the credentials match, the server generates a unique session ID and creates a corresponding session in the server-side storage (e.g., server memory, database, or session server).
    
3.  The server sends the session ID to the client as a cookie, typically with a Set-Cookie header.
    
4.  The client stores the session cookie.
    
5.  For subsequent requests, it sends the cookie along with the request headers.
    
6.  The server checks the session ID in the cookie against the stored session data to authenticate the user.
    
7.  If validated, the server grants access to the requested resource. When the user logs out or after a predetermined expiration time, the server invalidates the session, and the client deletes the session cookie.
    



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9b3002be-d4f2-489c-99cd-f789012d76dc_1600x1173.png)

