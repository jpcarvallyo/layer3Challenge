# layer3Challenge
Hello,

Here is my submission to the Layer 3 challenge. I appreciate all of your time reviewing my code and providing this opportunity to me. I don't take it lightly. 

I normally would use a dot.env file to manage the username, password, host, etc. for variables that are sensitive but since this is a challenge that is supposed to be brief and minimalist, I've left that out.

Here is a link to the demo I recorded for this challenge where I'm hitting the routes with Postman with my Postgresql db running on my machine.
(Part 1: https://www.loom.com/share/45649daed165486f919de74a5a5e2eb4?sid=71530b5b-4f29-4bab-829f-dee0d9b3be05)
(Part 2: https://www.loom.com/share/c4980182909a4bd0896671107e0bd365?sid=b5c6df26-6ca7-4de8-a432-4983c3657cad)

**Pros:**

**Modularity:** The code is structured using modular functions and routes, making it easy to understand and maintain. Each route handles a specific API endpoint, enhancing code organization and readability.

**Error Handling:** Proper error handling is implemented, catching any exceptions that may occur during the database queries. Error messages and appropriate HTTP status codes are returned, providing meaningful feedback to the client.

**SQL Optimization:** The code incorporates SQL optimization techniques, such as using EXISTS subqueries and aggregating functions (COUNT, SUM), to improve query performance and minimize unnecessary joins.

**Connection Pooling:** The code utilizes connection pooling with the pg library's Pool class, which helps manage and reuse database connections efficiently, enhancing performance and scalability.

**Asynchronous Operations:** The code utilizes async/await with try/catch blocks, allowing asynchronous operations to be handled in a clean and readable manner. This improves the overall responsiveness and efficiency of the application.

**Cons:**

**No Input Validation:** The code does not include input validation or sanitization for user input. It's important to validate and sanitize user inputs to prevent security vulnerabilities like SQL injection or other malicious attacks.

**Limited Error Handling Details:** While the code provides error handling, it may be beneficial to log more detailed error information for debugging purposes. This can help in identifying the root cause of errors and troubleshooting issues more effectively.

**Lack of Middleware:** The code does not utilize middleware for common tasks like request parsing, logging, or authentication. Incorporating middleware can enhance code reusability and simplify common operations across multiple routes.

**Missing Documentation:** While the code is self-explanatory to some extent, it lacks comprehensive documentation, such as inline comments, JSDoc annotations, Swagger Documentation.

**Missing ENV variable file** Due to this being a quick and minimal coding challenge, this repo doesn't have private variables in an env file. 

**Routing not in it's own folders** The routes were placed all in app.js, normally I would place these routes in a directory that I would import into app so it is much cleaner.
