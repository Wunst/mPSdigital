## API

All endpoints are relative to `/api`.

## Authentication

### ![POST](https://img.shields.io/badge/POST-blue) `/login`

Start login session with username and password

#### Request body
```json
{
  "username": "string",
  "password": "string"
}
```

#### Response
Status code | Meaning
----------- | -------
200         | Logged in (response includes Set-Cookie header with session cookie)
401         | Invalid username or password

### ![GET](https://img.shields.io/badge/GET-green) `/logout`

Log out current login session

#### Request body
No data

#### Response
200


## Account API

### ![GET](https://img.shields.io/badge/GET-green) `/account`

Information about the logged in user

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ✔️

#### Request body
No data

#### Response
200

```json
{
  "username": "string",
  "role": "student | teacher | admin",
  "changedPassword": "boolean",
  "group": "number" // nullable
}
```

### ![GET](https://img.shields.io/badge/GET-green) `/account/settings`

Get account settings (arbitrary JSON set by frontend)

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ✔️

#### Request body
No data

#### Response
200

Arbitrary JSON previously set (default: `{}`)

### ![PUT](https://img.shields.io/badge/PUT-purple) `/account/settings`

Set account settings (arbitrary JSON).

**Warning!** This **replaces** the settings object. You need to send the entire settings object, not only the changed parts.

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ✔️

#### Request body

Arbitrary JSON

#### Response
200

### ![POST](https://img.shields.io/badge/POST-blue) `/account/changePassword`

Change own password

Requires confirmation via old password.

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ✔️

#### Request body
```json
{
  "old": "string",
  "new": "string"
}
```

#### Response
Status code | Meaning
----------- | -------
200         | Changed password
403         | Old password invalid
422         | New password is insecure

## User API

### ![GET](https://img.shields.io/badge/GET-green) `/user`

List users

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ❌

#### Request body
No data

#### Response
200
A JSON array of usernames and roles

### ![GET](https://img.shields.io/badge/GET-green) `/user/{username}`

Information about some user

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ❌

#### Request params

Name     | Required | Description
-------- | -------- | -----------
username | yes      | Name of the user you want to get info about

#### Request body
No data

#### Response
Status code | Meaning
----------- | -------
200         | Response includes user info (see below)
404         | No user with name

200
```json
{
  "username": "string",
  "role": "student | teacher | admin",
  "form": "string",
  "group": "number", // nullable
  "generalParentalCosent": "boolean",
  "specialParentalCosent": "boolean",
}
```

### ![POST](https://img.shields.io/badge/POST-blue) `/user/{username}`

Create a new user and put a student into a form

User will have a default password equal to username.

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️*
Student | ❌

*Only if target is a Student

#### Request params

Name     | Required | Description
-------- | -------- | -----------
username | yes      | Name of the user you want to update

#### Request body
```json
{
  "role": "student | teacher | admin",
  // only for student necessary
  "form": "string",
}
```

#### Response
Status code | Meaning
----------- | -------
201         | Created
409         | User with that name exists
403         | Teacher not allowed to create teacher or admin
404        | Student without form not allowed

### ![PATCH](https://img.shields.io/badge/PATCH-yellow) `/user/{username}`

Update user info

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️*
Student | ❌

*Only if target is a Student

#### Request params

Name     | Required | Description
-------- | -------- | -----------
username | yes      | Name of the user you want to update

#### Request body
```json
{
  "username": "string", // optional
  "role": "student | teacher | admin", // optional
  "generalParentalConsent": "boolean", // optional
}
```

#### Response
Status code | Meaning
----------- | -------
200         | User info updated
404         | No user with name
403         | Teacher not allowed to change teacher or admin

### ![DELETE](https://img.shields.io/badge/DELETE-red) `/user/{username}`

Delete a user

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️*
Student | ❌

*Only if target is a Student

#### Request params

Name     | Required | Description
-------- | -------- | -----------
username | yes      | Name of the user you want to delete

#### Request body
No data

#### Response
Status code | Meaning
----------- | -------
200         | User deleted
404         | No user with name
403         | Teacher not allowed to delete teacher or admin

### ![POST](https://img.shields.io/badge/POST-blue) `/user/{username}/passwordReset`

Reset password for user

User will have a default password equal to username.

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️*
Student | ❌

