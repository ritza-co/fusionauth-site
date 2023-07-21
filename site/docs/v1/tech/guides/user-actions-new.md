- [Introduction](#introduction)
- [Definitions](#definitions)
- [Types of Actions](#types-of-actions)
  - [Temporal Actions](#temporal-actions)
    - [Temporal action](#temporal-action)
  - [Option Based](#option-based)
    - [Option based action](#option-based-action)
- [The Sequence of Events of an Action](#the-sequence-of-events-of-an-action)
- [What Happens After a User Action](#what-happens-after-a-user-action)
  - [Webhooks](#webhooks)
  - [Emails to the actioned user](#emails-to-the-actioned-user)
- [Creating Actions](#creating-actions)
  - [Using the FusionAuth Administration Website](#using-the-fusionauth-administration-website)
  - [Creating an API key](#creating-an-api-key)
  - [APIs](#apis)
  - [Action parameters](#action-parameters)
  - [Action instance parameters](#action-instance-parameters)
  - [Action Reason parameters](#action-reason-parameters)
  - [Creating a User Action via the API (create both types)](#creating-a-user-action-via-the-api-create-both-types)
  - [Setting up a Webhook -- why? so we can feed the subscription and happiness info into our other systems? have an audit trail?](#setting-up-a-webhook----why-so-we-can-feed-the-subscription-and-happiness-info-into-our-other-systems-have-an-audit-trail)
  - [Set up the Email](#set-up-the-email)
  - [Executing the User Action (execute both)](#executing-the-user-action-execute-both)
    - [Webhook Example](#webhook-example)
    - [Show example of email](#show-example-of-email)
  - [Querying Action Status on a User (query both) and explain why you'd do this](#querying-action-status-on-a-user-query-both-and-explain-why-youd-do-this)
- [Localization -- extract all the localization stuff to here](#localization----extract-all-the-localization-stuff-to-here)
- [Further reading](#further-reading)
- [Todos](#todos)
- [What Can You Use Actions For?](#what-can-you-use-actions-for)
- [What Triggers an Action?](#what-triggers-an-action)

## Introduction
User Actions in FusionAuth are ways to interact with, reward, and discipline users. For example, you could use them to email a user, call another application when a user does something, or temporarily disable a user's login.

This guide refers to User Actions simply as Actions. In the first section you'll learn about all the parts of an Action and their sequences of events. In the second section you'll learn ways to create and apply different types of Actions.

## Definitions
Below are the terms you'll encounter when working with Actions. They are listed in order of understanding, not alphabetically.

- Action — Can be created on FusionAuth at **Settings**—**User Actions**. An Action is a state or event that can be applied to User in the future. It is reusable for many Users in many Applications. The actual application of the Action to a specific User is called an Action instance. (This is similar to programming, where you have classes (definitions) and objects (instances)).

    At its most simple, an Action is just a name, and an Action instance comprises: one User applying the Action to another User, the time of the Action, and the name of the Action.
- Actionee — The user on whom Action is taken.
- Actioner — The user that applies the Action. Every Action has to have an Actioner, even if the instance is automatically applied, in which case the Actioner can be set to the Application's administrator.
- Reason — A text description of why an Action was taken. You don't have to set a Reason when applying an Action, but it's useful for auditing. Reasons can be created on FusionAuth at **Settings**—**User Actions** by clicking the **Reasons** button at the top right.
- Webhook — A webhook is another name for sending a single HTTP request to an API. It's used to inform an external system of some event, and can be triggered by an Action. An example is FusionAuth calling a customer-support service, like [Intercom](https://intercom.com), to start the customer onboarding process when the user has verified their email in FusionAuth. Another example would be posting a message to a [Slack](https://slack.com) channel whenever a new customer signs up. Webhooks can be managed in FusionAuth at **Settings** — **Webhooks** and can be triggered by Actions.

    The webhook/API terminology can be confusing. Note that most web companies, including FusionAuth, call a trigger to _send_ data a _webhook_, but when they _receive_ data they call it an _API_. So if you're looking for a destination for a FusionAuth webhook in an external system, you won't find it under their webhook documentation; you'll find it under API documentation. This is why they are sometimes known as a _reverse API_. However, some companies, like [Slack](https://api.slack.com/messaging/webhooks), also call incoming requests "incoming webhooks".
- Temporal Actions — Temporal, or time-based, Actions have a duration, as opposed to instantaneous Actions, which have only a start time. Once a temporal Action expires, meaning that it ends automatically, it will no longer be considered active and will not affect the user. However, you can apply a temporal Action to a user indefinitely by setting a very distant end date. An Action that prevents login must be temporal.

    A temporal Action may be cancelled or modified, unlike an instantaneous Action, which cannot be. An example of an instantaneous Action would be a reward, such as sending a user a discount coupon.
- Active — An active Action can be applied to Users. In contrast, an inactive Action is like a deleted Action, meaning it cannot be applied, but it is still viewable in the list of inactive Actions in FusionAuth. An inactive Action can be reactivated if you want to use it again.

    If a temporal Action instance has ended we do not say it is inactive. _Active_ relates to the Action definition, and _expiry_ relates to a particular instance of the Action.
- Option — A custom text field that you can add to an instantaneous Action, but not to temporal Actions. You can add multiple options to an Action definition, but choose only one for an instance of the Action. Options can be sent through emails and webhooks.
- Localization — A text field with an associated language. It's a way of providing more information to users and administrators who speak different languages. Localizations can be added for an Action name, Reason, and Options.
- Tenant — You can make an Action available to all Tenants or just a few. Below is a visual reminder of [Tenants, Groups, and Applications](https://fusionauth.io/docs/v1/tech/core-concepts/).

    ```mermaid
    flowchart BT
        User-->Tenant
        Application-->Tenant
        Group-->Tenant
        Role-->Application
        User-->Group
        Registration-->User
        Registration-->Application
        User-->Role
        Entity-->Application
    ```

## Types of Actions
There are two main types of Actions: temporal Actions and instantaneous Actions with options. They are summarized below.

| Type | Purpose | Example of use
| ----------- | ----------- | -----------
| Temporal | When you want to apply a state to a user for a period of time. | Subscription access · Expiring software trial · Forum ban
| Options | When you want to apply a state to a user at a single point in time, recording who did so, perhaps with comments. | User surveyed by another user and was happy/indifferent/frustrated · User has earned a sufficient level of trust on your forum and been given an award (possibility increasing their access rights)

FusionAuth's primary purpose is to simplify authentication (verifying a user's identity) and authorization (giving your app a user's roles). Actions are an additional feature that you might want to use in your app. They are in effect a premade way for you to store extra user fields in FusionAuth instead of your own database, at a specified time, and notify people or systems if these fields change. Since FusionAuth has no way to receive payments, and no automated subscription features, you need to decide carefully whether you want to write the code you need to manage such features in FusionAuth using Actions, or in your own app without using Actions, or using an entirely external system that specializes in that work if your needs are very complex.


And an explanation of how you use these in general:

create a user action
apply it to users via the API or admin UI (actioning)



### Temporal Actions
add a diagram of the flow:
started -> modified (could loop to this) -> ended
\ (or)
---> cancelled

#### Temporal action
Example of the subscription from the blog.

### Option Based
Option
add a diagram of the flow: added -> removed

#### Option based action
Another example. How about an option that records interaction with a user and a customer service rep, assigns it a impact rating (high, medium, low) and includes a comment.

## The Sequence of Events of an Action

## What Happens After a User Action
nothing, just a record that it happened and who did it.

### Webhooks

### Emails to the actioned user

## Creating Actions
Tell a story here (or introduce it above and expand on it below). You already have the subscription example, so let's tell the story of Pied Piper expanding into media and building out both a subscription and a lightweight user happiness system for their customer service agents. Goal is to make it like this: https://fusionauth.io/docs/v1/tech/guides/multi-tenant in terms of telling a real world story.

### Using the FusionAuth Administration Website
You can create an Action on the website at **Settings** — **User Actions**.
![Creating an Action on the website](../../../../assets/img/docs/guides/user-actions/user-actions-edit-email.png)
But to apply an Action to a User you cannot use the website. It can be done only using the APIs.

### Creating an API key

### APIs
Three separate APIs manage Actions. Each has its own documentation.
- [Actions](https://fusionauth.io/docs/v1/tech/apis/user-actions) — Defines an Action, updates it, and deletes it. The API path is `/api/user-action`.
- [Action instances](https://fusionauth.io/docs/v1/tech/apis/actioning-users) — Applies an existing Action to a User. Can also update or cancel the Action instance. The API path is `/api/user/action`.
- [Action Reasons](https://fusionauth.io/docs/v1/tech/apis/user-action-reasons) — Attaches the reason the Action was taken to the Action. Having a Reason is optional. The API path is `/api/user-action-reason`.

Actions and Actions Reasons can be managed on the FusionAuth website. Only Action instances require you to use their API — you cannot apply an Action to a User on the website.

The API documentation is long, and repeats the same parameters for each type of request. For easier understanding, the parameters listed there are grouped and summarized below for each API. Parameters, such as Ids and names, whose purpose is obvious from the earlier [Definitions](#definitions) section are not described.

### Action parameters
These are used when creating an Action definition.
- `userActionId`
- `name`, `localizedNames`
- `startEmailTemplateId`, `cancelEmailTemplateId`, `modifyEmailTemplateId`, `endEmailTemplateId`, — The Id of the email template that is used when the Action starts, is cancelled, is modified, or expires. Temporal Actions have all four events, whereas instantaneous actions have only the start event.
- `includeEmailInEventJSON` — Whether to include the email information in the JSON that is sent to the webhook when a user action is taken.
- `options`, `options[x].name`, `options[x].localizedNames`
- `preventLogin` — User may not log in if true until the Action expires.
- `sendEndEvent` — Whether to call webhooks when this Action instance expires.
- `temporal` — if the Action is temporal.
- `userEmailingEnabled`, `userNotificationsEnabled` — notify doesn't contact the user, it just adds a `notifyUser` field to JSON sent to webhooks.

### Action instance parameters
These are used when applying an Action to a User.
- `userActionId`
- `actioneeUserId`
- `actionerUserId`
- `applicationIds` — The Action can be applied to the User for multiple Applications.
- `broadcast` — Should the Action trigger webhooks
- `comment` — A note by the actioner if they want to add information in addition to the Reason.
- `emailUser` — Should the user be emailed at instance creation.
- `expiry` — Time after which this temporal Action should end.
- `notifyUser` — Should the literal text value, "`notifyUser`", be sent to webhooks, for them to act on as they wish.
- `option` — The option the Actioner chose for this instance of the Action.
- `reasonId`

### Action Reason parameters
These are used when creating an Action Reason.
- `userActionReasonId`
- `text`, `localizedTexts` — The description of the Reason that a human can understand, possibly in many languages.
- `code` — A short text string to categorize the Reason for software to process.

### Creating a User Action via the API (create both types)

### Setting up a Webhook -- why? so we can feed the subscription and happiness info into our other systems? have an audit trail?

### Set up the Email
Set up sending a thank you email to the user when their interaction has been recorded.

An Email Template for Actions can be created in the FusionAuth website at **Customizations** - **Email Templates**.

### Executing the User Action (execute both)

#### Webhook Example
Show example of what webhook would look like when received and link to the webhook event documentation


#### Show example of email

### Querying Action Status on a User (query both) and explain why you'd do this

## Localization -- extract all the localization stuff to here
options
name
emails (point to email templates docs, no need to build this out entirely), but note that the email template is pulled based on the users preferred email
anything else

## Further reading

## Todos
- screenshots
- diagrams
- how do you link a specific Action to a specific Webhook? Looks like webhook definition can just have 'user action' as an event and that's it.
- what does the json that gets sent to a webhook look like
- add sections from last user actions doc
- check that all outline is in the doc that dan wanted - https://github.com/FusionAuth/fusionauth-site/pull/2223#pullrequestreview-1523177347


## What Can You Use Actions For?
temporal actions - can act as statuses flags over time - to mark subscriptions or any other state you want to keep on a user in fusionauth instead of your own app that you can check.

## What Triggers an Action?
list of all places
- multiple incorrect password entered