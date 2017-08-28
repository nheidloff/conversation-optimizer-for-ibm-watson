# Conversation Optimizer for IBM Watson

The Conversation Optimizer for IBM Watson is a tool for developers to optimize the user experiences of their bots implemented via [Watson Conversation](https://www.ibm.com/watson/developercloud/conversation.html).
The tool reads all conversations of a workspace and provides different filters to find conversation flows that have potential issues and might require improvements.

Filters:

* Conversations with dialog errors
* Conversations with unfulfilled intents
* Conversations with low confidence levels for intents
* Conversations with out of scope user input
* To be done: Conversations with negative user sentiment

Try out the [online](https://conversation-optimizer-for-ibm-watson.mybluemix.net/) version yourself.

Check out the [screenshots](https://github.com/nheidloff/conversation-optimizer-for-ibm-watson/tree/master/screenshots) for more details. This is the view with all conversations:

![Conversation Optimizer for IBM Watson](https://github.com/nheidloff/conversation-optimizer-for-ibm-watson/raw/master/screenshots/all.png "Conversation Optimizer for IBM Watson")

Authors: 

* Niklas Heidloff [@nheidloff](http://twitter.com/nheidloff)
* Ansgar Schmidt [@ansi](https://twitter.com/ansi)


# Setup on Bluemix

You can deploy the Conversation Optimizer either via 'Deploy to Bluemix' button or by pushing it from your local environment.


### Deploy to Bluemix Button

The easiest way to deploy the Conversation Optimizer to Bluemix is to press this button.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/nheidloff/conversation-optimizer-for-ibm-watson)

You can bind a Watson Conversation service to the Cloud Foundry application. In this case the Watson user name and password are read from the VCAP environment variable and don't have to be entered manually. You can bind the service to the application either in the [Bluemix user interface](https://console.bluemix.net/dashboard/apps) or via the following commands.

```bash
cf login
cf services
cf bind-service conversation-optimizer-for-ibm-watson my-conversation-service-name
```


### Deploy from local Environment

> Edit manifest.yml to point to your own application

```bash
git clone https://github.com/nheidloff/conversation-optimizer-for-ibm-watson.git
cd conversation-optimizer-for-ibm-watson
npm install
typings install
npm run build:prod
cf login
cd node
cf push
```


# Local Setup

You can run the Conversation Optimizer either via Webpack or Node.

Rather than defining the Watson Conversation credentials and workspace ID every time when the application is started, you can define this information in src/assets/config.json when running locally.


### Run locally via Webpack Dev Server

```bash
git clone https://github.com/nheidloff/conversation-optimizer-for-ibm-watson.git
cd conversation-optimizer-for-ibm-watson
npm install
typings install
npm start
```
Go to [http://localhost:3000](http://localhost:3000) in your browser


### Run locally via Node Express

```bash
git clone https://github.com/nheidloff/conversation-optimizer-for-ibm-watson.git
cd conversation-optimizer-for-ibm-watson
npm install
typings install
npm run build:prod
cd node
npm install
node server-local.js
```
Go to [http://localhost:6023](http://localhost:6023) in your browser


# Contributions

Create [issues](https://github.com/nheidloff/conversation-optimizer-for-ibm-watson/issues) or pull requests with your desired changes.