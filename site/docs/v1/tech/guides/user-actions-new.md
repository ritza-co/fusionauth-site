- [Questions for QA / Editor and my todos](#questions-for-qa--editor-and-my-todos)
- [Introduction](#introduction)
- [Definitions](#definitions)
- [What Triggers an Action?](#what-triggers-an-action)
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
  - [Creating a User Action via the API (create both types)](#creating-a-user-action-via-the-api-create-both-types)
  - [Setting up a Webhook -- why? so we can feed the subscription and happiness info into our other systems? have an audit trail?](#setting-up-a-webhook----why-so-we-can-feed-the-subscription-and-happiness-info-into-our-other-systems-have-an-audit-trail)
  - [Set up the Email](#set-up-the-email)
  - [Executing the User Action (execute both)](#executing-the-user-action-execute-both)
    - [Webhook Example](#webhook-example)
    - [Show example of email](#show-example-of-email)
  - [Querying Action Status on a User (query both) and explain why you'd do this](#querying-action-status-on-a-user-query-both-and-explain-why-youd-do-this)
- [Localization -- extract all the localization stuff to here](#localization----extract-all-the-localization-stuff-to-here)
- [Further reading](#further-reading)

## Questions for QA / Editor and my todos
- is it ok to refer to User Actions as Actions throughout
- insert screenshots

## Introduction
User Actions in FusionAuth are ways to interact with, reward, and discipline users. For example, you could use them to temporarily disable a user's login, email a user, or call another application when a certain event occurs.

In this guide we'll refer to User Actions just as Actions. In the first half you'll learn about all the parts related to an Action and the sequences of events. In the second half you'll learn ways to create and apply different types of Actions.

## Definitions
Below are all the terms you'll encounter when working with Actions. They are listed in order of understanding, not alphabetically.

- Action — Can be created on FusionAuth at **Settings**—**User Actions**. It has three main parts:
  - the event, or condition, that triggers the action,  (TODO review)
  - the user on whom the action is taken,
  - and the action itself (running some code or sending a notification).
- Actionee — The user on whom Action is taken.
- Actioner — The user that applies the Action. Every Action has to have an Actioner, even if the Action is automatically generated.
- Reason — A text description of why an Action was taken. You don't have to set a Reason when applying an Action, but it's useful for auditing. Reasons can be created on FusionAuth at **Settings**—**User Actions** by clicking the **Reasons** button at the top right.
- Webhook — A webhook is another name for sending a single HTTP request to an API. It's used to inform an external system of some event, and can be triggered by an Action. An example is FusionAuth calling a customer-support service, like [Intercom](https://intercom.com), to start the customer onboarding email process when the user has verified their email in FusionAuth. Webhooks can be managed in FusionAuth at **Settings** — **Webhooks**.

    Note that web companies, including FusionAuth, call a trigger to _send_ data a _webhook_, but when they _receive_ data they call it an _API_. So if you're looking for a destination for a FusionAuth webhook in an external system, you won't find it under their webhook documentation; you'll find it under API documentation. This is why they are sometimes known as a _reverse API_.
- Temporal Actions — Temporal, or time-based, Actions have a duration, as opposed to instantaneous Actions. Once expired, a temporal Action will no longer be considered active and will not affect the user. However, you can apply a temporal Action to a user indefinitely by setting a very distant end date. An Action that prevents login must be temporal.

    A temporal Action may be cancelled or modified, unlike an instantaneous Action, which cannot be. An example of an instantaneous Action would be a reward, such as sending a user a discount coupon.
- Option — A custom field that you can add to an instantaneous Action. Temporal Actions cannot have Options. Options can be sent through emails or webhooks. Why do they not have name/value pairs?? why can't temporal actions have option?
- Localization — A text field with an associated language. It's a way of providing more information about an Action name, Reason, or Option to users and administrators who speak different languages. They might be sent in an email or through a webhook to people and systems outside FusionAuth.
- Tenant — An Action can be used for all tenants or just a few. Below is a visual reminder of [Tenants, Groups, and Applications](https://fusionauth.io/docs/v1/tech/core-concepts/).

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
- Broadcast?
- moar

## What Triggers an Action?

## Types of Actions
Add a table of the types:
Type | Use | example
Time based | When you want to apply something for a given period of time. | subscription access, forum ban
Option based | When you want to apply certain value to a user, recording who did so, perhaps with comments | user surveyed and was happy/frustrated/indifferent

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
- [User Actions](https://fusionauth.io/docs/v1/tech/apis/user-actions) — Defines an action, updates it, and deletes it.
- [Applying User Actions](https://fusionauth.io/docs/v1/tech/apis/actioning-users) —  Applies an existing Action to a User. Can also update or cancel the Action.
- [User Action Reasons](https://fusionauth.io/docs/v1/tech/apis/user-action-reasons) — Attaches the reason the Action was taken to the Action. Having a Reason is optional.

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