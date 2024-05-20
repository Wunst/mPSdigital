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


## User API

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
  "group": "number" // nullable
}
```

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

### ![GET](https://img.shields.io/badge/GET-green) `/users`

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
A JSON array of usernames

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
  "group": "number" // nullable
}
```

### ![POST](https://img.shields.io/badge/POST-blue) `/user/{username}`

Create a new user

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
}
```

#### Response
Status code | Meaning
----------- | -------
201         | Created
409         | User with that name exists

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
  "role": "student | teacher | admin" // optional
}
```

#### Response
Status code | Meaning
----------- | -------
200         | User info updated
404         | No user with name

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

## Group API

### ![GET](https://img.shields.io/badge/GET-green) `/groups`

List groups

#### Permissions
Role    | ✔️/❌
------- | -----
Admin   | ✔️
Teacher | ✔️
Student | ✔️

#### Query string params

Name     | Description
-------- | -----------
form     | Only show groups with at least one student in this form

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
  "type": "mps | herausforderung",
  "startDate": "date",
  "endDate": "date", // nullable
  "pinboard": "string",
  "members": [
    "username1",
    "username2"
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
  "type": "mps | herausforderung",
  "startDate": "date",
  "endDate": "date", // optional
  "pinboard": "string", // optional
}
```

#### Response
Status code | Meaning
----------- | -------
201         | Created

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
404         | Student not in group or no group

## Excursion API

### ![GET](https://img.shields.io/badge/GET-green) `/excursions`

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
200
A JSON array of excursion IDs

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

200
```json
{
  "id": "number",
  "group": "number",
  "date": "date",
  "description": "string",
  "state": "pending | accepted | denied"
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
403         | Tried to create excursion for other group

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
  "state": "pending | accepted | denied" // optional
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