*Only if target is a Student

#### Request params

Name     | Required | Description
-------- | -------- | -----------
username | yes      | Name of the user you want to delete

#### Request body
No data

#### Response
Status code | Meaning
----------- | -------
200         | Password reset
404         | No user with name
403         | Teacher not allowed to reset password of teacher or admin

## Group API

### ![GET](https://img.shields.io/badge/GET-green) `/group`

List groups

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ✔️

#### Query string params

Name     | Required | Description
-------- | -------- | -----------
form     | optional | Only show groups with at least one student in this form

#### Request body
No data

#### Response
200
A JSON array of group IDs

### ![GET](https://img.shields.io/badge/GET-green) `/group/{id}`

Information about group

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ✔️

#### Request params

Name     | Required | Description
-------- | -------- | -----------
id       | yes      | ID of the group you want to get info about

#### Request body
No data

#### Response
Status code | Meaning
----------- | -------
200         | Response includes user info (see below)
404         | No group with ID

200
```json
{
  "id": "number",
  "name": "string",
  "type": "mPS" | "herausforderung",
  "onlinePinboard": "string",
  "startDate": "date",
  "endDate": "date", // nullable
  "members": [
    // User
  ]
}
```

### ![POST](https://img.shields.io/badge/POST-blue) `/group`

Create a new group

A student can only create a new group if not already in a currently active group. They will automatically be added to the new group.

A teacher or admin can create as many groups as they want and won't be added to the new group.

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ✔️

#### Request body
```json
{
  "name": "string",
  "type": "mPS" | "Herausforderung",
  "startDate": "date",
  "endDate": "date", // optional
  "onlinePinboard": "string", // optional
}
```

#### Response
Status code | Meaning
----------- | -------
201         | Created
403         | Missing student entry or student is already in a group

### ![PUT](https://img.shields.io/badge/PUT-purple) `/group/{id}/{username}`

Add a student to a group

Only students may be added to a group. A student may only add themselves, not another student, to a group.

A teacher or admin can add any student to any group, provided they are not already in one.

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ✔️

#### Request params

Name     | Required | Description
-------- | -------- | -----------
id       | yes      | ID of group you want to add to
username | yes      | Name of user to add

#### Request body
No data

#### Response
Status code | Meaning
----------- | -------
200         | Response includes user info (see below)
403         | Student not allowed to add other student
404         | No group with ID or no student with name
409         | User is not a student or already in a group

### ![PUT](https://img.shields.io/badge/PUT-purple) `/group/{id}/{username}/specialConsent`

Add special parental consent for user in group

Special parental consent can only be added for the current group

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ❌

#### Request params

Name     | Required | Description
-------- | -------- | -----------
id       | yes      | ID of group you want to add to
username | yes      | Name of user to add consent for

#### Request body
No data

#### Response
Status code | Meaning
----------- | -------
200         | Consent added
403         | Group is not current
404         | No group with ID, no student with name or student not in group

### ![DELETE](https://img.shields.io/badge/DELETE-red) `/group/{id}/{username}/specialConsent`

Remove special parental consent for user in group

Special parental consent can only be removed for the current group

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ❌

#### Request params

Name     | Required | Description
-------- | -------- | -----------
id       | yes      | ID of group you want to add to
username | yes      | Name of user to add consent for

#### Request body
No data

#### Response
Status code | Meaning
----------- | -------
200         | Consent removed
403         | Group is not current
404         | No group with ID, no student with name or consent does not exist

### ![PATCH](https://img.shields.io/badge/PATCH-yellow) `/group/{id}`

A teacher or admin can update every group.

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ❌

#### Request params

Name     | Required | Description
-------- | -------- | -----------
id       | yes      | ID of group you want to update

#### Request body
```json
{
  "name": "string", // optional
  "type": "mPS" | "herausforderung", // optional
  "onlinePinboard": "string", // optional
  "startDate": "date", // optional
  "endDate": "date", // optional
}
```

#### Response
Status code | Meaning
----------- | -------
200         | Group is updated
401         | Group does not exist


### ![DELETE](https://img.shields.io/badge/DELETE-red) `/group/{id}/{username}`

Remove a student from a group

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ❌

#### Request params

