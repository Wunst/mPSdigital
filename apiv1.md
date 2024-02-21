## Group API

### GET /group

List of groups

#### Request body
No data

#### Response
200
```json
{
  "groups": [
    {
      "id": "number",
      "name": "string",
      "onlinePinboard": "string",
      "projectType": "mPS | Herausforderung",
      "startDate": "date",
      "endDate": "date"
    }
  ]
}
```

### GET /informationsGroup

Informations about group

#### Request body

```json
{
  "id": "number"
}
```

#### Response

200, 403, 404

See above for group object structure

### POST /createGroup

Create group

#### Request body

```json
{
  "name": "string",
  "projectType": "mPS | Herausforderung"
}
```

#### Response

201, 403 (not allowed, already in group)

### PUT /joinGroup

Join group or add student to group (as teacher)

#### Request body

```json
{
  "username": "string",
  "group": "number"
}
```

Students must supply their own username

#### Response

200 Success

404 Group or student not found

403 for student: not allowed to add a different person to group; for teacher: user is not a student

409 student already in group