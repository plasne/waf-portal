# Web Application Firewall Portal Demo

This project shows a demo portal that could be used for a WAF product. All data is randomly generated and not all buttons work.

## Hosting

The easiest deployment is to Azure Web Apps for Linux. Choose Node.js as the stack and then you can push the code using git.

If you are going to host the code somewhere else, you can:

1. Install [Node.js](https://nodejs.org/en/)
2. Install the dependencies by: npm install
3. Run by: node server.js (or in some cases sudo node server.js, or on Ubuntu nodejs server.js)

## Manifest

* client - folder containing all files that will be fed to a browser.
  * flags - folder containing country flag images.
  * img - folder containing other images.
  
  * app.js, app.css - common code and style used by all application pages (applications.html, create.html, logs.html, violations.html, visualize.html).
  * applications.html, applications.js, applications.css - page, code, and style for the list of applications.
  * create.html, create.js, create.css - page, code, and style for the creation of an application.
  * logs.html, logs.js, logs.css - page, code, and style for the logs page.
  * violations.html, violations.js, violations.css - page, code, and style for the list of violations.
  * visualize.html, visualize.js, visualize.css - page, code, and style for the visualization page.
  
  * content.js, content.css - common code and style used by all content pages (default.html, signup.html).
  * default.html, default.js, default.css - page, code, and style for the home page.
  * signup.html, signup.js, signup.css - page, code, and style for the signup page.
  
* server.js - the code for backend services.
* package.json - the package file for npm (dependencies).
* process.json - a process file if hosting using PM2 (for example, Azure Web Apps for Linux).

## Navigating

From the Default page, you can:

* Click on Login to get to the Applications page (list of applications).
* Click on Sign Up to get to the Sign Up page.

From the Applications page, you can:

* Click on any application name to get to the Visualize page (metrics, threats, traffic).
* Click on the link at the top to get to the Create page.
* Click on the menu icon to navigate all application pages. Logout takes you back to the Default content page.

From the Visualize page, you can:

* Click on any of the metric blocks to go to the logs page filtered to:
  * Protection - status = blocked, data for last hour.
  * Availability - response code = 500, data for the last hour.
  * Response - response time > 30ms, data for the last hour.
* Click on any slice of Threats by Type to go to the Violations page filtered to the selected violation.
* Click on any slice of Threats by Country to go to the Logs page filtered to: status = blocked, country = selected, data for the last week.
* Click on any of the traffic tabs to view the appropriate chart.
* Click on the menu icon to navigate all application pages. Logout takes you back to the Default content page.

From the Logs page, you can:

* Change any parameters and click Query to view the results. Note that not all filters do something for the demo (the page provides specific details at the top).
* Click on any row to view details.
  * The "allow/block" button is disabled for the demo.
  * The "lookup violations" button goes to the Violations page filtered to the violations that entry was subject to.
  * The "block origin country" button is disabled for the demo.
  * The "block source IP" button is disabled for the demo.
* Click on the menu icon to navigate all application pages. Logout takes you back to the Default content page.

From the Violations page, you can:
* Click on the desired mode, but this does nothing on the backend.
* The "config" button is disabled for the demo.
* The "lookup" button goes to the Logs page filtered to: violations = selected, data for last week.
* Click on the menu icon to navigate all application pages. Logout takes you back to the Default content page.