Name     | Required | Description
-------- | -------- | -----------
id       | yes      | ID of group you want to remove user from
username | yes      | Name of user to remove

#### Request body
No data

#### Response
Status code | Meaning
----------- | -------
200         | Student removed
404         | No student or no group

## Excursion API

### ![GET](https://img.shields.io/badge/GET-green) `/excursion`

List excursions

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ✔️*

*Will only list own excursions

#### Request body
No data

#### Response
A JSON array of objects like this: 
200
```json
{
  "id": "number",
  "date": "date",
  "description": "string",
  "status": "pending | accepted | denied",
  "group": {
            "id": "number",
            "name": "string"
        }
}
```

### ![GET](https://img.shields.io/badge/GET-green) `/excursion/{id}`

Information about excursion

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ✔️*

*Only own excursions

#### Request params

Name     | Required | Description
-------- | -------- | -----------
id       | yes      | ID of the excursion

#### Request body
No data

#### Response
Status code | Meaning
----------- | -------
200         | Response includes excursion info (see below)
404         | No excursion with ID
403         | Not the excursion of the student

200
```json
{
  "id": "number",
  "group": "number",
  "date": "date",
  "description": "string",
  "status": "pending | accepted | denied"
}
```

### ![POST](https://img.shields.io/badge/POST-blue) `/excursion`

Create a new excursion

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ❌
Teacher | ❌
Student | ✔️*

*Only for own group

#### Request body
```json
{
  "group": "number",
  "date": "date",
  "description": "string"
}
```

#### Response
Status code | Meaning
----------- | -------
201         | Created
403         | Tried to create excursion for other group or group does not exist

### ![PATCH](https://img.shields.io/badge/PATCH-yellow) `/excursion/{id}`

Update excursion

Only used by teachers to approve/deny excursions. Description and other info cannot be changed currently.

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ❌

#### Request params

Name     | Required | Description
-------- | -------- | -----------
id       | yes      | ID of the excursion

#### Request body
```json
{
  "status": "pending | accepted | denied" // optional
}
```

#### Response
Status code | Meaning
----------- | -------
200         | Excursion info updated
404         | No excursion with ID

### ![DELETE](https://img.shields.io/badge/DELETE-red) `/excursion/{id}`

Delete excursion

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ✔️*

*Only own excursions

#### Request params

Name     | Required | Description
-------- | -------- | -----------
id       | yes      | ID of the excursion

#### Request body
No data

#### Response
Status code | Meaning
----------- | -------
200         | Excursion deleted
404         | No excursion with ID
403         | Student tried to delete excursion from other group

## Form API

### ![POST](https://img.shields.io/badge/POST-blue) `/form`

Create a new form

Only a teacher or admin can create as many forms as they want. The created form can has students, if added to request body.

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ❌

#### Request body
```json
{
  "name": "string",
  "students": ["string"] // optional,
}
```
##### Warning
User wich do not exist or are no students will be skipped.

#### Response
Status code | Meaning
----------- | -------
201         | Created

### ![POST](https://img.shields.io/badge/POST-blue) `/form/{name}/archive`

Archive a form

Only a teacher or admin can archive as many forms as they want.

The current year will be added to the name of the form

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ❌

#### Response
Status code | Meaning
----------- | -------
201         | Archived
404         | Form does not exist

### ![PUT](https://img.shields.io/badge/PUT-purple) `/form/{name}/{username}`

Add a student to a form

Only students may be added to a form.

Only a teacher or admin can add any student to any form, provided they are not already in one.

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ❌

#### Request params

Name     | Required | Description
-------- | -------- | -----------
name     | yes      | Name of form you want to add to
username | yes      | Name of user to add

#### Request body
No data

#### Response
Status code | Meaning
----------- | -------
200         | Student added to form
404         | No form with name or no student with name
409         | User is not a student or already in a form


### ![GET](https://img.shields.io/badge/GET-green) `/form`

List forms

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ✔️

#### Request body
No data

#### Response
200
A JSON array of names from the forms

### ![GET](https://img.shields.io/badge/GET-green) `/form/{name}`

List of the students in a form for teacher and admin.

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ❌

#### Request params

Name     | Required | Description
-------- | -------- | -----------
name     | yes      | Name of form you want to add to

#### Request body
No data

#### Response
200
A JSON array of usernames